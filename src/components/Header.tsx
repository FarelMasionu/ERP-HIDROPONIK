import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  Sprout,
  UserCheck,
  Building2,
  Users,
  ShoppingBag,
  ShoppingCart,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openCart }) => {
  const {
    role,
    setRole,
    members,
    selectedMemberId,
    setSelectedMemberId,
    cart,
    orders,
    inventoryLots,
    resetAllData
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Quick count calculations
  const pendingOrdersCount = orders.filter((o) => o.status === 'menunggu_pembayaran' || o.status === 'diproses').length;
  const expiringLotsCount = inventoryLots.filter((l) => l.status === 'Expiring').length;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantityKg, 0);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  const handleRoleSelect = (newRole: Role) => {
    setRole(newRole);
    setShowRoleMenu(false);
    if (newRole === 'consumer') {
      setActiveTab('katalog');
    } else if (newRole === 'member') {
      setActiveTab('tugas_saya');
    } else if (newRole === 'owner') {
      setActiveTab('owner_dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single text element wordmark with icon */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap">
                Al-Baroqah Hidroponik
              </span>
              <div className="text-sm text-stone-600 hidden sm:block font-medium">
                ERP Rantai Pasok Terdesentralisasi
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links based on active role */}
          <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-2 text-sm font-semibold text-stone-700">
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('sales_distribusi')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap relative ${
                    activeTab === 'sales_distribusi' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  Distribusi & Pesanan
                  {pendingOrdersCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-xs bg-amber-100 text-amber-800 rounded font-semibold">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('forecasting')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'forecasting' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  Forecasting & Tanam
                </button>
                <button
                  onClick={() => setActiveTab('batch_produksi')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'batch_produksi' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  Batch Produksi
                </button>
                <button
                  onClick={() => setActiveTab('panen_qc')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap relative ${
                    activeTab === 'panen_qc' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  QC Panen & Stok Kebun
                  {expiringLotsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-xs bg-rose-100 text-rose-800 rounded font-semibold">
                      {expiringLotsCount} Hari 3
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('mitra_bagihasil')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'mitra_bagihasil' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  Mitra & Bagi Hasil
                </button>
                <button
                  onClick={() => setActiveTab('laporan_scm')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'laporan_scm' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300' : 'hover:text-stone-900'
                  }`}
                >
                  Evaluasi Rantai Pasok
                </button>
              </>
            )}

            {role === 'owner' && (
              <>
                <button
                  onClick={() => setActiveTab('owner_dashboard')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'owner_dashboard' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Eksekutif Overview
                </button>
                <button
                  onClick={() => setActiveTab('laporan_scm')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'laporan_scm' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Evaluasi Serapan & Susut
                </button>
                <button
                  onClick={() => setActiveTab('mitra_bagihasil')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'mitra_bagihasil' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Audit Bagi Hasil Mitra
                </button>
                <button
                  onClick={() => setActiveTab('forecasting')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'forecasting' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Forecasting & Rencana Tanam
                </button>
              </>
            )}

            {role === 'member' && (
              <>
                <button
                  onClick={() => setActiveTab('tugas_saya')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'tugas_saya' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Tugas Saya & Tanam
                </button>
                <button
                  onClick={() => setActiveTab('instruksi_jemput')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'instruksi_jemput' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Instruksi Jemput Kurir
                </button>
                <button
                  onClick={() => setActiveTab('lapor_panen')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'lapor_panen' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Lapor Panen Mandiri
                </button>
                <button
                  onClick={() => setActiveTab('saldo_bagihasil')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'saldo_bagihasil' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Bagi Hasil Saya
                </button>
              </>
            )}

            {role === 'consumer' && (
              <>
                <button
                  onClick={() => setActiveTab('katalog')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'katalog' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Katalog Sayur Segar
                </button>
                <button
                  onClick={() => setActiveTab('pesanan_saya')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'pesanan_saya' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  Pesanan Saya
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Role Switcher & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Consumer Cart Trigger */}
            {role === 'consumer' && (
              <button
                onClick={openCart}
                className="relative p-2 text-stone-700 hover:text-emerald-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                title="Buka Keranjang Belanja"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                {role === 'admin' && <UserCheck className="w-4 h-4 text-emerald-400" />}
                {role === 'owner' && <Building2 className="w-4 h-4 text-amber-400" />}
                {role === 'member' && <Users className="w-4 h-4 text-sky-400" />}
                {role === 'consumer' && <ShoppingBag className="w-4 h-4 text-emerald-300" />}
                
                <span className="capitalize">
                  {role === 'admin' && 'Admin Operasional'}
                  {role === 'owner' && 'Owner / Pemilik'}
                  {role === 'member' && `Petani: ${selectedMember.name.split(' ')[0]}`}
                  {role === 'consumer' && 'Konsumen (Belanja)'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 font-semibold text-stone-400 uppercase tracking-wider text-[10px]">
                    Ganti Peran Pengguna
                  </div>
                  
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 ${
                      role === 'admin' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-sm text-stone-900">Admin / Operasional</div>
                      <div className="text-xs text-stone-500 font-medium">Kontrol penuh operasional & alokasi kebun</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('owner')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 ${
                      role === 'owner' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Owner / Pemilik</div>
                      <div className="text-[10px] text-stone-400 font-normal">Executive view, audit bagi hasil & serapan</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('member')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 ${
                      role === 'member' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <Users className="w-4 h-4 text-sky-600" />
                    <div>
                      <div>Anggota Binaan (Petani Mitra)</div>
                      <div className="text-[10px] text-stone-400 font-normal">Portal Tugas Saya & penjemputan sayur</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('consumer')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-stone-50 ${
                      role === 'consumer' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Konsumen (Retail & Katering)</div>
                      <div className="text-[10px] text-stone-400 font-normal">Beli Ready Stock atau Kunci Pre-Order</div>
                    </div>
                  </button>

                  {role === 'member' && (
                    <div className="mt-2 pt-2 border-t border-stone-100 px-3">
                      <div className="text-[10px] font-semibold text-stone-400 mb-1">Pilih Akun Petani Mitra:</div>
                      <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="w-full text-xs p-1.5 border border-stone-200 rounded bg-stone-50"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.gardenName})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-stone-100 px-3 pb-1">
                    <button
                      onClick={() => {
                        resetAllData();
                        setShowRoleMenu(false);
                      }}
                      className="text-[11px] text-stone-500 hover:text-rose-600 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Demo Data ke Awal
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile role indicator bar */}
      <div className="md:hidden border-t border-stone-100 bg-stone-50 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-2 text-stone-700 font-medium">
          <span>Peran:</span>
          <span className="font-semibold text-emerald-700">
            {role === 'admin' && 'Admin Operasional'}
            {role === 'owner' && 'Owner / Pemilik'}
            {role === 'member' && `Petani (${selectedMember.name.split(' ')[0]})`}
            {role === 'consumer' && 'Konsumen'}
          </span>
        </div>
        <div className="text-stone-400">·</div>
        <div className="text-[11px] text-stone-500">
          Desentralisasi Tanpa Gudang
        </div>
      </div>
    </header>
  );
};
