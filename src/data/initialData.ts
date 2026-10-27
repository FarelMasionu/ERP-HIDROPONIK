import {
  Product,
  Member,
  RawMaterial,
  ProductionBatch,
  HarvestSubmission,
  InventoryLot,
  Order,
  RevenueShareRecord,
  HistoricalSalePeriod
} from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-pakcoy',
    name: 'Pakcoy Shinta Super',
    scientificName: 'Brassica rapa subsp. chinensis',
    category: 'leafy',
    pricePerKg: 22000,
    minOrderKg: 1,
    growingDays: 30,
    shelfLifeDays: 3,
    bom: {
      seedCount: 30,
      abMixLiters: 0.08,
      rockwoolSlabs: 0.15
    },
    description: 'Pakcoy hidroponik renyah dan manis alami tanpa pestisida kimia sintetis, ditanam dengan sistem NFT tertutup.',
    image: '/src/assets/images/vegetable_fresh_harvest_box_1792232447183.jpg'
  },
  {
    id: 'prod-romaine',
    name: 'Selada Romaine Paris Island',
    scientificName: 'Lactuca sativa var. longifolia',
    category: 'leafy',
    pricePerKg: 32000,
    minOrderKg: 1,
    growingDays: 40,
    shelfLifeDays: 3,
    bom: {
      seedCount: 25,
      abMixLiters: 0.07,
      rockwoolSlabs: 0.15
    },
    description: 'Selada romaine berdaun tebal dan segar dengan batang juicy renyah, idaman hotel, restoran salad & katering.',
    image: '/src/assets/images/hero_hydroponic_greenhouse_1792232446358.jpg'
  },
  {
    id: 'prod-kangkung',
    name: 'Kangkung Hidroponik Daun Lebar',
    scientificName: 'Ipomoea aquatica',
    category: 'leafy',
    pricePerKg: 18000,
    minOrderKg: 1,
    growingDays: 22,
    shelfLifeDays: 3,
    bom: {
      seedCount: 60,
      abMixLiters: 0.05,
      rockwoolSlabs: 0.10
    },
    description: 'Kangkung hidroponik air mengalir, daun hijau cerah, batang empuk tidak liat saat ditumis, higienis bebas lumpur.',
    image: '/src/assets/images/farmer_greenhouse_inspection_1792232446951.jpg'
  },
  {
    id: 'prod-bayam-merah',
    name: 'Bayam Merah Mira Hidroponik',
    scientificName: 'Amaranthus tricolor',
    category: 'leafy',
    pricePerKg: 26000,
    minOrderKg: 1,
    growingDays: 25,
    shelfLifeDays: 3,
    bom: {
      seedCount: 80,
      abMixLiters: 0.06,
      rockwoolSlabs: 0.12
    },
    description: 'Kaya antosianin dan zat besi tinggi, warna merah marun cerah alami, rasa manis lembut digemari balita dan lansia.',
    image: '/src/assets/images/vegetable_fresh_harvest_box_1792232447183.jpg'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mbr-01',
    name: 'Pak Joko Susilo',
    gardenName: 'Kebun Hijau Berkah Lembang',
    location: 'Jl. Maribaya No. 42, Lembang, Kab. Bandung Barat',
    phone: '0812-8877-1011',
    bankAccount: {
      bankName: 'BCA',
      accountNumber: '283-091-8842',
      holderName: 'Joko Susilo'
    },
    totalHoles: 4000,
    activeLoadHoles: 2400,
    revenueSharePercent: 60,
    joinDate: '2025-03-10',
    rating: 4.9
  },
  {
    id: 'mbr-02',
    name: 'Ibu Siti Aminah',
    gardenName: 'Greenhouse Baroqah 2 Cimenyan',
    location: 'Kp. Cisanggarung RT 03/05, Cimenyan, Kab. Bandung',
    phone: '0813-2211-9988',
    bankAccount: {
      bankName: 'Bank Mandiri',
      accountNumber: '131-00-1928374-1',
      holderName: 'Siti Aminah'
    },
    totalHoles: 2500,
    activeLoadHoles: 1600,
    revenueSharePercent: 60,
    joinDate: '2025-05-18',
    rating: 4.8
  },
  {
    id: 'mbr-03',
    name: 'Kang Asep Hidayat',
    gardenName: 'Kebun Sejuk Parongpong',
    location: 'Jl. Kolonel Masturi No. 88, Parongpong, KBB',
    phone: '0857-4433-2211',
    bankAccount: {
      bankName: 'BRI',
      accountNumber: '0182-01-098765-50-3',
      holderName: 'Asep Hidayat'
    },
    totalHoles: 3200,
    activeLoadHoles: 1800,
    revenueSharePercent: 60,
    joinDate: '2025-08-01',
    rating: 4.7
  },
  {
    id: 'mbr-04',
    name: 'Mas Hendra Pratama',
    gardenName: 'Hidroponik Mandiri Cisitu',
    location: 'Jl. Cisitu Indah V No. 12, Dago, Kota Bandung',
    phone: '0821-6655-4433',
    bankAccount: {
      bankName: 'BSI (Bank Syariah Indonesia)',
      accountNumber: '711-234-9870',
      holderName: 'Hendra Pratama'
    },
    totalHoles: 2000,
    activeLoadHoles: 900,
    revenueSharePercent: 60,
    joinDate: '2025-11-12',
    rating: 4.9
  }
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'raw-seed-pakcoy',
    name: 'Benih Pakcoy Shinta Cap Panah Merah',
    type: 'seed',
    unit: 'butir',
    stock: 45000,
    minStockAlert: 10000
  },
  {
    id: 'raw-seed-romaine',
    name: 'Benih Selada Romaine Paris Island Bejo Seed',
    type: 'seed',
    unit: 'butir',
    stock: 32000,
    minStockAlert: 8000
  },
  {
    id: 'raw-seed-kangkung',
    name: 'Benih Kangkung Grand Hidro Cap Rajawali',
    type: 'seed',
    unit: 'butir',
    stock: 80000,
    minStockAlert: 15000
  },
  {
    id: 'raw-seed-bayam',
    name: 'Benih Bayam Merah Mira Unggul',
    type: 'seed',
    unit: 'butir',
    stock: 60000,
    minStockAlert: 12000
  },
  {
    id: 'raw-nutrisi-abmix',
    name: 'Konsentrat Nutrisi AB Mix Sayuran Daun Premium (A+B)',
    type: 'nutrient',
    unit: 'liter',
    stock: 145.5,
    minStockAlert: 30
  },
  {
    id: 'raw-rockwool-cultilene',
    name: 'Rockwool Media Semai Cultilene 100x15x7.5cm',
    type: 'rockwool',
    unit: 'slab',
    stock: 220,
    minStockAlert: 40
  }
];

// Reference date for consistency: 2026-10-17
export const INITIAL_BATCHES: ProductionBatch[] = [
  {
    id: 'batch-pkc-101',
    batchCode: 'BATCH-PKC-2026-10A',
    productId: 'prod-pakcoy',
    totalTargetKg: 150,
    preorderSoldKg: 85,
    startDate: '2026-09-20',
    estimatedHarvestDate: '2026-10-20',
    status: 'in_progress',
    materialsDeducted: true,
    notes: 'Siklus panen akhir Oktober untuk katering dan pesanan retail.',
    allocations: [
      {
        memberId: 'mbr-01',
        targetKg: 70,
        usedHoles: 1200,
        plantedDate: '2026-09-20',
        progressStatus: 'Pembesaran NFT',
        notes: 'EC target 1.8 mS/cm, pH 6.0'
      },
      {
        memberId: 'mbr-02',
        targetKg: 50,
        usedHoles: 850,
        plantedDate: '2026-09-20',
        progressStatus: 'Pembesaran NFT',
        notes: 'EC target 1.8 mS/cm, pH 6.2'
      },
      {
        memberId: 'mbr-04',
        targetKg: 30,
        usedHoles: 550,
        plantedDate: '2026-09-20',
        progressStatus: 'Pembesaran NFT',
        notes: 'Sistem DFT talang PVC'
      }
    ]
  },
  {
    id: 'batch-rom-201',
    batchCode: 'BATCH-ROM-2026-10B',
    productId: 'prod-romaine',
    totalTargetKg: 120,
    preorderSoldKg: 95,
    startDate: '2026-09-12',
    estimatedHarvestDate: '2026-10-22',
    status: 'in_progress',
    materialsDeducted: true,
    notes: 'Prioritas restoran salad sehat Kota Bandung.',
    allocations: [
      {
        memberId: 'mbr-01',
        targetKg: 70,
        usedHoles: 1200,
        plantedDate: '2026-09-12',
        progressStatus: 'Pembesaran NFT',
        notes: 'Suhu tandon terkontrol 22-24C'
      },
      {
        memberId: 'mbr-03',
        targetKg: 50,
        usedHoles: 900,
        plantedDate: '2026-09-12',
        progressStatus: 'Pembesaran NFT',
        notes: 'Greenhouse Parongpong'
      }
    ]
  },
  {
    id: 'batch-kgk-301',
    batchCode: 'BATCH-KGK-2026-10C',
    productId: 'prod-kangkung',
    totalTargetKg: 100,
    preorderSoldKg: 40,
    startDate: '2026-10-01',
    estimatedHarvestDate: '2026-10-23',
    status: 'in_progress',
    materialsDeducted: true,
    notes: 'Siklus cepat 22 hari panen melimpah.',
    allocations: [
      {
        memberId: 'mbr-02',
        targetKg: 50,
        usedHoles: 750,
        plantedDate: '2026-10-01',
        progressStatus: 'Pembesaran NFT'
      },
      {
        memberId: 'mbr-03',
        targetKg: 50,
        usedHoles: 900,
        plantedDate: '2026-10-01',
        progressStatus: 'Pembesaran NFT'
      }
    ]
  }
];

// Current Inventory in member gardens (Decentralized, shelf life 3 days)
// Today is 2026-10-17:
// Harvest 2026-10-17 = Hari 1 (Fresh)
// Harvest 2026-10-16 = Hari 2 (Good)
// Harvest 2026-10-15 = Hari 3 (Expiring - "Segera Jual")
// Harvest 2026-10-14 = Hari 4 (Overdue - Catat Susut)
export const INITIAL_INVENTORY_LOTS: InventoryLot[] = [
  {
    id: 'lot-01',
    batchId: 'batch-prev-pkc-01',
    productId: 'prod-pakcoy',
    memberId: 'mbr-01',
    harvestDate: '2026-10-17', // Hari ke-1 (Segar)
    initialQtyKg: 45,
    currentQtyKg: 28,
    soldQtyKg: 17,
    wasteQtyKg: 0,
    grade: 'Grade A',
    status: 'Fresh'
  },
  {
    id: 'lot-02',
    batchId: 'batch-prev-pkc-01',
    productId: 'prod-pakcoy',
    memberId: 'mbr-02',
    harvestDate: '2026-10-16', // Hari ke-2 (Prima)
    initialQtyKg: 30,
    currentQtyKg: 12,
    soldQtyKg: 18,
    wasteQtyKg: 0,
    grade: 'Grade A',
    status: 'Good'
  },
  {
    id: 'lot-03',
    batchId: 'batch-prev-rom-01',
    productId: 'prod-romaine',
    memberId: 'mbr-03',
    harvestDate: '2026-10-15', // Hari ke-3 (Segera Jual!)
    initialQtyKg: 25,
    currentQtyKg: 8,
    soldQtyKg: 17,
    wasteQtyKg: 0,
    grade: 'Grade A',
    status: 'Expiring'
  },
  {
    id: 'lot-04',
    batchId: 'batch-prev-kgk-01',
    productId: 'prod-kangkung',
    memberId: 'mbr-04',
    harvestDate: '2026-10-17', // Hari ke-1 (Segar)
    initialQtyKg: 35,
    currentQtyKg: 25,
    soldQtyKg: 10,
    wasteQtyKg: 0,
    grade: 'Grade A',
    status: 'Fresh'
  },
  {
    id: 'lot-05',
    batchId: 'batch-prev-bym-01',
    productId: 'prod-bayam-merah',
    memberId: 'mbr-01',
    harvestDate: '2026-10-16', // Hari ke-2 (Prima)
    initialQtyKg: 20,
    currentQtyKg: 9,
    soldQtyKg: 11,
    wasteQtyKg: 0,
    grade: 'Grade A',
    status: 'Good'
  }
];

export const INITIAL_HARVEST_SUBMISSIONS: HarvestSubmission[] = [
  {
    id: 'sub-01',
    batchId: 'batch-pkc-101',
    productId: 'prod-pakcoy',
    memberId: 'mbr-03',
    submissionDate: '2026-10-17',
    grossHarvestKg: 32,
    status: 'pending_qc'
  },
  {
    id: 'sub-02',
    batchId: 'batch-rom-201',
    productId: 'prod-romaine',
    memberId: 'mbr-04',
    submissionDate: '2026-10-16',
    grossHarvestKg: 28,
    status: 'approved',
    qcResult: {
      gradeAKg: 25,
      gradeBKg: 2,
      rejectKg: 1,
      qcNotes: 'Kualitas tajuk sangat rapat, bebas hama ulat.',
      verifiedAt: '2026-10-16 16:30',
      verifiedBy: 'Admin Operasional Al-Baroqah'
    }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-20261017-001',
    customerName: 'CV Dapur Berkah Katering',
    customerPhone: '0811-9988-7766',
    customerEmail: 'kateringberkah@gmail.com',
    customerAddress: 'Jl. Surya Sumantri No. 54, Pasteur, Bandung',
    customerType: 'B2B/Katering',
    items: [
      {
        productId: 'prod-pakcoy',
        productName: 'Pakcoy Shinta Super',
        quantityKg: 25,
        pricePerKg: 22000,
        type: 'ready'
      }
    ],
    totalAmount: 550000,
    status: 'dialokasikan',
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer+BCA+Rp+550.000',
    paymentVerified: true,
    orderDate: '2026-10-17 08:30',
    allocationType: 'Single-Fulfillment',
    fulfillments: [
      {
        memberId: 'mbr-01',
        memberName: 'Pak Joko Susilo',
        gardenName: 'Kebun Hijau Berkah Lembang',
        location: 'Jl. Maribaya No. 42, Lembang',
        allocatedKg: 25,
        lotId: 'lot-01',
        pickupTimeWindow: 'Hari ini, 13:00 - 15:00 WIB'
      }
    ],
    allocatedAt: '2026-10-17 09:15',
    notes: 'Pesanan untuk makan siang kantor Senin. Jemput di kebun Pak Joko.'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-20261017-002',
    customerName: 'Restoran Salad Bar Parahyangan',
    customerPhone: '0812-3344-5566',
    customerEmail: 'purchase@greensaladbar.id',
    customerAddress: 'Jl. R.E. Martadinata No. 112, Bandung',
    customerType: 'B2B/Katering',
    items: [
      {
        productId: 'prod-romaine',
        productName: 'Selada Romaine Paris Island',
        quantityKg: 50,
        pricePerKg: 32000,
        type: 'preorder',
        batchId: 'batch-rom-201',
        estimatedHarvestDate: '2026-10-22'
      }
    ],
    totalAmount: 1600000,
    status: 'diproses',
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer+Mandiri+Rp+1.600.000',
    paymentVerified: true,
    orderDate: '2026-10-17 09:00',
    fulfillments: [],
    notes: 'Pre-order batch panen 22 Oktober 2026. Menunggu konfirmasi alokasi single/multi.'
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-20261017-003',
    customerName: 'Ibu Ratna Dewi',
    customerPhone: '0856-7890-1234',
    customerEmail: 'ratnadewi@gmail.com',
    customerAddress: 'Kompleks Setiabudi Regency Blok C3 No. 8, Bandung',
    customerType: 'Retail',
    items: [
      {
        productId: 'prod-kangkung',
        productName: 'Kangkung Hidroponik Daun Lebar',
        quantityKg: 3,
        pricePerKg: 18000,
        type: 'ready'
      },
      {
        productId: 'prod-bayam-merah',
        productName: 'Bayam Merah Mira Hidroponik',
        quantityKg: 2,
        pricePerKg: 26000,
        type: 'ready'
      }
    ],
    totalAmount: 106000,
    status: 'menunggu_pembayaran',
    paymentVerified: false,
    orderDate: '2026-10-17 10:10',
    fulfillments: []
  },
  {
    id: 'ord-1000',
    orderNumber: 'ORD-20261016-098',
    customerName: 'Healthy Bowls Cafe',
    customerPhone: '0813-9090-8877',
    customerEmail: 'chef@healthybowls.co.id',
    customerAddress: 'Jl. Progo No. 22, Bandung Wetan',
    customerType: 'B2B/Katering',
    items: [
      {
        productId: 'prod-pakcoy',
        productName: 'Pakcoy Shinta Super',
        quantityKg: 35,
        pricePerKg: 22000,
        type: 'ready'
      }
    ],
    totalAmount: 770000,
    status: 'selesai',
    paymentProofUrl: 'https://placehold.co/400x600/png?text=Bukti+Transfer+Lunas',
    paymentVerified: true,
    orderDate: '2026-10-16 07:00',
    allocationType: 'Multi-Member Split',
    fulfillments: [
      {
        memberId: 'mbr-01',
        memberName: 'Pak Joko Susilo',
        gardenName: 'Kebun Hijau Berkah Lembang',
        location: 'Jl. Maribaya No. 42, Lembang',
        allocatedKg: 20,
        lotId: 'lot-01',
        pickupTimeWindow: 'Selesai dijemput'
      },
      {
        memberId: 'mbr-02',
        memberName: 'Ibu Siti Aminah',
        gardenName: 'Greenhouse Baroqah 2 Cimenyan',
        location: 'Kp. Cisanggarung, Cimenyan',
        allocatedKg: 15,
        lotId: 'lot-02',
        pickupTimeWindow: 'Selesai dijemput'
      }
    ],
    allocatedAt: '2026-10-16 08:30',
    completedAt: '2026-10-16 15:45',
    notes: 'Multi-member split dieksekusi via FIFO. Telah diterima pembeli & bagi hasil tercatat.'
  }
];

export const INITIAL_REVENUE_RECORDS: RevenueShareRecord[] = [
  {
    id: 'rev-001',
    orderId: 'ord-1000',
    orderNumber: 'ORD-20261016-098',
    memberId: 'mbr-01',
    memberName: 'Pak Joko Susilo',
    productId: 'prod-pakcoy',
    productName: 'Pakcoy Shinta Super',
    qtyKg: 20,
    pricePerKg: 22000,
    revenueSharePercent: 60,
    shareAmount: 20 * 22000 * 0.6, // 264.000
    transactionDate: '2026-10-16 15:45',
    payoutStatus: 'accrued'
  },
  {
    id: 'rev-002',
    orderId: 'ord-1000',
    orderNumber: 'ORD-20261016-098',
    memberId: 'mbr-02',
    memberName: 'Ibu Siti Aminah',
    productId: 'prod-pakcoy',
    productName: 'Pakcoy Shinta Super',
    qtyKg: 15,
    pricePerKg: 22000,
    revenueSharePercent: 60,
    shareAmount: 15 * 22000 * 0.6, // 198.000
    transactionDate: '2026-10-16 15:45',
    payoutStatus: 'accrued'
  },
  {
    id: 'rev-000-prev',
    orderId: 'ord-0995',
    orderNumber: 'ORD-20261014-044',
    memberId: 'mbr-01',
    memberName: 'Pak Joko Susilo',
    productId: 'prod-romaine',
    productName: 'Selada Romaine Paris Island',
    qtyKg: 30,
    pricePerKg: 32000,
    revenueSharePercent: 60,
    shareAmount: 30 * 32000 * 0.6, // 576.000
    transactionDate: '2026-10-14 14:00',
    payoutStatus: 'disbursed',
    disbursedAt: '2026-10-15 10:00',
    transferProofUrl: 'https://placehold.co/400x600/png?text=Transfer+BCA+Lunas'
  }
];

export const HISTORICAL_SALES_BY_PRODUCT: Record<string, HistoricalSalePeriod[]> = {
  'prod-pakcoy': [
    { periodLabel: 'Agustus 2026 (P-2)', actualSalesKg: 120, stockoutDetected: false },
    { periodLabel: 'September 2026 (P-1)', actualSalesKg: 145, stockoutDetected: true, actualDemandKg: 160 },
    { periodLabel: 'Oktober 2026 Berjalan (P)', actualSalesKg: 165, stockoutDetected: false }
  ],
  'prod-romaine': [
    { periodLabel: 'Agustus 2026 (P-2)', actualSalesKg: 90, stockoutDetected: false },
    { periodLabel: 'September 2026 (P-1)', actualSalesKg: 105, stockoutDetected: false },
    { periodLabel: 'Oktober 2026 Berjalan (P)', actualSalesKg: 125, stockoutDetected: true, actualDemandKg: 140 }
  ],
  'prod-kangkung': [
    { periodLabel: 'Agustus 2026 (P-2)', actualSalesKg: 80, stockoutDetected: false },
    { periodLabel: 'September 2026 (P-1)', actualSalesKg: 85, stockoutDetected: false },
    { periodLabel: 'Oktober 2026 Berjalan (P)', actualSalesKg: 95, stockoutDetected: false }
  ],
  'prod-bayam-merah': [
    { periodLabel: 'Agustus 2026 (P-2)', actualSalesKg: 50, stockoutDetected: false },
    { periodLabel: 'September 2026 (P-1)', actualSalesKg: 55, stockoutDetected: false },
    { periodLabel: 'Oktober 2026 Berjalan (P)', actualSalesKg: 65, stockoutDetected: false }
  ]
};

export const INITIAL_NUTRIENT_LOGS = [
  {
    id: 'log-01',
    batchId: 'batch-pkc-101',
    memberId: 'mbr-01',
    date: '2026-10-17',
    ecValue: 2.0,
    phValue: 6.1,
    waterTempCelsius: 23.5,
    status: 'optimal' as const,
    notes: 'Kondisi air tandon sangat jernih, sirkulasi NFT lancar.'
  },
  {
    id: 'log-02',
    batchId: 'batch-pkc-101',
    memberId: 'mbr-02',
    date: '2026-10-17',
    ecValue: 1.9,
    phValue: 6.3,
    waterTempCelsius: 24.0,
    status: 'optimal' as const,
    notes: 'Pertumbuhan daun hijau tua tebal.'
  },
  {
    id: 'log-03',
    batchId: 'batch-rom-201',
    memberId: 'mbr-03',
    date: '2026-10-16',
    ecValue: 2.1,
    phValue: 6.2,
    waterTempCelsius: 22.8,
    status: 'optimal' as const,
    notes: 'Suhu sejuk Lembang sangat mendukung kerapatan krop selada.'
  }
];

export const INITIAL_COURIER_TRIPS = [
  {
    tripId: 'TRIP-20261017-01',
    orderId: 'ord-1001',
    driverName: 'Pak Dadan Suhendar',
    vehicleType: 'Mobil Blind Van Berpendingin' as const,
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
    status: 'in_transit' as const
  }
];

export const INITIAL_MATERIAL_STANDARDS: import('../types').MaterialStandard[] = [
  {
    id: 'std-pakcoy',
    productId: 'prod-pakcoy',
    productName: 'Pakcoy Shinta Super',
    estimatedYieldPerHoleKg: 0.055, // ~18.2 lubang per kg
    seedUsagePerHole: 1.2, // 1.2 butir benih per lubang
    seedUnit: 'butir',
    seedBasis: 'per lubang tanam',
    rockwoolUsagePerHole: 1.0, // 1 kubus per lubang
    rockwoolUnit: 'kubus',
    rockwoolBasis: 'per lubang tanam',
    nutrientUsagePerHole: 4.5, // 4.5 ml pekatan AB Mix per lubang per siklus
    nutrientUnit: 'ml',
    nutrientBasis: 'per lubang tanam',
    isActive: true,
    updatedAt: '2026-10-15 09:00',
    updatedBy: 'Admin Agronomi Al-Baroqah'
  },
  {
    id: 'std-romaine',
    productId: 'prod-romaine',
    productName: 'Selada Romaine Paris Island',
    estimatedYieldPerHoleKg: 0.058, // ~17.2 lubang per kg
    seedUsagePerHole: 1.1,
    seedUnit: 'butir',
    seedBasis: 'per lubang tanam',
    rockwoolUsagePerHole: 1.0,
    rockwoolUnit: 'kubus',
    rockwoolBasis: 'per lubang tanam',
    nutrientUsagePerHole: 4.2,
    nutrientUnit: 'ml',
    nutrientBasis: 'per lubang tanam',
    isActive: true,
    updatedAt: '2026-10-15 09:15',
    updatedBy: 'Admin Agronomi Al-Baroqah'
  },
  {
    id: 'std-kangkung',
    productId: 'prod-kangkung',
    productName: 'Kangkung Hidroponik Daun Lebar',
    estimatedYieldPerHoleKg: 0.070, // ~14.3 lubang per kg
    seedUsagePerHole: 4.5, // 4-5 benih per netpot
    seedUnit: 'butir',
    seedBasis: 'per lubang tanam',
    rockwoolUsagePerHole: 1.0,
    rockwoolUnit: 'kubus',
    rockwoolBasis: 'per lubang tanam',
    nutrientUsagePerHole: 3.5,
    nutrientUnit: 'ml',
    nutrientBasis: 'per lubang tanam',
    isActive: true,
    updatedAt: '2026-10-15 09:30',
    updatedBy: 'Admin Agronomi Al-Baroqah'
  },
  {
    id: 'std-bayam-merah',
    productId: 'prod-bayam-merah',
    productName: 'Bayam Merah Mira Hidroponik',
    estimatedYieldPerHoleKg: 0.050, // ~20 lubang per kg
    seedUsagePerHole: 4.0,
    seedUnit: 'butir',
    seedBasis: 'per lubang tanam',
    rockwoolUsagePerHole: 1.0,
    rockwoolUnit: 'kubus',
    rockwoolBasis: 'per lubang tanam',
    nutrientUsagePerHole: 3.8,
    nutrientUnit: 'ml',
    nutrientBasis: 'per lubang tanam',
    isActive: true,
    updatedAt: '2026-10-15 09:45',
    updatedBy: 'Admin Agronomi Al-Baroqah'
  }
];

export const INITIAL_MATERIAL_PLANS: import('../types').MaterialPlan[] = [
  {
    id: 'MRP-202610-001',
    batchId: 'batch-pkc-101',
    batchCode: 'BATCH-PKC-2026-10A',
    productId: 'prod-pakcoy',
    productName: 'Pakcoy Shinta Super',
    memberId: 'mbr-01',
    memberName: 'Pak Joko Susilo',
    gardenName: 'Kebun Hijau Berkah Lembang',
    targetKg: 70,
    estimatedHoles: 1273, // 70 / 0.055
    items: [
      {
        materialType: 'seed',
        materialName: 'Benih Pakcoy Shinta',
        unit: 'butir',
        requiredQty: 1528, // 1273 * 1.2
        confirmedStockQty: 1600,
        shortageQty: 0
      },
      {
        materialType: 'rockwool',
        materialName: 'Rockwool Media Semai (Kubus)',
        unit: 'kubus',
        requiredQty: 1273,
        confirmedStockQty: 1300,
        shortageQty: 0
      },
      {
        materialType: 'nutrient',
        materialName: 'Pekatan Nutrisi AB Mix',
        unit: 'ml',
        requiredQty: 5729, // 1273 * 4.5
        confirmedStockQty: 6000,
        shortageQty: 0
      }
    ],
    memberConfirmationStatus: 'sudah_konfirmasi',
    plantingReadiness: 'siap_tanam',
    confirmedAt: '2026-10-16 11:30',
    readinessNotes: 'Seluruh stok benih panah merah, rockwool kubus, dan AB Mix pekat sudah tersedia di tandon kebun Lembang.',
    createdAt: '2026-10-16 08:00'
  },
  {
    id: 'MRP-202610-002',
    batchId: 'batch-pkc-101',
    batchCode: 'BATCH-PKC-2026-10A',
    productId: 'prod-pakcoy',
    productName: 'Pakcoy Shinta Super',
    memberId: 'mbr-02',
    memberName: 'Ibu Siti Aminah',
    gardenName: 'Greenhouse Baroqah 2 Cimenyan',
    targetKg: 50,
    estimatedHoles: 910, // 50 / 0.055
    items: [
      {
        materialType: 'seed',
        materialName: 'Benih Pakcoy Shinta',
        unit: 'butir',
        requiredQty: 1092, // 910 * 1.2
        confirmedStockQty: 800,
        shortageQty: 292
      },
      {
        materialType: 'rockwool',
        materialName: 'Rockwool Media Semai (Kubus)',
        unit: 'kubus',
        requiredQty: 910,
        confirmedStockQty: 950,
        shortageQty: 0
      },
      {
        materialType: 'nutrient',
        materialName: 'Pekatan Nutrisi AB Mix',
        unit: 'ml',
        requiredQty: 4095, // 910 * 4.5
        confirmedStockQty: 2500,
        shortageQty: 1595
      }
    ],
    memberConfirmationStatus: 'sudah_konfirmasi',
    plantingReadiness: 'belum_siap',
    confirmedAt: '2026-10-16 14:15',
    readinessNotes: 'Benih kurang 292 butir dan nutrisi pekat kurang 1.6 liter. Sedang dalam pengiriman toko pertanian setempat.',
    createdAt: '2026-10-16 08:00'
  },
  {
    id: 'MRP-202610-003',
    batchId: 'batch-pkc-101',
    batchCode: 'BATCH-PKC-2026-10A',
    productId: 'prod-pakcoy',
    productName: 'Pakcoy Shinta Super',
    memberId: 'mbr-04',
    memberName: 'Mas Hendra Pratama',
    gardenName: 'Hidroponik Mandiri Cisitu',
    targetKg: 30,
    estimatedHoles: 546, // 30 / 0.055
    items: [
      {
        materialType: 'seed',
        materialName: 'Benih Pakcoy Shinta',
        unit: 'butir',
        requiredQty: 655, // 546 * 1.2
        confirmedStockQty: null,
        shortageQty: null
      },
      {
        materialType: 'rockwool',
        materialName: 'Rockwool Media Semai (Kubus)',
        unit: 'kubus',
        requiredQty: 546,
        confirmedStockQty: null,
        shortageQty: null
      },
      {
        materialType: 'nutrient',
        materialName: 'Pekatan Nutrisi AB Mix',
        unit: 'ml',
        requiredQty: 2457, // 546 * 4.5
        confirmedStockQty: null,
        shortageQty: null
      }
    ],
    memberConfirmationStatus: 'belum_dikonfirmasi',
    plantingReadiness: 'menunggu_konfirmasi',
    createdAt: '2026-10-16 08:00'
  },
  {
    id: 'MRP-202610-004',
    batchId: 'batch-rom-201',
    batchCode: 'BATCH-ROM-2026-10B',
    productId: 'prod-romaine',
    productName: 'Selada Romaine Paris Island',
    memberId: 'mbr-03',
    memberName: 'Kang Asep Hidayat',
    gardenName: 'Kebun Sejuk Parongpong',
    targetKg: 50,
    estimatedHoles: 863, // 50 / 0.058
    items: [
      {
        materialType: 'seed',
        materialName: 'Benih Selada Romaine',
        unit: 'butir',
        requiredQty: 949, // 863 * 1.1
        confirmedStockQty: 0,
        shortageQty: 949
      },
      {
        materialType: 'rockwool',
        materialName: 'Rockwool Media Semai (Kubus)',
        unit: 'kubus',
        requiredQty: 863,
        confirmedStockQty: 0,
        shortageQty: 863
      },
      {
        materialType: 'nutrient',
        materialName: 'Pekatan Nutrisi AB Mix',
        unit: 'ml',
        requiredQty: 3625, // 863 * 4.2
        confirmedStockQty: 0,
        shortageQty: 3625
      }
    ],
    memberConfirmationStatus: 'sudah_konfirmasi',
    plantingReadiness: 'menolak',
    confirmedAt: '2026-10-16 16:40',
    readinessNotes: 'Menolak alokasi batch ini: Talang NFT blok B sedang dalam perbaikan kebocoran pipa utama, baru bisa tanam siklus depan.',
    createdAt: '2026-10-16 08:00'
  }
];


