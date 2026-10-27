'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Member, RawMaterial, CropCategory } from '../../types';
import { formatRupiah } from '../../utils/scmAlgorithms';
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sprout,
  Users,
  Boxes,
  SlidersHorizontal,
  Check,
  X,
  AlertCircle,
  Building,
  Phone,
  CreditCard,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const MasterDataManagement: React.FC = () => {
  const {
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
    restockRawMaterial,
    materialStandards
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'members' | 'materials' | 'standards'>('products');
  const [searchTerm, setSearchTerm] = useState('');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    scientificName: '',
    category: 'leafy' as CropCategory,
    pricePerKg: 20000,
    minOrderKg: 1,
    growingDays: 30,
    shelfLifeDays: 3,
    seedCount: 30,
    abMixLiters: 0.08,
    rockwoolSlabs: 0.15,
    description: '',
    image: '/src/assets/images/vegetable_fresh_harvest_box_1792232447183.jpg'
  });

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({
    id: '',
    name: '',
    gardenName: '',
    location: '',
    phone: '',
    bankName: 'BCA',
    accountNumber: '',
    holderName: '',
    totalHoles: 3000,
    revenueSharePercent: 60
  });

  // Material Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [materialForm, setMaterialForm] = useState({
    id: '',
    name: '',
    type: 'seed' as 'seed' | 'nutrient' | 'rockwool',
    unit: 'butir',
    stock: 1000,
    minStockAlert: 200
  });

  // Restock quick prompt
  const [quickRestockItem, setQuickRestockItem] = useState<{ id: string; name: string; unit: string } | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(100);

  // Filtered lists
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.gardenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaterials = rawMaterials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Product Modal (New or Edit)
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        id: prod.id,
        name: prod.name,
        scientificName: prod.scientificName,
        category: prod.category,
        pricePerKg: prod.pricePerKg,
        minOrderKg: prod.minOrderKg,
        growingDays: prod.growingDays,
        shelfLifeDays: prod.shelfLifeDays,
        seedCount: prod.bom.seedCount,
        abMixLiters: prod.bom.abMixLiters,
        rockwoolSlabs: prod.bom.rockwoolSlabs,
        description: prod.description,
        image: prod.image
      });
    } else {
      setEditingProduct(null);
      const newId = `prod-crop-${Date.now().toString().slice(-4)}`;
      setProductForm({
        id: newId,
        name: '',
        scientificName: '',
        category: 'leafy',
        pricePerKg: 25000,
        minOrderKg: 1,
        growingDays: 30,
        shelfLifeDays: 3,
        seedCount: 30,
        abMixLiters: 0.08,
        rockwoolSlabs: 0.15,
        description: 'Sayuran hidroponik segar panen harian berkualitas premium.',
        image: '/src/assets/images/vegetable_fresh_harvest_box_1792232447183.jpg'
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    const newProd: Product = {
      id: productForm.id,
      name: productForm.name,
      scientificName: productForm.scientificName,
      category: productForm.category,
      pricePerKg: Number(productForm.pricePerKg),
      minOrderKg: Number(productForm.minOrderKg),
      growingDays: Number(productForm.growingDays),
      shelfLifeDays: Number(productForm.shelfLifeDays),
      bom: {
        seedCount: Number(productForm.seedCount),
        abMixLiters: Number(productForm.abMixLiters),
        rockwoolSlabs: Number(productForm.rockwoolSlabs)
      },
      description: productForm.description,
      image: productForm.image
    };

    if (editingProduct) {
      updateProduct(newProd);
    } else {
      addProduct(newProd);
    }
    setIsProductModalOpen(false);
  };

  // Open Member Modal (New or Edit)
  const handleOpenMemberModal = (mbr?: Member) => {
    if (mbr) {
      setEditingMember(mbr);
      setMemberForm({
        id: mbr.id,
        name: mbr.name,
        gardenName: mbr.gardenName,
        location: mbr.location,
        phone: mbr.phone,
        bankName: mbr.bankAccount.bankName,
        accountNumber: mbr.bankAccount.accountNumber,
        holderName: mbr.bankAccount.holderName,
        totalHoles: mbr.totalHoles,
        revenueSharePercent: mbr.revenueSharePercent
      });
    } else {
      setEditingMember(null);
      const newId = `mbr-${String(members.length + 1).padStart(2, '0')}`;
      setMemberForm({
        id: newId,
        name: '',
        gardenName: '',
        location: '',
        phone: '',
        bankName: 'BCA',
        accountNumber: '',
        holderName: '',
        totalHoles: 3000,
        revenueSharePercent: 60
      });
    }
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.gardenName) return;

    const newMbr: Member = {
      id: memberForm.id,
      name: memberForm.name,
      gardenName: memberForm.gardenName,
      location: memberForm.location,
      phone: memberForm.phone,
      bankAccount: {
        bankName: memberForm.bankName,
        accountNumber: memberForm.accountNumber,
        holderName: memberForm.holderName || memberForm.name
      },
      totalHoles: Number(memberForm.totalHoles),
      activeLoadHoles: editingMember ? editingMember.activeLoadHoles : 0,
      revenueSharePercent: Number(memberForm.revenueSharePercent),
      joinDate: editingMember ? editingMember.joinDate : new Date().toISOString().slice(0, 10),
      rating: editingMember ? editingMember.rating : 5.0
    };

    if (editingMember) {
      updateMember(newMbr);
    } else {
      addMember(newMbr);
    }
    setIsMemberModalOpen(false);
  };

  // Open Material Modal (New or Edit)
  const handleOpenMaterialModal = (mat?: RawMaterial) => {
    if (mat) {
      setEditingMaterial(mat);
      setMaterialForm({
        id: mat.id,
        name: mat.name,
        type: mat.type,
        unit: mat.unit,
        stock: mat.stock,
        minStockAlert: mat.minStockAlert
      });
    } else {
      setEditingMaterial(null);
      const newId = `mat-${Date.now().toString().slice(-4)}`;
      setMaterialForm({
        id: newId,
        name: '',
        type: 'seed',
        unit: 'butir',
        stock: 1000,
        minStockAlert: 200
      });
    }
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name) return;

    const newMat: RawMaterial = {
      id: materialForm.id,
      name: materialForm.name,
      type: materialForm.type,
      unit: materialForm.unit,
      stock: Number(materialForm.stock),
      minStockAlert: Number(materialForm.minStockAlert)
    };

    if (editingMaterial) {
      updateRawMaterial(newMat);
    } else {
      addRawMaterial(newMat);
    }
    setIsMaterialModalOpen(false);
  };

  // Quick Restock
  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRestockItem || restockAmount <= 0) return;
    restockRawMaterial(quickRestockItem.id, Number(restockAmount));
    setQuickRestockItem(null);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Data Master Terpadu
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-800 border-2 border-emerald-300 uppercase">
              Master Directory
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Kelola data fundamental komoditas produk, struktur BOM (Bill of Materials), direktori mitra petani, dan sarana produksi bahan baku.
          </p>
        </div>

        {/* Action Button based on active tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'products' && (
            <button
              onClick={() => handleOpenProductModal()}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-2xs border-2 border-emerald-800"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          )}
          {activeTab === 'members' && (
            <button
              onClick={() => handleOpenMemberModal()}
              className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-2xs border-2 border-sky-800"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mitra Baru</span>
            </button>
          )}
          {activeTab === 'materials' && (
            <button
              onClick={() => handleOpenMaterialModal()}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-2xs border-2 border-amber-800"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bahan Baku</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border-2 border-emerald-300 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">Komoditas Produk</span>
            <Sprout className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{products.length}</div>
          <div className="text-xs text-slate-600 font-medium mt-1">Sayuran daun & herba aktif</div>
        </div>

        <div className="p-4 bg-white border-2 border-sky-300 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-950">Mitra Petani Kebun</span>
            <Users className="w-4.5 h-4.5 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{members.length}</div>
          <div className="text-xs text-slate-600 font-medium mt-1">
            Total {members.reduce((acc, m) => acc + m.totalHoles, 0).toLocaleString()} lubang tanam
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-amber-300 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-950">SKU Bahan Baku</span>
            <Boxes className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{rawMaterials.length}</div>
          <div className="text-xs text-slate-600 font-medium mt-1">Benih, nutrisi AB Mix, rockwool</div>
        </div>

        <div className="p-4 bg-white border-2 border-indigo-300 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">Standar BOM Kebun</span>
            <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{materialStandards.length}</div>
          <div className="text-xs text-slate-600 font-medium mt-1">Formula agronomi per kg</div>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="bg-white border-2 border-slate-200 rounded-lg shadow-2xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 border-2 shadow-2xs ${
              activeTab === 'products'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Master Produk & BOM ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 border-2 shadow-2xs ${
              activeTab === 'members'
                ? 'bg-sky-800 text-white border-sky-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-sky-50 hover:border-sky-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Mitra Petani ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 border-2 shadow-2xs ${
              activeTab === 'materials'
                ? 'bg-amber-800 text-white border-amber-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-300'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Master Bahan Baku ({rawMaterials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 border-2 shadow-2xs ${
              activeTab === 'standards'
                ? 'bg-indigo-800 text-white border-indigo-800'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Standar Agronomi Kebun</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID, nama, atau lokasi..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans"
          />
        </div>
      </div>

      {/* TAB CONTENT 1: MASTER DATA PRODUK */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Direktori Komoditas Produk & Spesifikasi BOM
              </div>
              <div className="text-[11px] text-slate-500">
                Setiap kilogram panen terikat dengan formula bahan baku dan masa kedaluwarsa kesegaran 3 hari.
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              {filteredProducts.length} Produk Ditampilkan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Kode / ID</th>
                  <th className="py-2.5 px-3">Nama Produk & Botani</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Harga Jual / kg</th>
                  <th className="py-2.5 px-3 text-center">Siklus Tanam</th>
                  <th className="py-2.5 px-3 text-center">Shelf Life</th>
                  <th className="py-2.5 px-3">Formula BOM (per kg Panen)</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-900">
                      {p.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 italic font-mono">{p.scientificName}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium border border-slate-200 bg-slate-100 text-slate-700 capitalize">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatRupiah(p.pricePerKg)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                      <span className="font-semibold text-slate-800">{p.growingDays}</span>
                      <span className="text-slate-400 text-[10px] ml-0.5">hari</span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px]">
                        {p.shelfLifeDays} Hari
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[10px] text-slate-600 font-mono space-y-0.5">
                        <div>🌱 Benih: <strong className="text-slate-900">{p.bom.seedCount}</strong> butir</div>
                        <div>🧪 AB Mix: <strong className="text-slate-900">{p.bom.abMixLiters}</strong> L pekat</div>
                        <div>🧱 Rockwool: <strong className="text-slate-900">{p.bom.rockwoolSlabs}</strong> slab</div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenProductModal(p)}
                          className="p-1 text-slate-600 hover:text-slate-900 rounded border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus produk ${p.name}? Tindakan ini tidak dapat dibatalkan.`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:text-rose-800 rounded border border-rose-200 bg-white hover:bg-rose-50 shadow-2xs"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400 font-sans">
                      Tidak ada data produk yang cocok dengan pencarian "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: MASTER DATA MITRA */}
      {activeTab === 'members' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Direktori Petani Mitra & Titik Kebun Hidroponik
              </div>
              <div className="text-[11px] text-slate-500">
                Pusat data mitra petani terintegrasi untuk pembagian kuota tanam dan perhitungan bagi hasil panen terjual (60%).
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              {filteredMembers.length} Mitra Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ID Mitra</th>
                  <th className="py-2.5 px-3">Nama Petani & Kebun</th>
                  <th className="py-2.5 px-3">Lokasi / Alamat</th>
                  <th className="py-2.5 px-3">Kontak</th>
                  <th className="py-2.5 px-3">Rekening Pencairan Bagi Hasil</th>
                  <th className="py-2.5 px-3 text-right">Kapasitas Lubang</th>
                  <th className="py-2.5 px-3 text-center">Bagi Hasil</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-900">
                      {m.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{m.gardenName}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 max-w-[220px]">
                      <div className="truncate text-[11px]">{m.location}</div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {m.phone}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[11px] font-semibold text-slate-900 font-mono">
                        {m.bankAccount.bankName} · {m.bankAccount.accountNumber}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        a.n. {m.bankAccount.holderName}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <div className="font-bold text-slate-900">
                        {m.totalHoles.toLocaleString()} <span className="text-slate-400 text-[10px] font-normal">lubang</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Terpakai: {m.activeLoadHoles.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold text-[10px]">
                        {m.revenueSharePercent}% Mitra
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenMemberModal(m)}
                        className="p-1 text-slate-600 hover:text-slate-900 rounded border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                        title="Edit Profil Mitra"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400 font-sans">
                      Tidak ada data mitra yang cocok dengan pencarian "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MASTER DATA BAHAN BAKU */}
      {activeTab === 'materials' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Direktori Bahan Baku & Sarana Produksi Gudang
              </div>
              <div className="text-[11px] text-slate-500">
                Stok sarana produksi untuk penyaluran ke kebun mitra dan pemenuhan alokasi batch tanam.
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-600">
              {filteredMaterials.length} SKU Bahan Baku
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Kode SKU</th>
                  <th className="py-2.5 px-3">Nama Bahan Baku</th>
                  <th className="py-2.5 px-3">Tipe Kategori</th>
                  <th className="py-2.5 px-3">Satuan</th>
                  <th className="py-2.5 px-3 text-right">Stok Gudang</th>
                  <th className="py-2.5 px-3 text-right">Batas Min (ROP)</th>
                  <th className="py-2.5 px-3 text-center">Status Gudang</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredMaterials.map((m) => {
                  const isLow = m.stock <= m.minStockAlert;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-900">
                        {m.id}
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {m.name}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium border border-slate-200 bg-slate-100 text-slate-700 uppercase">
                          {m.type}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {m.unit}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        {m.stock.toLocaleString()} {m.unit}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        {m.minStockAlert.toLocaleString()} {m.unit}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {isLow ? (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            Perlu Restok
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Stok Aman
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setQuickRestockItem({ id: m.id, name: m.name, unit: m.unit });
                              setRestockAmount(100);
                            }}
                            className="px-2 py-1 text-[10px] font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 shadow-2xs"
                          >
                            + Restok
                          </button>
                          <button
                            onClick={() => handleOpenMaterialModal(m)}
                            className="p-1 text-slate-600 hover:text-slate-900 rounded border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
                            title="Edit Bahan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400 font-sans">
                      Tidak ada data bahan baku yang cocok dengan pencarian "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: MASTER STANDAR AGRONOMI & BOM */}
      {activeTab === 'standards' && (
        <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3.5 border-b-2 border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Parameter Agronomi Standar & Rasio BOM Terpadu
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Formula pengali standar kebutuhan sarana produksi untuk perhitungan Material Requirement Planning (MRP).
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-100/70 border border-indigo-200 px-2.5 py-1 rounded">
              {materialStandards.length} Standar Terdefinisi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Komoditas Produk</th>
                  <th className="py-2.5 px-3 text-right">Estimasi Yield / Lubang</th>
                  <th className="py-2.5 px-3 text-right">Rasio Lubang / kg</th>
                  <th className="py-2.5 px-3 text-right">Benih / Lubang</th>
                  <th className="py-2.5 px-3 text-right">Media Rockwool / Lubang</th>
                  <th className="py-2.5 px-3 text-right">Nutrisi AB Mix / Lubang</th>
                  <th className="py-2.5 px-3 text-center">Terakhir Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {materialStandards.map((std) => (
                  <tr key={std.productId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {std.productName}
                      <span className="block font-mono text-[10px] text-slate-400">{std.productId}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      <strong>{(std.estimatedYieldPerHoleKg * 1000).toFixed(0)}</strong> gram
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      ~<strong>{Math.round(1 / std.estimatedYieldPerHoleKg)}</strong> lubang/kg
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      <strong>{std.seedUsagePerHole}</strong> {std.seedUnit}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      <strong>{std.rockwoolUsagePerHole}</strong> {std.rockwoolUnit}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      <strong>{std.nutrientUsagePerHole}</strong> {std.nutrientUnit}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-500">
                      <div>{std.updatedAt}</div>
                      <div className="text-[9px] text-slate-400">oleh {std.updatedBy}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT PRODUK */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900">
                {editingProduct ? `Edit Data Master: ${editingProduct.name}` : 'Tambah Produk Komoditas Baru'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kode / ID Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={productForm.id}
                    onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kategori Tanaman <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as CropCategory })}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="leafy">Leafy (Sayuran Daun)</option>
                    <option value="herb">Herb (Herba / Rempah)</option>
                    <option value="fruit">Fruit (Buah Hidroponik)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Komersial Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pakcoy Shinta Super"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Ilmiah / Botani
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Brassica rapa subsp. chinensis"
                  value={productForm.scientificName}
                  onChange={(e) => setProductForm({ ...productForm, scientificName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Harga Jual / kg (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={productForm.pricePerKg}
                    onChange={(e) => setProductForm({ ...productForm, pricePerKg: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono tabular-nums text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Siklus Semai-Panen (Hari)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={productForm.growingDays}
                    onChange={(e) => setProductForm({ ...productForm, growingDays: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono tabular-nums text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Shelf Life (Hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={productForm.shelfLifeDays}
                    onChange={(e) => setProductForm({ ...productForm, shelfLifeDays: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono tabular-nums text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* BOM Section */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Struktur BOM per 1 Kg Panen
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Benih (butir)</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.seedCount}
                      onChange={(e) => setProductForm({ ...productForm, seedCount: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">AB Mix (L pekat)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={productForm.abMixLiters}
                      onChange={(e) => setProductForm({ ...productForm, abMixLiters: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Rockwool (slab)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={productForm.rockwoolSlabs}
                      onChange={(e) => setProductForm({ ...productForm, rockwoolSlabs: Number(e.target.value) })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Simpan Master Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT MITRA */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900">
                {editingMember ? `Edit Mitra: ${editingMember.name}` : 'Tambah Mitra Petani Baru'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-4 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ID Mitra <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMember}
                    value={memberForm.id}
                    onChange={(e) => setMemberForm({ ...memberForm, id: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / Telp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Lengkap Petani <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Joko Susilo"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Kebun Greenhouse <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kebun Hijau Berkah Lembang"
                    value={memberForm.gardenName}
                    onChange={(e) => setMemberForm({ ...memberForm, gardenName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Lokasi / Alamat Kebun Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Jl. Maribaya No. 42, Lembang, Kab. Bandung Barat"
                  value={memberForm.location}
                  onChange={(e) => setMemberForm({ ...memberForm, location: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kapasitas Total Lubang Tanam <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={memberForm.totalHoles}
                    onChange={(e) => setMemberForm({ ...memberForm, totalHoles: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono tabular-nums text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Rasio Bagi Hasil Mitra (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={memberForm.revenueSharePercent}
                    onChange={(e) => setMemberForm({ ...memberForm, revenueSharePercent: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono tabular-nums text-xs focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* Bank Account */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Rekening Bank Pencairan Bagi Hasil
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Nama Bank</label>
                    <input
                      type="text"
                      placeholder="BCA / Mandiri / BRI"
                      value={memberForm.bankName}
                      onChange={(e) => setMemberForm({ ...memberForm, bankName: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Nomor Rekening</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={memberForm.accountNumber}
                      onChange={(e) => setMemberForm({ ...memberForm, accountNumber: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">Atas Nama</label>
                    <input
                      type="text"
                      placeholder="Nama Pemilik"
                      value={memberForm.holderName}
                      onChange={(e) => setMemberForm({ ...memberForm, holderName: e.target.value })}
                      className="w-full p-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Simpan Data Mitra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT BAHAN BAKU */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900">
                {editingMaterial ? `Edit Bahan: ${editingMaterial.name}` : 'Tambah Bahan Baku Baru'}
              </h3>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kode SKU <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingMaterial}
                  value={materialForm.id}
                  onChange={(e) => setMaterialForm({ ...materialForm, id: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-xs disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Bahan Baku <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Benih Pakcoy Shinta"
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tipe Kategori
                  </label>
                  <select
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="seed">Seed (Benih)</option>
                    <option value="nutrient">Nutrient (AB Mix)</option>
                    <option value="rockwool">Rockwool (Media)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Satuan Ukur
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="butir / liter / slab"
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.stock}
                    onChange={(e) => setMaterialForm({ ...materialForm, stock: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Batas Alert Min (ROP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.minStockAlert}
                    onChange={(e) => setMaterialForm({ ...materialForm, minStockAlert: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK PROMPT */}
      {quickRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xs w-full p-4">
            <h4 className="text-xs font-bold text-slate-900 mb-1">Restok Bahan Baku</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Tambahkan stok masuk untuk <strong>{quickRestockItem.name}</strong>.
            </p>
            <form onSubmit={handleQuickRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-600 mb-1">
                  Jumlah Tambahan ({quickRestockItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-xs text-right tabular-nums focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRestockItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  Konfirmasi Restok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
