'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, getFreshnessInfo } from '../../utils/scmAlgorithms';
import { CircularProgress } from '../common/CircularProgress';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  Sprout,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Boxes
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    orders,
    batches,
    inventoryLots,
    revenueRecords,
    members,
    products,
    materialPlans,
    triggerQuickSimulationFlow
  } = useApp();

  // Omzet Terkonfirmasi
  const currentMonthSales = orders.filter((o) => o.status === 'selesai' || o.status === 'dikirim' || o.status === 'dialokasikan');
  const totalOmzet = currentMonthSales.reduce((acc, o) => acc + o.totalAmount, 0);

  // Total Produksi Aktif
  const activeBatches = batches.filter((b) => b.status === 'in_progress');
  const totalProduksiAktifKg = activeBatches.reduce((acc, b) => acc + b.totalTargetKg, 0);

  // Serapan & Susut
  const totalPanenKg = inventoryLots.reduce((acc, l) => acc + l.initialQtyKg, 0);
  const totalTerjualKg = inventoryLots.reduce((acc, l) => acc + l.soldQtyKg, 0);
  const totalSusutKg = inventoryLots.reduce((acc, l) => acc + l.wasteQtyKg, 0);
  const serapanPasarPct = totalPanenKg > 0 ? Math.round((totalTerjualKg / totalPanenKg) * 100) : 0;
  const susutPct = totalPanenKg > 0 ? ((totalSusutKg / totalPanenKg) * 100).toFixed(1) : '0.0';

  // Utilisasi Lubang Tanam
  const totalHoles = members.reduce((acc, m) => acc + m.totalHoles, 0);
  const activeHoles = members.reduce((acc, m) => acc + m.activeLoadHoles, 0);
  const utilizationPct = totalHoles > 0 ? Math.round((activeHoles / totalHoles) * 100) : 0;

  // Nilai rupiah susut
  const nilaiSusutRp = totalSusutKg * 24000;

  // Peringatan Kesegaran 3 Hari
  const expiringLots = inventoryLots
    .map((lot) => ({
      ...lot,
      freshness: getFreshnessInfo(lot.harvestDate)
    }))
    .filter((lot) => lot.currentQtyKg > 0 && (lot.freshness.badgeType === 'expiring' || lot.freshness.badgeType === 'expired'));

  // Pesanan Menunggu Alokasi
  const unallocatedOrders = orders.filter((o) => o.status === 'diproses' && (!o.fulfillments || o.fulfillments.length === 0));

  // Weekly harvest & sales simulation bars (Senin - Minggu)
  const weeklyData = [
    { day: 'Sen', harvest: 40, sold: 38 },
    { day: 'Sel', harvest: 35, sold: 32 },
    { day: 'Rab', harvest: 50, sold: 48 },
    { day: 'Kam', harvest: 45, sold: 44 },
    { day: 'Jum', harvest: 60, sold: 58 },
    { day: 'Sab', harvest: 75, sold: 72 },
    { day: 'Min', harvest: 55, sold: 50 }
  ];

  const maxWeekly = 80;

  return (
    <div className="space-y-5">
      
      {/* End-to-End Pipeline Stepper */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              End-to-End Pipeline
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Alur Rantai Pasok Segar Terdesentralisasi Al-Baroqah
            </h2>
          </div>
          <button
            onClick={() => {
              triggerQuickSimulationFlow();
              onNavigateTab('sales_distribusi');
            }}
            className="px-3.5 py-2 bg-emerald-800 text-white rounded-md text-sm font-bold hover:bg-emerald-900 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-2xs border-2 border-emerald-900"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Simulasi Order & Alokasi Baru</span>
          </button>
        </div>

        {/* 5-Stage Visual Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3.5">
          
          <div
            onClick={() => onNavigateTab('forecasting')}
            className="p-3.5 rounded-lg border-2 border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50 cursor-pointer transition-all space-y-1 shadow-2xs"
          >
            <div className="text-xs text-sky-800 font-mono font-bold">TAHAP 1</div>
            <div className="text-sm font-bold text-slate-900">Peramalan WMA 3</div>
            <div className="text-xs text-slate-600 font-medium">Koreksi tren + Censored demand</div>
          </div>

          <div
            onClick={() => onNavigateTab('batch_produksi')}
            className="p-3.5 rounded-lg border-2 border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-all space-y-1 shadow-2xs"
          >
            <div className="text-xs text-emerald-800 font-mono font-bold">TAHAP 2</div>
            <div className="text-sm font-bold text-slate-900">Tanam & Kurang BOM</div>
            <div className="text-xs text-slate-600 font-medium">Cek lubang tanam mitra</div>
          </div>

          <div
            onClick={() => onNavigateTab('panen_qc')}
            className="p-3.5 rounded-lg border-2 border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition-all space-y-1 shadow-2xs"
          >
            <div className="text-xs text-amber-800 font-mono font-bold">TAHAP 3</div>
            <div className="text-sm font-bold text-slate-900">QC Panen 3 Hari</div>
            <div className="text-xs text-slate-600 font-medium">Stok terikat ID petani</div>
          </div>

          <div
            onClick={() => onNavigateTab('sales_distribusi')}
            className="p-3.5 rounded-lg border-2 border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 cursor-pointer transition-all space-y-1 shadow-2xs"
          >
            <div className="text-xs text-indigo-800 font-mono font-bold">TAHAP 4</div>
            <div className="text-sm font-bold text-slate-900">Alokasi Best-Fit</div>
            <div className="text-xs text-slate-600 font-medium">Single Prio / Multi Fallback</div>
          </div>

          <div
            onClick={() => onNavigateTab('mitra_bagihasil')}
            className="p-3.5 rounded-lg border-2 border-emerald-400 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-all space-y-1 shadow-2xs"
          >
            <div className="text-xs text-emerald-900 font-mono font-bold">TAHAP 5</div>
            <div className="text-sm font-bold text-slate-900">Bagi Hasil Terjual</div>
            <div className="text-xs text-slate-600 font-medium">60% hak mitra cair</div>
          </div>

        </div>
      </div>

      {/* 4 Circular Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Gauge 1: Serapan Pasar */}
        <div className="bg-white border-2 border-emerald-400 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              Serapan Pasar
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {serapanPasarPct}%
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1 font-mono tabular-nums">
              {totalTerjualKg} dari {totalPanenKg} kg
            </span>
          </div>
          <CircularProgress
            value={serapanPasarPct}
            size={68}
            strokeWidth={6}
            color="#059669"
            trackColor="#E2E8F0"
          />
        </div>

        {/* Gauge 2: Utilisasi Lubang Tanam */}
        <div className="bg-white border-2 border-sky-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-sky-950 uppercase tracking-wider block">
              Utilisasi Kebun
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {utilizationPct}%
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1 font-mono tabular-nums">
              {activeHoles} / {totalHoles} lubang
            </span>
          </div>
          <CircularProgress
            value={utilizationPct}
            size={68}
            strokeWidth={6}
            color="#0284C7"
            trackColor="#E2E8F0"
          />
        </div>

        {/* Gauge 3: Rasio Kesegaran Sayur */}
        <div className="bg-white border-2 border-emerald-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              Indeks Kesegaran
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-800 block mt-1">
              95.2%
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1">
              Sayur $\le$ 2 hari petik
            </span>
          </div>
          <CircularProgress
            value={95}
            size={68}
            strokeWidth={6}
            color="#059669"
            trackColor="#E2E8F0"
          />
        </div>

        {/* Gauge 4: Bagi Hasil Sah */}
        <div className="bg-white border-2 border-indigo-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">
              Bagi Hasil Petani
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              60%
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1">
              Dari pesanan sah terjual
            </span>
          </div>
          <CircularProgress
            value={60}
            size={68}
            strokeWidth={6}
            color="#6366F1"
            trackColor="#E2E8F0"
          />
        </div>

      </div>

      {/* Middle Section: Financial Metrics & Weekly Production Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Financials & Weekly Mini Bar Chart */}
        <div className="lg:col-span-2 bg-white border-2 border-emerald-300 rounded-lg p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b-2 border-emerald-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Kinerja Penjualan vs Panen Mingguan di Kebun Mitra
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Pencocokan serapan harian untuk mencegah penumpukan sayur layu
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="w-3 h-3 rounded-xs bg-slate-300 border border-slate-400" />
                <span>Panen</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                <span>Terjual Riil</span>
              </span>
            </div>
          </div>

          {/* Mini Bar Chart */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2 items-end h-36">
            {weeklyData.map((d, i) => {
              const harvestH = Math.round((d.harvest / maxWeekly) * 100);
              const soldH = Math.round((d.sold / maxWeekly) * 100);

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex items-end gap-1 w-full justify-center h-28">
                    {/* Harvest bar */}
                    <div
                      className="w-3 sm:w-4 bg-slate-200 rounded-t-xs border-t border-x border-slate-300 transition-all duration-300"
                      style={{ height: `${harvestH}%` }}
                      title={`Panen: ${d.harvest} kg`}
                    />
                    {/* Sold bar */}
                    <div
                      className="w-3 sm:w-4 bg-emerald-700 rounded-t-xs transition-all duration-300"
                      style={{ height: `${soldH}%` }}
                      title={`Terjual: ${d.sold} kg`}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Row */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t-2 border-emerald-100 text-xs">
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">Total Omzet:</div>
              <div className="font-bold text-slate-900 font-mono tabular-nums text-base mt-0.5">
                {formatRupiah(totalOmzet)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">Target Tanam Aktif:</div>
              <div className="font-bold text-slate-900 font-mono tabular-nums text-base mt-0.5">
                {totalProduksiAktifKg} kg
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">Susut Terkendali:</div>
              <div className="font-bold text-rose-700 font-mono tabular-nums text-base mt-0.5">
                {totalSusutKg} kg ({susutPct}%)
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Logistics & Courier Trip */}
        <div className="bg-white border-2 border-amber-300 rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-amber-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4.5 h-4.5 text-amber-800" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Kurir Penjemputan Kebun</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border-2 border-emerald-300 px-2 py-0.5 rounded">
                Active In-Transit
              </span>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-md border-2 border-amber-200 space-y-2 mt-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Trip:</span>
                <span className="font-mono font-bold text-slate-900">TRIP-20261017-01</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Armada:</span>
                <span className="font-semibold text-slate-800">Blind Van Pendingin</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Driver:</span>
                <span className="font-semibold text-slate-800">Pak Dadan Suhendar</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Rute Jemput:</span>
                <span className="font-bold text-emerald-800">Kebun Lembang (Pak Joko)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Tujuan Akhir:</span>
                <span className="font-semibold text-slate-800">Pasteur, Bandung (25 kg)</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 mt-2.5 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Efisiensi Single-Fulfillment</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Kurir singgah di 1 titik kebun sehingga memangkas waktu jemput 65% dan menjaga sayuran tetap dingin higienis.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('sales_distribusi')}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Buka Modul Distribusi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Bottom Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Warning 1: Expiring lots */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Segera Jual (Batas 3 Hari)
            </span>
            <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded">
              {expiringLots.length} Lot
            </span>
          </div>

          <div className="space-y-1.5">
            {expiringLots.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-3 text-center">
                Seluruh sayuran di kebun mitra dalam batas usia segar $\le$ 2 hari.
              </div>
            ) : (
              expiringLots.map((lot) => {
                const product = products.find((p) => p.id === lot.productId);
                return (
                  <div
                    key={lot.id}
                    className="p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{product?.name}</div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        Panen: {lot.harvestDate} · {lot.freshness.label}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-rose-700">
                      {lot.currentQtyKg} kg
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={() => onNavigateTab('panen_qc')}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1"
            >
              <span>Kelola Stok & QC Kebun</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Warning 2: Unallocated Orders */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Menunggu Alokasi Kebun
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
              {unallocatedOrders.length} Pesanan
            </span>
          </div>

          <div className="space-y-1.5">
            {unallocatedOrders.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-3 text-center">
                Semua pesanan terverifikasi telah dialokasikan ke kebun mitra.
              </div>
            ) : (
              unallocatedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{ord.customerName}</div>
                    <div className="text-[11px] text-slate-600 font-mono font-medium">
                      {ord.orderNumber} · {ord.items[0]?.quantityKg} kg {ord.items[0]?.productName}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900">
                    {formatRupiah(ord.totalAmount)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={() => onNavigateTab('sales_distribusi')}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1"
            >
              <span>Tentukan Alokasi Single / Multi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Warning 3: Kesiapan Bahan Baku (MRP) */}
        <div className="bg-white border border-slate-300 rounded-lg p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-slate-700" />
              Kesiapan Bahan Baku (MRP)
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300 px-1.5 py-0.5 rounded">
              {materialPlans.filter((p) => p.plantingReadiness === 'siap_tanam').length}/{materialPlans.length} Siap
            </span>
          </div>

          <div className="space-y-1.5">
            {materialPlans.slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{plan.memberName}</div>
                  <div className="text-[11px] text-slate-600 font-mono font-medium">
                    {plan.batchCode} · {plan.productName}
                  </div>
                </div>
                <div>
                  {plan.plantingReadiness === 'siap_tanam' && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                      Siap
                    </span>
                  )}
                  {plan.plantingReadiness === 'belum_siap' && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                      Kurang
                    </span>
                  )}
                  {plan.plantingReadiness === 'menunggu_konfirmasi' && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      Menunggu
                    </span>
                  )}
                  {plan.plantingReadiness === 'menolak' && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-300">
                      Menolak
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <button
              onClick={() => onNavigateTab('perencanaan_bahan')}
              className="text-xs font-semibold text-slate-800 hover:text-slate-950 flex items-center gap-1"
            >
              <span>Pantau Seluruh Kesiapan Bahan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
