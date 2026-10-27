import {
  HistoricalSalePeriod,
  InventoryLot,
  Member,
  ProductionBatch,
  FulfillmentAllocation,
  RevenueShareRecord
} from '../types';

/**
 * Algoritma Forecasting:
 * Weighted Moving Average (WMA 3 periode: bobot 3, 2, 1) + Koreksi Tren Linier
 */
export function calculateWmaForecast(history: HistoricalSalePeriod[]): {
  wmaValue: number;
  trendAdjustment: number;
  finalForecast: number;
  hasCensoredDemand: boolean;
  censoredPeriods: string[];
} {
  if (history.length < 3) {
    const avg = history.length > 0 ? history.reduce((acc, h) => acc + h.actualSalesKg, 0) / history.length : 100;
    return {
      wmaValue: Math.round(avg),
      trendAdjustment: 0,
      finalForecast: Math.round(avg),
      hasCensoredDemand: false,
      censoredPeriods: []
    };
  }

  // Ambil 3 periode terakhir [P1 (t-2), P2 (t-1), P3 (t)]
  const last3 = history.slice(-3);
  const p1 = last3[0].actualSalesKg; // bobot 1
  const p2 = last3[1].actualSalesKg; // bobot 2
  const p3 = last3[2].actualSalesKg; // bobot 3

  const wma = (1 * p1 + 2 * p2 + 3 * p3) / (1 + 2 + 3);

  // Koreksi tren linier: kemiringan antara t-2 dan t
  const trendSlope = (p3 - p1) / 2;
  const trendAdjustment = Math.round(trendSlope * 0.5); // smoothing tren

  const finalForecast = Math.max(0, Math.round(wma + trendAdjustment));

  const censoredPeriods = last3.filter((p) => p.stockoutDetected).map((p) => p.periodLabel);

  return {
    wmaValue: Math.round(wma),
    trendAdjustment,
    finalForecast,
    hasCensoredDemand: censoredPeriods.length > 0,
    censoredPeriods
  };
}

/**
 * Formula Target Tanam:
 * Rekomendasi Tanam = ⌈(Forecast Penjualan Ready + Pre-Order Aktif) / 5⌉ × 5
 * Dibulatkan ke atas kelipatan 5 untuk kepraktisan penanaman.
 */
export function calculateTargetRecommendation(forecastReadyKg: number, activePreorderKg: number): number {
  const sum = forecastReadyKg + activePreorderKg;
  return Math.ceil(sum / 5) * 5;
}

/**
 * Single-Fulfillment Priority dengan Multi-Member Fallback
 * Prioritas 1: 1 Mitra tunggal yang mencukupi dengan Best-Fit (sisa jatah terkecil yang mencukupi).
 * Prioritas 2: Multi-Member Fallback (pecah pesanan otomatis FIFO panen terlama untuk Ready, atau proporsi kuota untuk Pre-Order).
 */
export function calculateAllocationStrategy(params: {
  orderQty: number;
  productId: string;
  type: 'ready' | 'preorder';
  inventoryLots: InventoryLot[];
  batch?: ProductionBatch;
  members: Member[];
}): {
  isPossible: boolean;
  allocationType: 'Single-Fulfillment' | 'Multi-Member Split';
  fulfillments: FulfillmentAllocation[];
  reason: string;
  shortageKg: number;
} {
  const { orderQty, productId, type, inventoryLots, batch, members } = params;

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  // --- 1. READY STOCK ALLOCATION ---
  if (type === 'ready') {
    // Ambil semua lot segar / prima / segera jual untuk produk ini yang masih punya stok
    const eligibleLots = inventoryLots.filter(
      (l) => l.productId === productId && l.currentQtyKg > 0 && (l.status === 'Fresh' || l.status === 'Good' || l.status === 'Expiring')
    );

    // Agregasi stok per mitra
    const memberStockMap = new Map<string, { totalKg: number; lots: InventoryLot[] }>();
    eligibleLots.forEach((lot) => {
      const current = memberStockMap.get(lot.memberId) || { totalKg: 0, lots: [] };
      current.totalKg += lot.currentQtyKg;
      current.lots.push(lot);
      memberStockMap.set(lot.memberId, current);
    });

    // Cek Prioritas 1: Single-Fulfillment
    const singleEligible: { memberId: string; totalKg: number; excess: number }[] = [];
    memberStockMap.forEach((val, memberId) => {
      if (val.totalKg >= orderQty) {
        singleEligible.push({
          memberId,
          totalKg: val.totalKg,
          excess: val.totalKg - orderQty
        });
      }
    });

    if (singleEligible.length > 0) {
      // Best-Fit: pilih yang sisa kelebihannya paling kecil agar kapasitas mitra besar tidak terpecah untuk order kecil
      singleEligible.sort((a, b) => a.excess - b.excess);
      const chosen = singleEligible[0];
      const member = memberMap.get(chosen.memberId)!;
      const memberLots = memberStockMap.get(chosen.memberId)!.lots.sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));

      return {
        isPossible: true,
        allocationType: 'Single-Fulfillment',
        fulfillments: [
          {
            memberId: member.id,
            memberName: member.name,
            gardenName: member.gardenName,
            location: member.location,
            allocatedKg: orderQty,
            lotId: memberLots[0]?.id,
            pickupTimeWindow: 'Hari ini, 13:00 - 15:00 WIB'
          }
        ],
        reason: `Rekomendasi Best-Fit: ${member.name} (${member.gardenName}) memiliki total stok ${chosen.totalKg} kg (mencukupi ${orderQty} kg dengan efisiensi sisa ${chosen.excess} kg). Menekan ongkos jemput kurir ke 1 titik.`,
        shortageKg: 0
      };
    }

    // Cek total stok tersedia untuk fallback
    const totalAvailable = eligibleLots.reduce((acc, l) => acc + l.currentQtyKg, 0);
    if (totalAvailable < orderQty) {
      return {
        isPossible: false,
        allocationType: 'Multi-Member Split',
        fulfillments: [],
        reason: `Stok ready stock tidak mencukupi. Dibutuhkan ${orderQty} kg, namun total seluruh kebun mitra hanya ada ${totalAvailable} kg.`,
        shortageKg: orderQty - totalAvailable
      };
    }

    // Prioritas 2: Multi-Member Fallback (FIFO panen terlama lebih dulu)
    const sortedLots = [...eligibleLots].sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
    let remainingNeeded = orderQty;
    const splitAllocations: FulfillmentAllocation[] = [];

    for (const lot of sortedLots) {
      if (remainingNeeded <= 0) break;
      const allocateFromLot = Math.min(remainingNeeded, lot.currentQtyKg);
      const member = memberMap.get(lot.memberId)!;

      // Cek apakah mitra sudah tercatat di splitAllocations
      const existing = splitAllocations.find((a) => a.memberId === member.id);
      if (existing) {
        existing.allocatedKg += allocateFromLot;
      } else {
        splitAllocations.push({
          memberId: member.id,
          memberName: member.name,
          gardenName: member.gardenName,
          location: member.location,
          allocatedKg: allocateFromLot,
          lotId: lot.id,
          pickupTimeWindow: 'Hari ini, 14:00 - 16:00 WIB'
        });
      }

      remainingNeeded -= allocateFromLot;
    }

    const breakdownText = splitAllocations.map((a) => `${a.memberName} (${a.allocatedKg} kg)`).join(', ');

    return {
      isPossible: true,
      allocationType: 'Multi-Member Split',
      fulfillments: splitAllocations,
      reason: `Multi-Member Fallback: Tidak ada 1 mitra tunggal yang memiliki stok penuh ${orderQty} kg. Pesanan otomatis dipecah berdasarkan metode FIFO (panen terlama): ${breakdownText}.`,
      shortageKg: 0
    };
  }

  // --- 2. PRE-ORDER ALLOCATION ---
  // Core Rule: Pelanggan dapat memesan jika memang dapat dialokasikan (ada kuota batch atau lubang tanam kosong).
  // Prioritas Utama: Alokasikan ke 1 orang mitra tunggal (Single-Fulfillment) jika kapasitasnya cukup.
  // Fallback: Jika tidak cukup untuk 1 orang, bagi pesanan (Multi-Member Split) ke beberapa mitra hingga terpenuhi.

  const yieldPerHoleKg = 0.055; // Rata-rata standar hasil ~18 lubang/kg

  // Hitung kapasitas per mitra
  let memberQuotaList: {
    memberId: string;
    memberName: string;
    gardenName: string;
    location: string;
    availableKg: number;
    emptyHoles: number;
    batchId?: string;
  }[] = [];

  let batchEstimatedDate = 'Akhir Siklus Tanam';

  if (batch) {
    batchEstimatedDate = batch.estimatedHarvestDate;
    const remainingBatchQuota = Math.max(0, batch.totalTargetKg - batch.preorderSoldKg);

    memberQuotaList = batch.allocations.map((alloc) => {
      const member = memberMap.get(alloc.memberId);
      const emptyHoles = member ? Math.max(0, member.totalHoles - member.activeLoadHoles) : 0;
      const emptyHolesKg = Math.floor(emptyHoles * yieldPerHoleKg);
      // Kapasitas efektif mitra adalah kuota target batch ditambah lubang kosong cadangan
      const effectiveCapKg = alloc.targetKg + emptyHolesKg;

      return {
        memberId: alloc.memberId,
        memberName: member?.name || 'Mitra',
        gardenName: member?.gardenName || 'Greenhouse',
        location: member?.location || 'Bandung',
        availableKg: effectiveCapKg,
        emptyHoles,
        batchId: batch.id
      };
    });

    const totalBatchCap = memberQuotaList.reduce((acc, m) => acc + m.availableKg, 0);

    // Jika pesanan melebihi seluruh kapasitas yang bisa dialokasikan
    if (orderQty > Math.max(remainingBatchQuota, totalBatchCap)) {
      const maxAvailable = Math.max(remainingBatchQuota, totalBatchCap);
      return {
        isPossible: false,
        allocationType: 'Single-Fulfillment',
        fulfillments: [],
        reason: `Alokasi tidak dapat dilakukan! Total pesanan ${orderQty} kg melebihi kapasitas kuota batch & lubang tanam kosong yang tersedia (maksimal: ${maxAvailable} kg).`,
        shortageKg: orderQty - maxAvailable
      };
    }
  } else {
    // Jika tidak terikat batch spesifik, evaluasi dari seluruh anggota yang punya lubang tanam kosong
    memberQuotaList = members
      .map((member) => {
        const emptyHoles = Math.max(0, member.totalHoles - member.activeLoadHoles);
        const availableKg = Math.floor(emptyHoles * yieldPerHoleKg);
        return {
          memberId: member.id,
          memberName: member.name,
          gardenName: member.gardenName,
          location: member.location,
          availableKg,
          emptyHoles
        };
      })
      .filter((m) => m.availableKg > 0);

    const totalEmptyCap = memberQuotaList.reduce((acc, m) => acc + m.availableKg, 0);

    if (orderQty > totalEmptyCap) {
      return {
        isPossible: false,
        allocationType: 'Single-Fulfillment',
        fulfillments: [],
        reason: `Alokasi pre-order tidak dapat dilakukan! Seluruh lubang tanam kosong mitra hanya mampu memproduksi ${totalEmptyCap} kg (kurang ${orderQty - totalEmptyCap} kg).`,
        shortageKg: orderQty - totalEmptyCap
      };
    }
  }

  // PRIORITAS 1: ALOKASI KEPADA 1 ORANG MITRA (Single-Fulfillment)
  // Cari mitra tunggal yang kapasitasnya cukup (>= orderQty), pilih Best-Fit (kelebihan terkecil)
  const singleEligible = memberQuotaList
    .filter((m) => m.availableKg >= orderQty)
    .sort((a, b) => a.availableKg - b.availableKg);

  if (singleEligible.length > 0) {
    const chosen = singleEligible[0];
    return {
      isPossible: true,
      allocationType: 'Single-Fulfillment',
      fulfillments: [
        {
          memberId: chosen.memberId,
          memberName: chosen.memberName,
          gardenName: chosen.gardenName,
          location: chosen.location,
          allocatedKg: orderQty,
          batchId: chosen.batchId,
          pickupTimeWindow: `Estimasi Panen: ${batchEstimatedDate}`
        }
      ],
      reason: `Single-Fulfillment (1 Mitra): Seluruh pesanan ${orderQty} kg dapat dipenuhi penuh oleh 1 orang anggota binaan yaitu ${chosen.memberName} (${chosen.gardenName}, kapasitas ${chosen.availableKg} kg). Efisiensi penjemputan langsung dari 1 kebun saat panen.`,
      shortageKg: 0
    };
  }

  // PRIORITAS 2: JIKA TIDAK DAPAT DITANGANI 1 ORANG -> BAGI KE BEBERAPA MITRA (Multi-Member Split)
  // Urutkan mitra dari kapasitas terbesar ke terkecil
  const sortedMembers = [...memberQuotaList].sort((a, b) => b.availableKg - a.availableKg);
  let remainingNeeded = orderQty;
  const splitPreorders: FulfillmentAllocation[] = [];

  for (const m of sortedMembers) {
    if (remainingNeeded <= 0) break;
    if (m.availableKg <= 0) continue;

    const take = Math.min(remainingNeeded, m.availableKg);
    splitPreorders.push({
      memberId: m.memberId,
      memberName: m.memberName,
      gardenName: m.gardenName,
      location: m.location,
      allocatedKg: take,
      batchId: m.batchId,
      pickupTimeWindow: `Estimasi Panen: ${batchEstimatedDate}`
    });
    remainingNeeded -= take;
  }

  if (remainingNeeded > 0) {
    // Walaupun dibagi tetap kurang
    return {
      isPossible: false,
      allocationType: 'Multi-Member Split',
      fulfillments: splitPreorders,
      reason: `Pesanan ${orderQty} kg tidak dapat dipenuhi penuh karena total kapasitas gabungan seluruh mitra hanya mencukupi ${orderQty - remainingNeeded} kg.`,
      shortageKg: remainingNeeded
    };
  }

  const breakdown = splitPreorders.map((a) => `${a.memberName} (${a.allocatedKg} kg)`).join(', ');

  return {
    isPossible: true,
    allocationType: 'Multi-Member Split',
    fulfillments: splitPreorders,
    reason: `Multi-Member Split (Dibagi): Kebutuhan ${orderQty} kg melebihi kapasitas individual 1 orang mitra (terbesar ${sortedMembers[0]?.availableKg || 0} kg). Sesuai aturan sistem, pesanan dibagi ke ${splitPreorders.length} kebun mitra binaan: ${breakdown}.`,
    shortageKg: 0
  };
}

/**
 * Helper untuk menghitung kapasitas pre-order & lubang tanam yang tersedia
 */
export function getPreorderCapacityInfo(params: {
  batch?: ProductionBatch;
  members: Member[];
  productYieldKg?: number;
}): {
  remainingBatchQuota: number;
  totalEmptyHoles: number;
  totalEmptyHolesKg: number;
  maxSingleCapacityKg: number;
  maxOrderableKg: number;
  memberCapacities: {
    memberId: string;
    memberName: string;
    gardenName: string;
    availableKg: number;
    emptyHoles: number;
  }[];
} {
  const yieldKg = params.productYieldKg || 0.055;
  const { batch, members } = params;

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const remainingBatchQuota = batch ? Math.max(0, batch.totalTargetKg - batch.preorderSoldKg) : 0;

  let memberCapacities: {
    memberId: string;
    memberName: string;
    gardenName: string;
    availableKg: number;
    emptyHoles: number;
  }[] = [];

  if (batch) {
    memberCapacities = batch.allocations.map((alloc) => {
      const m = memberMap.get(alloc.memberId);
      const emptyHoles = m ? Math.max(0, m.totalHoles - m.activeLoadHoles) : 0;
      const emptyKg = Math.floor(emptyHoles * yieldKg);
      const availableKg = alloc.targetKg + emptyKg;
      return {
        memberId: alloc.memberId,
        memberName: m?.name || 'Mitra',
        gardenName: m?.gardenName || 'Greenhouse',
        availableKg,
        emptyHoles
      };
    });
  } else {
    memberCapacities = members.map((m) => {
      const emptyHoles = Math.max(0, m.totalHoles - m.activeLoadHoles);
      const availableKg = Math.floor(emptyHoles * yieldKg);
      return {
        memberId: m.id,
        memberName: m.name,
        gardenName: m.gardenName,
        availableKg,
        emptyHoles
      };
    });
  }

  const totalEmptyHoles = memberCapacities.reduce((acc, m) => acc + m.emptyHoles, 0);
  const totalEmptyHolesKg = memberCapacities.reduce((acc, m) => acc + Math.floor(m.emptyHoles * yieldKg), 0);
  const maxSingleCapacityKg = memberCapacities.length > 0
    ? Math.max(...memberCapacities.map((m) => m.availableKg))
    : 0;

  // Sisa kuota orderable
  const totalBatchAndHoles = batch ? Math.max(remainingBatchQuota, memberCapacities.reduce((acc, m) => acc + m.availableKg, 0)) : totalEmptyHolesKg;

  return {
    remainingBatchQuota,
    totalEmptyHoles,
    totalEmptyHolesKg,
    maxSingleCapacityKg,
    maxOrderableKg: totalBatchAndHoles,
    memberCapacities
  };
}

/**
 * Hitung umur kesegaran (Hari 1, Hari 2, Hari 3/Segera Jual, >3 Kedaluwarsa)
 * Base reference date is fixed to today's operative context: 2026-10-17
 */
export function getFreshnessInfo(harvestDateStr: string, simulatedToday = '2026-10-17'): {
  dayNumber: number;
  label: string;
  badgeType: 'fresh' | 'good' | 'expiring' | 'expired';
  warningText?: string;
  canMarkWaste: boolean;
} {
  const hDate = new Date(harvestDateStr);
  const tDate = new Date(simulatedToday);
  const diffTime = tDate.getTime() - hDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 1) {
    return {
      dayNumber: 1,
      label: 'Hari ke-1 (Sangat Segar)',
      badgeType: 'fresh',
      canMarkWaste: false
    };
  } else if (diffDays === 2) {
    return {
      dayNumber: 2,
      label: 'Hari ke-2 (Prima)',
      badgeType: 'good',
      canMarkWaste: false
    };
  } else if (diffDays === 3) {
    return {
      dayNumber: 3,
      label: 'Hari ke-3 (Segera Jual)',
      badgeType: 'expiring',
      warningText: 'Batas kesegaran 3 hari! Prioritaskan penjualan hari ini.',
      canMarkWaste: true
    };
  } else {
    return {
      dayNumber: diffDays,
      label: `Hari ke-${diffDays} (Lewat Masa Segar)`,
      badgeType: 'expired',
      warningText: 'Kualitas turun drastis. Segera lakukan pencatatan susut (waste).',
      canMarkWaste: true
    };
  }
}

/**
 * Format mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Ekspor Data Bagi Hasil ke CSV
 */
export function generateRevenueShareCsv(records: RevenueShareRecord[]): string {
  const headers = ['Order Number', 'Tanggal', 'Nama Petani', 'Komoditas', 'Qty (kg)', 'Harga/kg', 'Bagi Hasil (%)', 'Nominal Hak (Rp)', 'Status Pencairan'];
  const rows = records.map((r) => [
    r.orderNumber,
    r.transactionDate,
    `"${r.memberName}"`,
    `"${r.productName}"`,
    r.qtyKg,
    r.pricePerKg,
    `${r.revenueSharePercent}%`,
    r.shareAmount,
    r.payoutStatus === 'disbursed' ? 'Sudah Ditransfer' : 'Belum Dicairkan'
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Ekspor Data SCM & Susut ke CSV
 */
export function generateSCMReportCsv(lots: InventoryLot[]): string {
  const headers = ['Lot ID', 'Batch ID', 'Petani ID', 'Tanggal Panen', 'Grade', 'Panen Awal (kg)', 'Sisa Stok (kg)', 'Terjual (kg)', 'Susut/Waste (kg)', 'Status'];
  const rows = lots.map((l) => [
    l.id,
    l.batchId,
    l.memberId,
    l.harvestDate,
    l.grade,
    l.initialQtyKg,
    l.currentQtyKg,
    l.soldQtyKg,
    l.wasteQtyKg,
    l.status
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Trigger download file CSV di browser client
 */
export function downloadCsvFile(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Kalkulator Larutan Nutrisi Tandon Hidroponik
 * Target EC (mS/cm) -> takaran pekatan AB Mix dalam ml per volume air tandon
 */
export function calculateNutrientABMix(waterTankLiters: number, targetEcMs: number): {
  pekatAMl: number;
  pekatBMl: number;
  approxPpm: number;
} {
  // Rata-rata 5 ml A + 5 ml B per 1 liter air menghasilkan ~1.0 mS/cm (atau 500-700 ppm)
  const ratioPerLiter = targetEcMs * 5;
  const pekatAMl = Math.round(waterTankLiters * ratioPerLiter);
  const pekatBMl = pekatAMl;
  const approxPpm = Math.round(targetEcMs * 500);

  return { pekatAMl, pekatBMl, approxPpm };
}

