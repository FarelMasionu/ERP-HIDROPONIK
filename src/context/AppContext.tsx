'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Product,
  Member,
  RawMaterial,
  ProductionBatch,
  HarvestSubmission,
  InventoryLot,
  Order,
  RevenueShareRecord,
  ForecastPlan,
  OrderStatus,
  FulfillmentAllocation,
  MaterialStandard,
  MaterialPlan,
  PlantingReadinessStatus
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_MEMBERS,
  INITIAL_RAW_MATERIALS,
  INITIAL_BATCHES,
  INITIAL_INVENTORY_LOTS,
  INITIAL_HARVEST_SUBMISSIONS,
  INITIAL_ORDERS,
  INITIAL_REVENUE_RECORDS,
  HISTORICAL_SALES_BY_PRODUCT,
  INITIAL_MATERIAL_STANDARDS,
  INITIAL_MATERIAL_PLANS
} from '../data/initialData';
import {
  calculateWmaForecast,
  calculateTargetRecommendation,
  getFreshnessInfo,
  calculateAllocationStrategy
} from '../utils/scmAlgorithms';

export interface CartItem {
  productId: string;
  productName: string;
  pricePerKg: number;
  quantityKg: number;
  type: 'ready' | 'preorder';
  batchId?: string;
  estimatedHarvestDate?: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  members: Member[];
  addMember: (member: Member) => void;
  updateMember: (member: Member) => void;
  rawMaterials: RawMaterial[];
  addRawMaterial: (material: RawMaterial) => void;
  updateRawMaterial: (material: RawMaterial) => void;
  batches: ProductionBatch[];
  inventoryLots: InventoryLot[];
  harvestSubmissions: HarvestSubmission[];
  orders: Order[];
  revenueRecords: RevenueShareRecord[];
  forecastPlans: Record<string, ForecastPlan>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, type: 'ready' | 'preorder') => void;
  updateCartQty: (productId: string, type: 'ready' | 'preorder', qty: number) => void;
  clearCart: () => void;
  checkoutOrder: (customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    customerType: 'Retail' | 'B2B/Katering';
    notes?: string;
  }) => Order;
  uploadPaymentProof: (orderId: string, proofUrl: string) => void;
  verifyPayment: (orderId: string) => void;
  allocateOrder: (
    orderId: string,
    allocationType: 'Single-Fulfillment' | 'Multi-Member Split',
    fulfillments: FulfillmentAllocation[]
  ) => void;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  completeOrder: (orderId: string) => void;
  createProductionBatch: (newBatch: {
    productId: string;
    batchCode: string;
    totalTargetKg: number;
    startDate: string;
    estimatedHarvestDate: string;
    allocations: { memberId: string; targetKg: number; usedHoles: number }[];
    notes?: string;
  }) => { success: boolean; error?: string };
  startProductionBatch: (batchId: string) => { success: boolean; error?: string };
  submitMemberHarvest: (
    memberId: string,
    batchId: string,
    productId: string,
    grossHarvestKg: number
  ) => void;
  approveHarvestAndQC: (
    submissionId: string,
    gradeAKg: number,
    gradeBKg: number,
    rejectKg: number,
    notes: string
  ) => void;
  recordWaste: (lotId: string, wasteKg: number, notes?: string) => void;
  overrideForecastTarget: (productId: string, targetKg: number, note: string) => void;
  disburseRevenueShare: (recordId: string, transferProofUrl?: string) => void;
  materialStandards: MaterialStandard[];
  materialPlans: MaterialPlan[];
  updateMaterialStandard: (std: MaterialStandard) => void;
  confirmMemberMaterialStock: (
    planId: string,
    reportedStocks: { seed?: number; rockwool?: number; nutrient?: number },
    readiness: PlantingReadinessStatus,
    notes?: string
  ) => void;
  nutrientLogs: any[];
  addNutrientLog: (log: any) => void;
  courierTrips: any[];
  restockRawMaterial: (materialId: string, amount: number) => void;
  triggerQuickSimulationFlow: () => { success: boolean; message: string };
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'al_baroqah_erp_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [role, setRole] = useState<Role>('admin');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('mbr-01');

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const [members, setMembers] = useState<Member[]>(() => {
    if (typeof window === 'undefined') return INITIAL_MEMBERS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    if (typeof window === 'undefined') return INITIAL_RAW_MATERIALS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_raw_materials');
      return saved ? JSON.parse(saved) : INITIAL_RAW_MATERIALS;
    } catch {
      return INITIAL_RAW_MATERIALS;
    }
  });
  const [batches, setBatches] = useState<ProductionBatch[]>(() => {
    if (typeof window === 'undefined') return INITIAL_BATCHES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_batches');
      return saved ? JSON.parse(saved) : INITIAL_BATCHES;
    } catch {
      return INITIAL_BATCHES;
    }
  });
  const [inventoryLots, setInventoryLots] = useState<InventoryLot[]>(() => {
    if (typeof window === 'undefined') return INITIAL_INVENTORY_LOTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY_LOTS;
    } catch {
      return INITIAL_INVENTORY_LOTS;
    }
  });
  const [harvestSubmissions, setHarvestSubmissions] = useState<HarvestSubmission[]>(() => {
    if (typeof window === 'undefined') return INITIAL_HARVEST_SUBMISSIONS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_submissions');
      return saved ? JSON.parse(saved) : INITIAL_HARVEST_SUBMISSIONS;
    } catch {
      return INITIAL_HARVEST_SUBMISSIONS;
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });
  const [revenueRecords, setRevenueRecords] = useState<RevenueShareRecord[]>(() => {
    if (typeof window === 'undefined') return INITIAL_REVENUE_RECORDS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_revenue');
      return saved ? JSON.parse(saved) : INITIAL_REVENUE_RECORDS;
    } catch {
      return INITIAL_REVENUE_RECORDS;
    }
  });
  const [materialStandards, setMaterialStandards] = useState<MaterialStandard[]>(() => {
    if (typeof window === 'undefined') return INITIAL_MATERIAL_STANDARDS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_material_standards');
      return saved ? JSON.parse(saved) : INITIAL_MATERIAL_STANDARDS;
    } catch {
      return INITIAL_MATERIAL_STANDARDS;
    }
  });
  const [materialPlans, setMaterialPlans] = useState<MaterialPlan[]>(() => {
    if (typeof window === 'undefined') return INITIAL_MATERIAL_PLANS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_material_plans');
      return saved ? JSON.parse(saved) : INITIAL_MATERIAL_PLANS;
    } catch {
      return INITIAL_MATERIAL_PLANS;
    }
  });
  const [nutrientLogs, setNutrientLogs] = useState<any[]>(() => {
    return [
      {
        id: 'log-01',
        batchId: 'batch-pkc-101',
        memberId: 'mbr-01',
        date: '2026-10-17',
        ecValue: 2.0,
        phValue: 6.1,
        waterTempCelsius: 23.5,
        status: 'optimal',
        notes: 'Sirkulasi NFT lancar, akar bersih putih.'
      },
      {
        id: 'log-02',
        batchId: 'batch-pkc-101',
        memberId: 'mbr-02',
        date: '2026-10-17',
        ecValue: 1.9,
        phValue: 6.3,
        waterTempCelsius: 24.0,
        status: 'optimal',
        notes: 'Pertumbuhan daun seragam.'
      }
    ];
  });
  const [courierTrips, setCourierTrips] = useState<any[]>(() => [
    {
      tripId: 'TRIP-20261017-01',
      orderId: 'ord-1001',
      driverName: 'Pak Dadan Suhendar',
      vehicleType: 'Mobil Blind Van Berpendingin',
      stops: [
        {
          memberId: 'mbr-01',
          gardenName: 'Kebun Hijau Berkah Lembang',
          location: 'Jl. Maribaya No. 42, Lembang',
          allocatedKg: 25,
          pickupWindow: '13:00 - 13:45 WIB',
          isPickedUp: true
        }
      ],
      customerDestination: 'Jl. Surya Sumantri No. 54, Pasteur, Bandung',
      totalDistanceKm: 18.4,
      status: 'in_transit'
    }
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Forecast plans initial calculation
  const [forecastPlans, setForecastPlans] = useState<Record<string, ForecastPlan>>(() => {
    const initialPlans: Record<string, ForecastPlan> = {};
    INITIAL_PRODUCTS.forEach((product) => {
      const history = HISTORICAL_SALES_BY_PRODUCT[product.id] || [];
      const forecastRes = calculateWmaForecast(history);
      // Preorders aktif
      const activePreorderKg = INITIAL_BATCHES.filter((b) => b.productId === product.id && b.status === 'in_progress').reduce(
        (acc, b) => acc + b.preorderSoldKg,
        0
      );
      const recommendation = calculateTargetRecommendation(forecastRes.finalForecast, activePreorderKg);

      initialPlans[product.id] = {
        productId: product.id,
        productName: product.name,
        history,
        wmaForecastReadyKg: forecastRes.finalForecast,
        activePreorderKg,
        calculatedRecommendationKg: recommendation,
        finalTargetKg: recommendation,
        isOverridden: false,
        censoredDemandWarning: forecastRes.hasCensoredDemand
      };
    });
    return initialPlans;
  });

  // Sync to local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_members', JSON.stringify(members));
  }, [members]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_raw_materials', JSON.stringify(rawMaterials));
  }, [rawMaterials]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_batches', JSON.stringify(batches));
  }, [batches]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_inventory', JSON.stringify(inventoryLots));
  }, [inventoryLots]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_submissions', JSON.stringify(harvestSubmissions));
  }, [harvestSubmissions]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_orders', JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_revenue', JSON.stringify(revenueRecords));
  }, [revenueRecords]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_material_standards', JSON.stringify(materialStandards));
  }, [materialStandards]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY + '_material_plans', JSON.stringify(materialPlans));
  }, [materialPlans]);

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === item.productId && i.type === item.type);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantityKg += item.quantityKg;
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, type: 'ready' | 'preorder') => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.type === type)));
  };

  const updateCartQty = (productId: string, type: 'ready' | 'preorder', qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, type);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId && i.type === type ? { ...i, quantityKg: qty } : i))
    );
  };

  const clearCart = () => setCart([]);

  // Checkout order
  const checkoutOrder = (customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    customerType: 'Retail' | 'B2B/Katering';
    notes?: string;
  }): Order => {
    const total = cart.reduce((acc, item) => acc + item.quantityKg * item.pricePerKg, 0);
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    // Evaluasi strategi alokasi pemenuhan awal (Single-Fulfillment 1 orang vs Multi-Member Split)
    let initialAllocationType: 'Single-Fulfillment' | 'Multi-Member Split' | undefined = undefined;
    let initialFulfillments: FulfillmentAllocation[] = [];

    const preorderItem = cart.find((c) => c.type === 'preorder');
    if (preorderItem) {
      const targetBatch = preorderItem.batchId ? batches.find((b) => b.id === preorderItem.batchId) : undefined;
      const allocResult = calculateAllocationStrategy({
        orderQty: preorderItem.quantityKg,
        productId: preorderItem.productId,
        type: 'preorder',
        inventoryLots,
        batch: targetBatch,
        members
      });
      if (allocResult.isPossible) {
        initialAllocationType = allocResult.allocationType;
        initialFulfillments = allocResult.fulfillments;
      }
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      customerType: customer.customerType,
      items: cart.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        quantityKg: c.quantityKg,
        pricePerKg: c.pricePerKg,
        type: c.type,
        batchId: c.batchId,
        estimatedHarvestDate: c.estimatedHarvestDate
      })),
      totalAmount: total,
      status: 'menunggu_pembayaran',
      allocationType: initialAllocationType,
      paymentVerified: false,
      orderDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      fulfillments: initialFulfillments,
      notes: customer.notes
    };

    // Update batch preorderSoldKg if contains pre-orders
    cart.forEach((c) => {
      if (c.type === 'preorder' && c.batchId) {
        setBatches((prevBatches) =>
          prevBatches.map((b) => (b.id === c.batchId ? { ...b, preorderSoldKg: b.preorderSoldKg + c.quantityKg } : b))
        );
      }
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const uploadPaymentProof = (orderId: string, proofUrl: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentProofUrl: proofUrl,
              status: o.status === 'menunggu_pembayaran' ? 'diproses' : o.status
            }
          : o
      )
    );
  };

  const verifyPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentVerified: true, status: 'diproses' } : o))
    );
  };

  const allocateOrder = (
    orderId: string,
    allocationType: 'Single-Fulfillment' | 'Multi-Member Split',
    fulfillments: FulfillmentAllocation[]
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'dialokasikan',
              allocationType,
              fulfillments,
              allocatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : o
      )
    );
  };

  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === 'selesai') {
      completeOrder(orderId);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
  };

  // Complete Order: Deduct decentralized farm stock FIFO & Accrue Revenue Share!
  const completeOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'selesai') return;

    const completedTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // 1. Potong stok kebun mitra FIFO
    targetOrder.fulfillments.forEach((ful) => {
      const targetItem = targetOrder.items[0]; // Primary item
      const qtyToDeduct = ful.allocatedKg;

      setInventoryLots((prevLots) => {
        let remaining = qtyToDeduct;
        // Strict FIFO: urutkan lot berdasarkan tanggal panen terlama (harvestDate ASC)
        const matchingLotIds = prevLots
          .filter(
            (lot) =>
              lot.memberId === ful.memberId &&
              lot.productId === targetItem?.productId &&
              lot.currentQtyKg > 0
          )
          .sort((a, b) => a.harvestDate.localeCompare(b.harvestDate))
          .map((l) => l.id);

        const deductions = new Map<string, number>();
        for (const lotId of matchingLotIds) {
          if (remaining <= 0) break;
          const lot = prevLots.find((l) => l.id === lotId);
          if (lot && lot.currentQtyKg > 0) {
            const take = Math.min(remaining, lot.currentQtyKg);
            deductions.set(lotId, take);
            remaining -= take;
          }
        }

        return prevLots.map((lot) => {
          if (deductions.has(lot.id)) {
            const take = deductions.get(lot.id)!;
            const newCurrent = lot.currentQtyKg - take;
            const newSold = lot.soldQtyKg + take;
            return {
              ...lot,
              currentQtyKg: newCurrent,
              soldQtyKg: newSold,
              status: newCurrent === 0 ? 'Depleted' : lot.status
            };
          }
          return lot;
        });
      });

      // 2. Transparansi Bagi Hasil: Catat hak mitra hanya dari produk yang TERJUAL riil
      const member = members.find((m) => m.id === ful.memberId);
      const sharePct = member?.revenueSharePercent || 60;
      const pricePerKg = targetItem ? targetItem.pricePerKg : 22000;
      const shareAmount = ful.allocatedKg * pricePerKg * (sharePct / 100);

      const newRecord: RevenueShareRecord = {
        id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber,
        memberId: ful.memberId,
        memberName: ful.memberName,
        productId: targetItem?.productId || 'prod-pakcoy',
        productName: targetItem?.productName || 'Sayur Hidroponik',
        qtyKg: ful.allocatedKg,
        pricePerKg,
        revenueSharePercent: sharePct,
        shareAmount,
        transactionDate: completedTimestamp,
        payoutStatus: 'accrued'
      };

      setRevenueRecords((prevRev) => [newRecord, ...prevRev]);
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'selesai',
              completedAt: completedTimestamp
            }
          : o
      )
    );
  };

  // Create Production Batch with hole capacity validation
  const createProductionBatch = (newBatch: {
    productId: string;
    batchCode: string;
    totalTargetKg: number;
    startDate: string;
    estimatedHarvestDate: string;
    allocations: { memberId: string; targetKg: number; usedHoles: number }[];
    notes?: string;
  }): { success: boolean; error?: string } => {
    // Validasi kapasitas lubang tanam
    for (const alloc of newBatch.allocations) {
      const member = members.find((m) => m.id === alloc.memberId);
      if (!member) {
        return { success: false, error: `Mitra dengan ID ${alloc.memberId} tidak ditemukan.` };
      }
      const availableCapacity = member.totalHoles - member.activeLoadHoles;
      if (alloc.usedHoles > availableCapacity) {
        return {
          success: false,
          error: `Alokasi gagal! ${member.name} (${member.gardenName}) hanya memiliki sisa kapasitas ${availableCapacity} lubang tanam, sedangkan alokasi membutuhkan ${alloc.usedHoles} lubang.`
        };
      }
    }

    const product = products.find((p) => p.id === newBatch.productId);
    const standard = materialStandards.find((s) => s.productId === newBatch.productId);

    const batchObj: ProductionBatch = {
      id: `batch-${Date.now()}`,
      batchCode: newBatch.batchCode,
      productId: newBatch.productId,
      totalTargetKg: newBatch.totalTargetKg,
      preorderSoldKg: 0,
      startDate: newBatch.startDate,
      estimatedHarvestDate: newBatch.estimatedHarvestDate,
      status: 'planned',
      materialsDeducted: false,
      notes: newBatch.notes,
      allocations: newBatch.allocations.map((a) => ({
        memberId: a.memberId,
        targetKg: a.targetKg,
        usedHoles: a.usedHoles,
        progressStatus: 'Belum Mulai'
      }))
    };

    // Otomatis buat Rencana Kebutuhan Bahan (MRP) untuk setiap mitra yang dialokasikan
    const newMaterialPlans: MaterialPlan[] = newBatch.allocations.map((alloc, idx) => {
      const member = members.find((m) => m.id === alloc.memberId);
      const yieldPerHole = standard ? standard.estimatedYieldPerHoleKg : 0.055;
      const estHoles = Math.ceil(alloc.targetKg / yieldPerHole);

      const seedStd = standard ? standard.seedUsagePerHole : 1.2;
      const rockwoolStd = standard ? standard.rockwoolUsagePerHole : 1.0;
      const nutrientStd = standard ? standard.nutrientUsagePerHole : 4.5;

      const seedReq = Math.round(estHoles * seedStd);
      const rockwoolReq = Math.round(estHoles * rockwoolStd);
      const nutrientReq = Math.round(estHoles * nutrientStd);

      return {
        id: `MRP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 899)}`,
        batchId: batchObj.id,
        batchCode: batchObj.batchCode,
        productId: batchObj.productId,
        productName: product?.name || 'Sayuran Hidroponik',
        memberId: alloc.memberId,
        memberName: member?.name || 'Petani Mitra',
        gardenName: member?.gardenName || 'Kebun Mitra',
        targetKg: alloc.targetKg,
        estimatedHoles: estHoles,
        items: [
          {
            materialType: 'seed',
            materialName: `Benih ${product?.name || 'Sayuran'}`,
            unit: standard?.seedUnit || 'butir',
            requiredQty: seedReq,
            confirmedStockQty: null,
            shortageQty: null
          },
          {
            materialType: 'rockwool',
            materialName: 'Rockwool Media Semai (Kubus)',
            unit: standard?.rockwoolUnit || 'kubus',
            requiredQty: rockwoolReq,
            confirmedStockQty: null,
            shortageQty: null
          },
          {
            materialType: 'nutrient',
            materialName: 'Pekatan Nutrisi AB Mix',
            unit: standard?.nutrientUnit || 'ml',
            requiredQty: nutrientReq,
            confirmedStockQty: null,
            shortageQty: null
          }
        ],
        memberConfirmationStatus: 'belum_dikonfirmasi',
        plantingReadiness: 'menunggu_konfirmasi',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
    });

    setBatches((prev) => [batchObj, ...prev]);
    setMaterialPlans((prev) => [...newMaterialPlans, ...prev]);
    return { success: true };
  };

  // Start Production Batch: validasi kesiapan tanam anggota & update beban lubang
  const startProductionBatch = (batchId: string): { success: boolean; error?: string } => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return { success: false, error: 'Batch tidak ditemukan.' };
    if (batch.status !== 'planned') return { success: false, error: 'Batch sudah berjalan atau selesai.' };

    const product = products.find((p) => p.id === batch.productId);
    if (!product) return { success: false, error: 'Produk tidak ditemukan.' };

    // Validasi kesiapan bahan baku dari rencana kebutuhan (MRP)
    const batchPlans = materialPlans.filter((p) => p.batchId === batchId);
    if (batchPlans.length > 0) {
      const notReady = batchPlans.filter((p) => p.plantingReadiness !== 'siap_tanam');
      if (notReady.length > 0) {
        const details = notReady
          .map((p) => {
            const label =
              p.plantingReadiness === 'menolak'
                ? 'Menolak'
                : p.plantingReadiness === 'belum_siap'
                ? 'Belum Siap'
                : 'Menunggu Konfirmasi';
            return `${p.memberName} (${label})`;
          })
          .join(', ');
        return {
          success: false,
          error: `Batch belum dapat dimulai! Terdapat mitra yang belum siap tanam: ${details}. Sesuai prinsip rantai pasok Al-Baroqah, penanaman tidak dimulai sebelum seluruh mitra mengonfirmasi kesiapan dan ketersediaan bahan.`
        };
      }
    }

    // Update activeLoadHoles per member
    setMembers((prevMembers) =>
      prevMembers.map((m) => {
        const alloc = batch.allocations.find((a) => a.memberId === m.id);
        if (alloc) {
          return { ...m, activeLoadHoles: m.activeLoadHoles + alloc.usedHoles };
        }
        return m;
      })
    );

    // Update batch status to in_progress
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'in_progress',
              materialsDeducted: true,
              allocations: b.allocations.map((a) => ({
                ...a,
                progressStatus: 'Semai & Peremajaan',
                plantedDate: new Date().toISOString().slice(0, 10)
              }))
            }
          : b
      )
    );

    return { success: true };
  };

  // Update Konfigurasi Standar Kebutuhan Bahan Baku per Varietas
  const updateMaterialStandard = (std: MaterialStandard) => {
    setMaterialStandards((prev) =>
      prev.map((s) =>
        s.id === std.id
          ? {
              ...std,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              updatedBy: 'Admin Agronomi Al-Baroqah'
            }
          : s
      )
    );
  };

  // Konfirmasi Stok Bahan & Kesiapan Tanam oleh Anggota (atau Admin atas nama anggota)
  const confirmMemberMaterialStock = (
    planId: string,
    reportedStocks: { seed?: number; rockwool?: number; nutrient?: number },
    readiness: PlantingReadinessStatus,
    notes?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setMaterialPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;

        const updatedItems = plan.items.map((item) => {
          let reportedVal: number | null = item.confirmedStockQty;
          if (item.materialType === 'seed' && reportedStocks.seed !== undefined) {
            reportedVal = reportedStocks.seed;
          } else if (item.materialType === 'rockwool' && reportedStocks.rockwool !== undefined) {
            reportedVal = reportedStocks.rockwool;
          } else if (item.materialType === 'nutrient' && reportedStocks.nutrient !== undefined) {
            reportedVal = reportedStocks.nutrient;
          }

          const shortage = reportedVal === null ? null : Math.max(0, item.requiredQty - reportedVal);
          return {
            ...item,
            confirmedStockQty: reportedVal,
            shortageQty: shortage
          };
        });

        return {
          ...plan,
          items: updatedItems,
          memberConfirmationStatus: 'sudah_konfirmasi',
          plantingReadiness: readiness,
          confirmedAt: now,
          readinessNotes: notes !== undefined ? notes : plan.readinessNotes
        };
      })
    );
  };

  // Farmer reports harvest
  const submitMemberHarvest = (
    memberId: string,
    batchId: string,
    productId: string,
    grossHarvestKg: number
  ) => {
    const submission: HarvestSubmission = {
      id: `sub-${Date.now()}`,
      batchId,
      productId,
      memberId,
      submissionDate: new Date().toISOString().slice(0, 10),
      grossHarvestKg,
      status: 'pending_qc'
    };
    setHarvestSubmissions((prev) => [submission, ...prev]);
  };

  // Admin approves harvest & QC -> creates decentralized member InventoryLot
  const approveHarvestAndQC = (
    submissionId: string,
    gradeAKg: number,
    gradeBKg: number,
    rejectKg: number,
    notes: string
  ) => {
    const sub = harvestSubmissions.find((s) => s.id === submissionId);
    if (!sub) return;

    const todayStr = '2026-10-17'; // reference operational today
    const verifiedTimestamp = `${todayStr} ${new Date().toTimeString().slice(0, 5)}`;

    // Update submission
    setHarvestSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'approved',
              qcResult: {
                gradeAKg,
                gradeBKg,
                rejectKg,
                qcNotes: notes,
                verifiedAt: verifiedTimestamp,
                verifiedBy: 'Admin QC Al-Baroqah'
              }
            }
          : s
      )
    );

    // Buat inventory lot terikat pada memberId (desentralisasi stok di kebun petani)
    if (gradeAKg > 0) {
      const newLotA: InventoryLot = {
        id: `lot-${Date.now()}-A`,
        batchId: sub.batchId,
        productId: sub.productId,
        memberId: sub.memberId,
        harvestDate: todayStr,
        initialQtyKg: gradeAKg,
        currentQtyKg: gradeAKg,
        soldQtyKg: 0,
        wasteQtyKg: 0,
        grade: 'Grade A',
        status: 'Fresh'
      };
      setInventoryLots((prev) => [newLotA, ...prev]);
    }

    if (gradeBKg > 0) {
      const newLotB: InventoryLot = {
        id: `lot-${Date.now()}-B`,
        batchId: sub.batchId,
        productId: sub.productId,
        memberId: sub.memberId,
        harvestDate: todayStr,
        initialQtyKg: gradeBKg,
        currentQtyKg: gradeBKg,
        soldQtyKg: 0,
        wasteQtyKg: 0,
        grade: 'Grade B',
        status: 'Fresh'
      };
      setInventoryLots((prev) => [newLotB, ...prev]);
    }

    // Kurangi activeLoadHoles petani karena panen selesai
    const batch = batches.find((b) => b.id === sub.batchId);
    const alloc = batch?.allocations.find((a) => a.memberId === sub.memberId);
    if (alloc) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === sub.memberId
            ? { ...m, activeLoadHoles: Math.max(0, m.activeLoadHoles - alloc.usedHoles) }
            : m
        )
      );
    }
  };

  // Catat Susut (Waste) jika sayuran lewat 3 hari / layu
  const recordWaste = (lotId: string, wasteKg: number, notes?: string) => {
    setInventoryLots((prev) =>
      prev.map((l) => {
        if (l.id === lotId) {
          const qty = Math.min(wasteKg, l.currentQtyKg);
          const newCurrent = l.currentQtyKg - qty;
          return {
            ...l,
            currentQtyKg: newCurrent,
            wasteQtyKg: l.wasteQtyKg + qty,
            status: newCurrent === 0 ? 'Wasted' : l.status
          };
        }
        return l;
      })
    );
  };

  // Override forecast target with mandatory justification note
  const overrideForecastTarget = (productId: string, targetKg: number, note: string) => {
    setForecastPlans((prev) => {
      const current = prev[productId];
      if (!current) return prev;
      return {
        ...prev,
        [productId]: {
          ...current,
          finalTargetKg: targetKg,
          isOverridden: true,
          justificationNote: note
        }
      };
    });
  };

  // Disburse revenue share
  const disburseRevenueShare = (recordId: string, transferProofUrl?: string) => {
    setRevenueRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              payoutStatus: 'disbursed',
              disbursedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              transferProofUrl: transferProofUrl || 'https://placehold.co/400x600/png?text=Bukti+Transfer+Lunas'
            }
          : r
      )
    );
  };

  // Farmer logs daily NFT nutrient & EC/pH values
  const addNutrientLog = (newLog: any) => {
    const entry = {
      ...newLog,
      id: `log-${Date.now()}`
    };
    setNutrientLogs((prev) => [entry, ...prev]);
  };

  // Restock Raw Materials (Seed, AB Mix, Rockwool)
  const restockRawMaterial = (materialId: string, amount: number) => {
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, stock: parseFloat((m.stock + amount).toFixed(2)) } : m))
    );
  };

  // Interactive SCM End-to-End Simulation Flow
  const triggerQuickSimulationFlow = (): { success: boolean; message: string } => {
    const orderNum = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(200 + Math.random() * 700)}`;
    const simOrder: Order = {
      id: `ord-sim-${Date.now()}`,
      orderNumber: orderNum,
      customerName: 'Hotel Grand Preanger Bandung',
      customerPhone: '0811-2233-4455',
      customerEmail: 'fnb@grandpreanger.com',
      customerAddress: 'Jl. Asia Afrika No. 81, Braga, Sumur Bandung',
      customerType: 'B2B/Katering',
      items: [
        {
          productId: 'prod-pakcoy',
          productName: 'Pakcoy Shinta Super',
          quantityKg: 20,
          pricePerKg: 22000,
          type: 'ready'
        }
      ],
      totalAmount: 440000,
      status: 'dialokasikan',
      paymentVerified: true,
      paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer+BCA+Lunas',
      orderDate: '2026-10-17 11:20',
      allocationType: 'Single-Fulfillment',
      fulfillments: [
        {
          memberId: 'mbr-01',
          memberName: 'Pak Joko Susilo',
          gardenName: 'Kebun Hijau Berkah Lembang',
          location: 'Jl. Maribaya No. 42, Lembang',
          allocatedKg: 20,
          lotId: 'lot-01',
          pickupTimeWindow: 'Hari ini, 14:00 - 15:30 WIB'
        }
      ],
      allocatedAt: '2026-10-17 11:30',
      notes: 'Simulasi alur otomatis: Best-Fit Single-Fulfillment terpilih ke Kebun Pak Joko.'
    };

    setOrders((prev) => [simOrder, ...prev]);
    return {
      success: true,
      message: `Pesanan B2B simulasi ${orderNum} (20 kg Pakcoy) berhasil dibuat dan dialokasikan otomatis ke Kebun Pak Joko!`
    };
  };

  // Master Data CRUD operations
  const addProduct = (prod: Product) => {
    setProducts((prev) => [...prev, prod]);
  };

  const updateProduct = (prod: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addMember = (mbr: Member) => {
    setMembers((prev) => [...prev, mbr]);
  };

  const updateMember = (mbr: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === mbr.id ? mbr : m)));
  };

  const addRawMaterial = (mat: RawMaterial) => {
    setRawMaterials((prev) => [...prev, mat]);
  };

  const updateRawMaterial = (mat: RawMaterial) => {
    setRawMaterials((prev) => prev.map((m) => (m.id === mat.id ? mat : m)));
  };

  const resetAllData = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setMembers(INITIAL_MEMBERS);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setBatches(INITIAL_BATCHES);
    setInventoryLots(INITIAL_INVENTORY_LOTS);
    setHarvestSubmissions(INITIAL_HARVEST_SUBMISSIONS);
    setOrders(INITIAL_ORDERS);
    setRevenueRecords(INITIAL_REVENUE_RECORDS);
    setMaterialStandards(INITIAL_MATERIAL_STANDARDS);
    setMaterialPlans(INITIAL_MATERIAL_PLANS);
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        selectedMemberId,
        setSelectedMemberId,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        members,
        addMember,
        updateMember,
        rawMaterials,
        addRawMaterial,
        updateRawMaterial,
        batches,
        inventoryLots,
        harvestSubmissions,
        orders,
        revenueRecords,
        forecastPlans,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        checkoutOrder,
        uploadPaymentProof,
        verifyPayment,
        allocateOrder,
        updateOrderStatus,
        completeOrder,
        createProductionBatch,
        startProductionBatch,
        submitMemberHarvest,
        approveHarvestAndQC,
        recordWaste,
        overrideForecastTarget,
        disburseRevenueShare,
        materialStandards,
        materialPlans,
        updateMaterialStandard,
        confirmMemberMaterialStock,
        nutrientLogs,
        addNutrientLog,
        courierTrips,
        restockRawMaterial,
        triggerQuickSimulationFlow,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
