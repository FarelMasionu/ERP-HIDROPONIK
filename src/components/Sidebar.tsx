'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sprout,
  LayoutDashboard,
  Truck,
  TrendingUp,
  Layers,
  ClipboardCheck,
  Users,
  BarChart3,
  Building2,
  Calendar,
  Send,
  CreditCard,
  ShoppingBag,
  Package,
  X,
  Droplets,
  RotateCcw,
  Boxes,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  const {
    role,
    members,
    selectedMemberId,
    orders,
    inventoryLots,
    materialPlans,
    resetAllData
  } = useApp();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'menunggu_pembayaran' || o.status === 'diproses'
  ).length;

  const expiringLotsCount = inventoryLots.filter(
    (l) => l.status === 'Expiring' || l.status === 'Good'
  ).length;

  const pendingMaterialCount = materialPlans.filter(
    (p) => p.plantingReadiness === 'menunggu_konfirmasi'
  ).length;

  const myMemberPendingMaterialCount = materialPlans.filter(
    (p) => p.memberId === selectedMemberId && p.plantingReadiness === 'menunggu_konfirmasi'
  ).length;

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const handleNavClick = (tabKey: string) => {
    setActiveTab(tabKey);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-2 border-emerald-600/30 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
              <Sprout className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                Al-Baroqah
              </div>
              <div className="text-[11px] text-emerald-700 font-bold tracking-wide mt-0.5">
                ERP AL-BAROQAH HIDROPONIK
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Indicator */}
        <div className="px-4 py-2.5 bg-emerald-50/50 border-b border-emerald-200/60">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
            Peran Aktif
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 truncate">
              {role === 'admin' && 'Admin Operasional'}
              {role === 'owner' && 'Owner / Pemilik'}
              {role === 'member' && `Petani: ${selectedMember.name.split(' ')[0]}`}
              {role === 'consumer' && 'Konsumen (Belanja)'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold border border-emerald-300 bg-white text-emerald-800 uppercase">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Links with border on each module */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {/* ADMIN NAVIGATION */}
          {role === 'admin' && (
            <>
              <div className="px-1 pt-1 pb-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Operasional Terpadu
              </div>

              {/* Modul: Dashboard Utama */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'dashboard'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className={`w-4.5 h-4.5 ${activeTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Dashboard Utama</span>
              </button>

              {/* Modul: Distribusi & Pesanan */}
              <button
                onClick={() => handleNavClick('sales_distribusi')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'sales_distribusi'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className={`w-4.5 h-4.5 ${activeTab === 'sales_distribusi' ? 'text-emerald-700' : 'text-slate-600'}`} />
                  <span>Distribusi & Pesanan</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              {/* Modul: Forecasting WMA */}
              <button
                onClick={() => handleNavClick('forecasting')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'forecasting'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <TrendingUp className={`w-4.5 h-4.5 ${activeTab === 'forecasting' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Forecasting WMA</span>
              </button>

              {/* Modul: Batch Produksi & Kuota */}
              <button
                onClick={() => handleNavClick('batch_produksi')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'batch_produksi'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <Layers className={`w-4.5 h-4.5 ${activeTab === 'batch_produksi' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Batch Produksi & Kuota</span>
              </button>

              {/* Modul: Kebutuhan Bahan (MRP) */}
              <button
                onClick={() => handleNavClick('perencanaan_bahan')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'perencanaan_bahan'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className={`w-4.5 h-4.5 ${activeTab === 'perencanaan_bahan' ? 'text-emerald-700' : 'text-slate-600'}`} />
                  <span>Kebutuhan Bahan (MRP)</span>
                </div>
                {pendingMaterialCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {pendingMaterialCount}
                  </span>
                )}
              </button>

              {/* Modul: QC Panen & Stok Kebun */}
              <button
                onClick={() => handleNavClick('panen_qc')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'panen_qc'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardCheck className={`w-4.5 h-4.5 ${activeTab === 'panen_qc' ? 'text-emerald-700' : 'text-slate-600'}`} />
                  <span>QC Panen & Stok Kebun</span>
                </div>
                {expiringLotsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-rose-100 text-rose-900 border border-rose-300">
                    {expiringLotsCount}
                  </span>
                )}
              </button>

              {/* Modul: Mitra & Bagi Hasil */}
              <button
                onClick={() => handleNavClick('mitra_bagihasil')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'mitra_bagihasil'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <Users className={`w-4.5 h-4.5 ${activeTab === 'mitra_bagihasil' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Mitra & Bagi Hasil</span>
              </button>

              {/* Modul: Evaluasi Rantai Pasok */}
              <button
                onClick={() => handleNavClick('laporan_scm')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'laporan_scm'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <BarChart3 className={`w-4.5 h-4.5 ${activeTab === 'laporan_scm' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Evaluasi Rantai Pasok</span>
              </button>

              {/* Modul: Data Master Terpadu */}
              <div className="px-1 pt-2 pb-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Direktori Master
              </div>
              <button
                onClick={() => handleNavClick('data_master')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'data_master'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <Database className={`w-4.5 h-4.5 ${activeTab === 'data_master' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Data Master Terpadu</span>
              </button>
            </>
          )}

          {/* OWNER NAVIGATION */}
          {role === 'owner' && (
            <>
              <div className="px-1 pt-1 pb-1 text-xs font-bold text-amber-800 uppercase tracking-wider">
                Executive Oversight
              </div>

              {/* Modul: Eksekutif Overview */}
              <button
                onClick={() => handleNavClick('owner_dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'owner_dashboard'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold border-l-4 border-l-amber-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-amber-50/40 hover:border-amber-300 hover:text-slate-900'
                }`}
              >
                <Building2 className={`w-4.5 h-4.5 ${activeTab === 'owner_dashboard' ? 'text-amber-700' : 'text-slate-600'}`} />
                <span>Eksekutif Overview</span>
              </button>

              {/* Modul: Evaluasi Serapan & Susut */}
              <button
                onClick={() => handleNavClick('laporan_scm')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'laporan_scm'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold border-l-4 border-l-amber-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-amber-50/40 hover:border-amber-300 hover:text-slate-900'
                }`}
              >
                <BarChart3 className={`w-4.5 h-4.5 ${activeTab === 'laporan_scm' ? 'text-amber-700' : 'text-slate-600'}`} />
                <span>Evaluasi Serapan & Susut</span>
              </button>

              {/* Modul: Kebutuhan Bahan (MRP) */}
              <button
                onClick={() => handleNavClick('perencanaan_bahan')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'perencanaan_bahan'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold border-l-4 border-l-amber-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-amber-50/40 hover:border-amber-300 hover:text-slate-900'
                }`}
              >
                <Boxes className={`w-4.5 h-4.5 ${activeTab === 'perencanaan_bahan' ? 'text-amber-700' : 'text-slate-600'}`} />
                <span>Kebutuhan Bahan (MRP)</span>
              </button>

              {/* Modul: Audit Bagi Hasil Mitra */}
              <button
                onClick={() => handleNavClick('mitra_bagihasil')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'mitra_bagihasil'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold border-l-4 border-l-amber-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-amber-50/40 hover:border-amber-300 hover:text-slate-900'
                }`}
              >
                <Users className={`w-4.5 h-4.5 ${activeTab === 'mitra_bagihasil' ? 'text-amber-700' : 'text-slate-600'}`} />
                <span>Audit Bagi Hasil Mitra</span>
              </button>

              {/* Modul: Forecasting Permintaan */}
              <button
                onClick={() => handleNavClick('forecasting')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'forecasting'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold border-l-4 border-l-amber-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-amber-50/40 hover:border-amber-300 hover:text-slate-900'
                }`}
              >
                <TrendingUp className={`w-4.5 h-4.5 ${activeTab === 'forecasting' ? 'text-amber-700' : 'text-slate-600'}`} />
                <span>Forecasting Permintaan</span>
              </button>

              {/* Modul: Data Master Terpadu */}
              <div className="px-1 pt-2 pb-0.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                Direktori Master
              </div>
              <button
                onClick={() => handleNavClick('data_master')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'data_master'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold border-l-4 border-l-amber-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-amber-50/40 hover:border-amber-300 hover:text-slate-900'
                }`}
              >
                <Database className={`w-4.5 h-4.5 ${activeTab === 'data_master' ? 'text-amber-700' : 'text-slate-600'}`} />
                <span>Data Master Terpadu</span>
              </button>
            </>
          )}

          {/* MEMBER (FARMER) NAVIGATION */}
          {role === 'member' && (
            <>
              <div className="px-1 pt-1 pb-1 text-xs font-bold text-sky-800 uppercase tracking-wider">
                Portal Petani Mitra
              </div>

              {/* Modul: Tugas Tanam & SOP */}
              <button
                onClick={() => handleNavClick('tugas_saya')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'tugas_saya'
                    ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold border-l-4 border-l-sky-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-sky-50/40 hover:border-sky-300 hover:text-slate-900'
                }`}
              >
                <Calendar className={`w-4.5 h-4.5 ${activeTab === 'tugas_saya' ? 'text-sky-700' : 'text-slate-600'}`} />
                <span>Tugas Tanam & SOP</span>
              </button>

              {/* Modul: Kesiapan Bahan Tanam */}
              <button
                onClick={() => handleNavClick('kesiapan_bahan')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'kesiapan_bahan'
                    ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold border-l-4 border-l-sky-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-sky-50/40 hover:border-sky-300 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className={`w-4.5 h-4.5 ${activeTab === 'kesiapan_bahan' ? 'text-sky-700' : 'text-slate-600'}`} />
                  <span>Kesiapan Bahan Tanam</span>
                </div>
                {myMemberPendingMaterialCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {myMemberPendingMaterialCount}
                  </span>
                )}
              </button>

              {/* Modul: Instruksi Jemput Kurir */}
              <button
                onClick={() => handleNavClick('instruksi_jemput')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'instruksi_jemput'
                    ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold border-l-4 border-l-sky-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-sky-50/40 hover:border-sky-300 hover:text-slate-900'
                }`}
              >
                <Truck className={`w-4.5 h-4.5 ${activeTab === 'instruksi_jemput' ? 'text-sky-700' : 'text-slate-600'}`} />
                <span>Instruksi Jemput Kurir</span>
              </button>

              {/* Modul: Lapor Panen Mandiri */}
              <button
                onClick={() => handleNavClick('lapor_panen')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'lapor_panen'
                    ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold border-l-4 border-l-sky-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-sky-50/40 hover:border-sky-300 hover:text-slate-900'
                }`}
              >
                <Send className={`w-4.5 h-4.5 ${activeTab === 'lapor_panen' ? 'text-sky-700' : 'text-slate-600'}`} />
                <span>Lapor Panen Mandiri</span>
              </button>

              {/* Modul: Buku Tabungan & Hak */}
              <button
                onClick={() => handleNavClick('saldo_bagihasil')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'saldo_bagihasil'
                    ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold border-l-4 border-l-sky-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-sky-50/40 hover:border-sky-300 hover:text-slate-900'
                }`}
              >
                <CreditCard className={`w-4.5 h-4.5 ${activeTab === 'saldo_bagihasil' ? 'text-sky-700' : 'text-slate-600'}`} />
                <span>Buku Tabungan & Hak</span>
              </button>
            </>
          )}

          {/* CONSUMER NAVIGATION */}
          {role === 'consumer' && (
            <>
              <div className="px-1 pt-1 pb-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Belanja Sayuran Segar
              </div>

              {/* Modul: Katalog Sayur Segar */}
              <button
                onClick={() => handleNavClick('katalog')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'katalog'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className={`w-4.5 h-4.5 ${activeTab === 'katalog' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Katalog Sayur Segar</span>
              </button>

              {/* Modul: Pesanan & Pelacakan */}
              <button
                onClick={() => handleNavClick('pesanan_saya')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-semibold transition-all border shadow-2xs ${
                  activeTab === 'pesanan_saya'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold border-l-4 border-l-emerald-600'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300 hover:text-slate-900'
                }`}
              >
                <Package className={`w-4.5 h-4.5 ${activeTab === 'pesanan_saya' ? 'text-emerald-700' : 'text-slate-600'}`} />
                <span>Pesanan & Pelacakan</span>
              </button>
            </>
          )}
        </nav>

        {/* Footer info & Reset Demo */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="text-[11px] text-slate-500">
            Desentralisasi Rantai Pasok Segar
          </div>
          <button
            onClick={() => {
              if (confirm('Kembalikan seluruh data ke awal demo Al-Baroqah?')) {
                resetAllData();
              }
            }}
            className="w-full py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
