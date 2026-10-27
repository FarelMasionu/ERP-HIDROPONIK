'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/scmAlgorithms';
import {
  TrendingUp,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PieChart,
  Calendar
} from 'lucide-react';

import { CircularProgress } from '../common/CircularProgress';

interface OwnerDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigateTab }) => {
  const { orders, revenueRecords, members, inventoryLots, batches } = useApp();

  const totalGrossRevenue = orders
    .filter((o) => o.status === 'selesai' || o.status === 'dikirim' || o.status === 'dialokasikan')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalMemberPayout = revenueRecords.reduce((acc, r) => acc + r.shareAmount, 0);
  const cooperativeGrossMargin = totalGrossRevenue - totalMemberPayout;

  const totalPanenKg = inventoryLots.reduce((acc, l) => acc + l.initialQtyKg, 0);
  const totalTerjualKg = inventoryLots.reduce((acc, l) => acc + l.soldQtyKg, 0);
  const serapanPasarNum = totalPanenKg > 0 ? Math.round((totalTerjualKg / totalPanenKg) * 100) : 0;
  const serapanPasarPct = totalPanenKg > 0 ? ((totalTerjualKg / totalPanenKg) * 100).toFixed(1) : '0';

  const totalHoles = members.reduce((acc, m) => acc + m.totalHoles, 0);
  const activeHoles = members.reduce((acc, m) => acc + m.activeLoadHoles, 0);
  const utilizationPct = totalHoles > 0 ? Math.round((activeHoles / totalHoles) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-300">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Executive Oversight Dashboard (Owner / Pemilik)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Pemantauan kinerja finansial, utilisasi aset kebun mitra, audit bagi hasil tani, dan transparansi serapan pasar.
          </p>
        </div>
        <div className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded font-bold self-start sm:self-auto font-mono shadow-2xs">
          Mode Eksekutif (Read-Only Audit)
        </div>
      </div>

      {/* 4 Executive Metric Cards with Circular Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Omzet */}
        <div className="bg-white border-2 border-emerald-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              Omzet Penjualan
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {formatRupiah(totalGrossRevenue)}
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1">
              Penjualan sayur riil
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border-2 border-emerald-200 text-emerald-800 flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        {/* Metric 2: Gross Margin Koperasi */}
        <div className="bg-white border-2 border-sky-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-sky-950 uppercase tracking-wider block">
              Margin Koperasi (40%)
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {formatRupiah(cooperativeGrossMargin)}
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1">
              Logistik, QC & Operasional
            </span>
          </div>
          <CircularProgress
            value={40}
            size={64}
            strokeWidth={5}
            color="#0284c7"
            trackColor="#E2E8F0"
          />
        </div>

        {/* Metric 3: Total Hak Mitra (60%) */}
        <div className="bg-white border-2 border-amber-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
              Hak Mitra (60%)
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {formatRupiah(totalMemberPayout)}
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1">
              Tersalurkan ke {members.length} petani
            </span>
          </div>
          <CircularProgress
            value={60}
            size={64}
            strokeWidth={5}
            color="#d97706"
            trackColor="#E2E8F0"
          />
        </div>

        {/* Metric 4: Utilisasi Kapasitas Kebun */}
        <div className="bg-white border-2 border-indigo-300 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">
              Utilisasi Kebun
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {utilizationPct}%
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-1 font-mono tabular-nums">
              {activeHoles.toLocaleString('id-ID')} / {totalHoles.toLocaleString('id-ID')} lb
            </span>
          </div>
          <CircularProgress
            value={utilizationPct}
            size={64}
            strokeWidth={5}
            color="#4f46e5"
            trackColor="#E2E8F0"
          />
        </div>
      </div>

      {/* Audit Serapan & Utilisasi Kebun Mitra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Benchmarking Kinerja Petani Mitra */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b-2 border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Audit Utilisasi Kebun Mitra Petani
            </h3>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
              {members.length} Mitra Aktif
            </span>
          </div>

          <div className="space-y-2.5">
            {members.map((m) => {
              const myLots = inventoryLots.filter((l) => l.memberId === m.id);
              const panen = myLots.reduce((acc, l) => acc + l.initialQtyKg, 0);
              const terjual = myLots.reduce((acc, l) => acc + l.soldQtyKg, 0);
              const serapan = panen > 0 ? Math.round((terjual / panen) * 100) : 0;
              const holesPct = Math.round((m.activeLoadHoles / m.totalHoles) * 100);

              return (
                <div key={m.id} className="p-3 border-2 border-slate-200 rounded-md text-sm space-y-2 bg-slate-50/70 shadow-2xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                      <div className="text-xs text-slate-600 font-medium">{m.gardenName}</div>
                    </div>
                    <div className="text-right font-mono tabular-nums font-bold text-emerald-900 text-xs bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                      Bagi Hasil {m.revenueSharePercent}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 font-mono tabular-nums text-xs">
                    <div>
                      <span className="text-slate-600 font-medium">Beban Lubang: </span>
                      <strong className="text-slate-900 font-bold">{m.activeLoadHoles.toLocaleString('id-ID')}</strong> / {m.totalHoles.toLocaleString('id-ID')} ({holesPct}%)
                    </div>
                    <div className="text-right">
                      <span className="text-slate-600 font-medium">Serapan: </span>
                      <strong className="text-slate-900 font-bold">{serapan}%</strong> ({terjual}/{panen} kg)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Transparansi Alur Finansial */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b-2 border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Audit Transparansi Alur Bagi Hasil Tani
            </h3>
            <span className="text-xs text-slate-600 font-mono font-bold">Prinsip Rantai Pasok Berkelanjutan</span>
          </div>

          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-md text-sm space-y-2.5 leading-relaxed text-slate-700 shadow-2xs">
            <p>
              1. <strong className="text-slate-900 font-bold">Bagi Hasil Terikat Penjualan Riil:</strong> Sistem menjamin petani mitra menerima hak 60% tepat waktu berdasarkan pesanan yang berhasil dikirim dan diselesaikan, bukan semata-mata jumlah panen kotor di pohon.
            </p>
            <p>
              2. <strong className="text-slate-900 font-bold">Zero Cold Storage / Tanpa Gudang Terpusat:</strong> Menghilangkan pemborosan biaya listrik pendingin dan penimbunan stok. Pemenuhan pesanan memprioritaskan kurir menjemput ke 1 kebun terbaik (Single-Fulfillment Best-Fit) sebelum memecah ke banyak titik.
            </p>
            <p>
              3. <strong className="text-slate-900 font-bold">Proteksi Kerugian Petani:</strong> Peramalan kebutuhan berbasis WMA 3 Periode + Koreksi Tren Linier berhasil menekan angka susut sayuran hingga ke level aman.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('laporan_scm')}
              className="flex-1 py-2 px-3.5 text-sm font-bold rounded-md bg-emerald-800 text-white hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 shadow-2xs border-2 border-emerald-900"
            >
              <span>Buka Laporan Evaluasi Rantai Pasok</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('mitra_bagihasil')}
              className="flex-1 py-2 px-3.5 text-sm font-bold rounded-md border-2 border-slate-300 text-slate-800 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>Audit Bagi Hasil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
