export type Role = 'admin' | 'owner' | 'member' | 'consumer';

export type CropCategory = 'leafy' | 'herb' | 'fruit';

export interface Product {
  id: string;
  name: string;
  scientificName: string;
  category: CropCategory;
  pricePerKg: number;
  minOrderKg: number;
  growingDays: number; // hari dari semai ke panen
  shelfLifeDays: number; // 3 hari untuk sayuran hidroponik segar
  bom: {
    seedCount: number; // butir benih per kg
    abMixLiters: number; // liter pekat AB Mix per kg
    rockwoolSlabs: number; // slab per kg
  };
  description: string;
  image: string;
}

export interface Member {
  id: string;
  name: string;
  gardenName: string;
  location: string;
  phone: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    holderName: string;
  };
  totalHoles: number; // Kapasitas total lubang tanam
  activeLoadHoles: number; // Lubang yang sedang dipakai berjalan
  revenueSharePercent: number; // Default 60%
  joinDate: string;
  rating: number; // performa mitra (1-5)
}

export interface RawMaterial {
  id: string;
  name: string;
  type: 'seed' | 'nutrient' | 'rockwool';
  unit: string;
  stock: number;
  minStockAlert: number;
}

export type BatchStatus = 'planned' | 'in_progress' | 'ready_harvest' | 'completed';

export interface BatchAllocation {
  memberId: string;
  targetKg: number;
  usedHoles: number;
  plantedDate?: string;
  progressStatus: 'Belum Mulai' | 'Semai & Peremajaan' | 'Pembesaran NFT' | 'Siap Panen';
  notes?: string;
}

export interface ProductionBatch {
  id: string;
  batchCode: string; // e.g. BATCH-PKC-2026-10
  productId: string;
  totalTargetKg: number;
  preorderSoldKg: number;
  startDate: string;
  estimatedHarvestDate: string;
  status: BatchStatus;
  allocations: BatchAllocation[];
  materialsDeducted: boolean;
  notes?: string;
}

export interface HarvestSubmission {
  id: string;
  batchId: string;
  productId: string;
  memberId: string;
  submissionDate: string;
  grossHarvestKg: number;
  status: 'pending_qc' | 'approved' | 'rejected';
  qcResult?: {
    gradeAKg: number;
    gradeBKg: number;
    rejectKg: number;
    qcNotes: string;
    verifiedAt: string;
    verifiedBy: string;
  };
}

export interface InventoryLot {
  id: string;
  batchId: string;
  productId: string;
  memberId: string;
  harvestDate: string;
  initialQtyKg: number;
  currentQtyKg: number;
  soldQtyKg: number;
  wasteQtyKg: number;
  grade: 'Grade A' | 'Grade B';
  status: 'Fresh' | 'Good' | 'Expiring' | 'Wasted' | 'Depleted';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantityKg: number;
  pricePerKg: number;
  type: 'ready' | 'preorder';
  batchId?: string; // Jika preorder
  estimatedHarvestDate?: string;
}

export interface FulfillmentAllocation {
  memberId: string;
  memberName: string;
  gardenName: string;
  location: string;
  allocatedKg: number;
  lotId?: string; // untuk ready stock
  batchId?: string; // untuk preorder
  pickupTimeWindow?: string;
}

export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'diproses'
  | 'dialokasikan'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerType: 'Retail' | 'B2B/Katering';
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentVerified: boolean;
  orderDate: string;
  allocationType?: 'Single-Fulfillment' | 'Multi-Member Split';
  fulfillments: FulfillmentAllocation[];
  allocatedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface RevenueShareRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  memberId: string;
  memberName: string;
  productId: string;
  productName: string;
  qtyKg: number;
  pricePerKg: number;
  revenueSharePercent: number;
  shareAmount: number;
  transactionDate: string;
  payoutStatus: 'accrued' | 'disbursed';
  disbursedAt?: string;
  transferProofUrl?: string;
}

export interface HistoricalSalePeriod {
  periodLabel: string;
  actualSalesKg: number;
  stockoutDetected: boolean;
  actualDemandKg?: number; // jika terjadi censored demand
}

export interface ForecastPlan {
  productId: string;
  productName: string;
  history: HistoricalSalePeriod[];
  wmaForecastReadyKg: number;
  activePreorderKg: number;
  calculatedRecommendationKg: number;
  finalTargetKg: number;
  isOverridden: boolean;
  justificationNote?: string;
  censoredDemandWarning: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'allocation' | 'harvest' | 'production' | 'finance' | 'freshness';
  title: string;
  description: string;
  actor: string;
}

export interface ManifestStop {
  stopNumber: number;
  memberId: string;
  memberName: string;
  gardenName: string;
  location: string;
  phone: string;
  pickupKg: number;
  productName: string;
  timeWindow: string;
  isPickedUp: boolean;
  pickedUpAt?: string;
}

export interface CourierManifest {
  id: string;
  manifestNumber: string;
  date: string;
  courierName: string;
  courierVehicle: string; // e.g. "Mobil Blind Van B-1982-BAQ (Sirkulasi Terbuka)"
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  totalKg: number;
  stops: ManifestStop[];
  status: 'scheduled' | 'in_transit' | 'completed';
}

export interface MaterialStandard {
  id: string;
  productId: string;
  productName: string;
  estimatedYieldPerHoleKg: number; // e.g. 0.055 kg/lubang (~18 lubang/kg)
  seedUsagePerHole: number; // butir benih per lubang
  seedUnit: string; // 'butir'
  seedBasis: string; // 'per lubang tanam'
  rockwoolUsagePerHole: number; // kubus per lubang
  rockwoolUnit: string; // 'kubus'
  rockwoolBasis: string; // 'per lubang tanam'
  nutrientUsagePerHole: number; // ml pekatan per lubang
  nutrientUnit: string; // 'ml'
  nutrientBasis: string; // 'per lubang tanam'
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface MaterialRequirementItem {
  materialType: 'seed' | 'rockwool' | 'nutrient';
  materialName: string;
  unit: string;
  requiredQty: number;
  confirmedStockQty: number | null; // null jika anggota belum konfirmasi
  shortageQty: number | null; // null jika belum konfirmasi, atau Math.max(0, requiredQty - confirmedStockQty)
}

export type MemberConfirmationStatus = 'belum_dikonfirmasi' | 'sudah_konfirmasi';
export type PlantingReadinessStatus = 'menunggu_konfirmasi' | 'siap_tanam' | 'belum_siap' | 'menolak';

export interface MaterialPlan {
  id: string; // e.g. MRP-202610-001
  batchId: string;
  batchCode: string;
  productId: string;
  productName: string;
  memberId: string;
  memberName: string;
  gardenName: string;
  targetKg: number;
  estimatedHoles: number;
  items: MaterialRequirementItem[];
  memberConfirmationStatus: MemberConfirmationStatus;
  plantingReadiness: PlantingReadinessStatus;
  confirmedAt?: string;
  readinessNotes?: string;
  createdAt: string;
}


