'use client';

'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  Menu,
  ShoppingCart,
  ChevronDown,
  UserCheck,
  Building2,
  Users,
  ShoppingBag,
  Sparkles,
  Calendar
} from 'lucide-react';

interface TopHeaderProps {
  activeTab: string;
  onOpenSidebar: () => void;
  openCart: () => void;
  onNavigateTab: (tab: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenSidebar,
  openCart,
  onNavigateTab
}) => {
  const {
    role,
    setRole,
    members,
    selectedMemberId,
    setSelectedMemberId,
    cart,
    triggerQuickSimulationFlow
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantityKg, 0);
  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Operasional Terpadu';
      case 'sales_distribusi':
        return 'Manajemen Distribusi & Alokasi Pesanan';
      case 'forecasting':
        return 'Peramalan WMA 3 & Rencana Tanam';
      case 'batch_produksi':
        return 'Batch Produksi & Pengurangan BOM';
      case 'perencanaan_bahan':
        return 'Perencanaan Kebutuhan Bahan Baku (MRP)';
      case 'kesiapan_bahan':
        return 'Pengecekan Kesiapan Bahan Baku Kebun Sendiri';
      case 'panen_qc':
        return 'QC Panen & Inventaris Kebun Mitra';
      case 'mitra_bagihasil':
        return 'Kemitraan & Transparansi Bagi Hasil';
      case 'laporan_scm':
        return 'Evaluasi Serapan Pasar & Susut (Waste)';
      case 'data_master':
        return 'Manajemen Direktori Data Master';
      case 'owner_dashboard':
        return 'Executive Oversight (Owner / Pemilik)';
      case 'tugas_saya':
        return 'Tugas Tanam & Panduan SOP Nutrisi';
      case 'instruksi_jemput':
        return 'Instruksi Penjemputan Kurir';
      case 'lapor_panen':
        return 'Lapor Panen Mandiri Petani';
      case 'saldo_bagihasil':
        return 'Buku Tabungan & Hak Bagi Hasil';
      case 'katalog':
        return 'Katalog Sayur Segar (Ready Stock & Pre-Order)';
      case 'pesanan_saya':
        return 'Pesanan & Pelacakan Pengiriman';
      default:
        return 'Sistem ERP Terpadu';
    }
  };

  const handleRoleSelect = (newRole: Role) => {
    setRole(newRole);
    setShowRoleMenu(false);
    if (newRole === 'consumer') {
      onNavigateTab('katalog');
    } else if (newRole === 'member') {
      onNavigateTab('tugas_saya');
    } else if (newRole === 'owner') {
      onNavigateTab('owner_dashboard');
    } else {
      onNavigateTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b-2 border-emerald-600/40 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors border border-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-emerald-800 hidden sm:inline">
            Al-Baroqah ERP
          </span>
          <span className="text-slate-400 hidden sm:inline">/</span>
          <span className="font-bold text-slate-900 truncate max-w-[220px] sm:max-w-none text-sm">
            {getBreadcrumbTitle(activeTab)}
          </span>
        </div>
      </div>

      {/* Right: Date, Quick Simulation, Cart, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50/70 rounded-md text-xs font-mono tabular-nums text-emerald-950 border border-emerald-300 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-bold">17 Okt 2026</span>
        </div>

        {/* Quick Simulation Button for Admin */}
        {role === 'admin' && (
          <button
            onClick={() => {
              triggerQuickSimulationFlow();
              onNavigateTab('sales_distribusi');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-300 rounded-md text-xs font-bold transition-colors shadow-2xs"
            title="Simulasikan pesanan masuk dan uji alokasi otomatis"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-700" />
            <span>Simulasi Order</span>
          </button>
        )}

        {/* Consumer Cart Trigger */}
        {role === 'consumer' && (
          <button
            onClick={openCart}
            className="relative p-2 text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-300 transition-colors shadow-2xs"
            title="Buka Keranjang Belanja"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-xs font-mono font-bold w-4 h-4 rounded flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        )}

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-bold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs border border-slate-800"
          >
            {role === 'admin' && <UserCheck className="w-4 h-4 text-emerald-400" />}
            {role === 'owner' && <Building2 className="w-4 h-4 text-amber-300" />}
            {role === 'member' && <Users className="w-4 h-4 text-sky-300" />}
            {role === 'consumer' && <ShoppingBag className="w-4 h-4 text-emerald-300" />}

            <span className="hidden sm:inline">
              {role === 'admin' && 'Admin Operasional'}
              {role === 'owner' && 'Owner / Pemilik'}
              {role === 'member' && `Petani: ${selectedMember.name.split(' ')[0]}`}
              {role === 'consumer' && 'Konsumen'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-68 bg-white rounded-md shadow-xl border-2 border-emerald-200 py-1 z-50 text-sm">
              <div className="px-3.5 py-1.5 font-bold text-slate-600 uppercase tracking-wider text-xs border-b border-slate-200">
                Ganti Peran Pengguna
              </div>

              <button
                onClick={() => handleRoleSelect('admin')}
                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-emerald-50/60 transition-colors ${
                  role === 'admin' ? 'bg-emerald-50 text-emerald-950 font-bold border-l-4 border-emerald-600' : 'text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-slate-900">Admin Operasional</div>
                  <div className="text-xs text-slate-600 font-medium">Kontrol penuh operasional & alokasi kebun</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('owner')}
                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-amber-50/60 transition-colors ${
                  role === 'owner' ? 'bg-amber-50 text-amber-950 font-bold border-l-4 border-amber-600' : 'text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-700" />
                <div>
                  <div className="font-bold text-slate-900">Owner / Pemilik</div>
                  <div className="text-xs text-slate-600 font-medium">Audit bagi hasil, serapan & finansial</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('member')}
                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-sky-50/60 transition-colors ${
                  role === 'member' ? 'bg-sky-50 text-sky-950 font-bold border-l-4 border-sky-600' : 'text-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-sky-700" />
                <div>
                  <div className="font-bold text-slate-900">Anggota Binaan (Petani Mitra)</div>
                  <div className="text-xs text-slate-600 font-medium">Portal Tugas Saya & penjemputan sayur</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('consumer')}
                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-emerald-50/60 transition-colors ${
                  role === 'consumer' ? 'bg-emerald-50 text-emerald-950 font-bold border-l-4 border-emerald-600' : 'text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-slate-900">Konsumen (Retail & Katering)</div>
                  <div className="text-xs text-slate-600 font-medium">Beli Ready Stock atau Kunci Pre-Order</div>
                </div>
              </button>

              {role === 'member' && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200 px-3.5 pb-1.5">
                  <div className="text-xs font-bold text-slate-800 mb-1">Pilih Akun Petani Mitra:</div>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full text-xs p-1.5 border border-sky-300 rounded-md bg-white font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.gardenName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
