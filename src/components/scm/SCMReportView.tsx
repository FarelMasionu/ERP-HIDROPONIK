'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  generateSCMReportCsv,
  downloadCsvFile
} from '../../utils/scmAlgorithms';
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  BarChart3,
  Percent,
  Layers,
  ArrowRight,
  Download
} from 'lucide-react';

export const SCMReportView: React.FC = () => {
  const { products, inventoryLots, members, orders } = useApp();
  const [selectedCropId, setSelectedCropId] = useState<string>('all');

  // Filter lots
  const filteredLots = inventoryLots.filter((l) => {
    if (selectedCropId === 'all') return true;
    return l.productId === selectedCropId;
  });

  const totalHasilPanenKg = filteredLots.reduce((acc, l) => acc + l.initialQtyKg, 0);
  const totalPenjualanRiilKg = filteredLots.reduce((acc, l) => acc + l.soldQtyKg, 0);
  const totalTerbuangKg = filteredLots.reduce((acc, l) => acc + l.wasteQtyKg, 0);

  // Formulas
  const tingkatSerapanPct = totalHasilPanenKg > 0 ? (totalPenjualanRiilKg / totalHasilPanenKg) * 100 : 0;
  const tingkatSusutPct = totalHasilPanenKg > 0 ? (totalTerbuangKg / totalHasilPanenKg) * 100 : 0;

  // System Automatic Advisory Rules:
  let autoAdvisory = {
    title: 'Keseimbangan Rantai Pasok Stabil',
    type: 'optimal',
    text: 'Tingkat serapan pasar berada dalam rentang sehat (75%–94%). Kapasitas kebun terutilisasi optimal dengan susut minimal.'
  };

  if (tingkatSerapanPct < 75 && totalHasilPanenKg > 0) {
    autoAdvisory = {
      title: 'Peringatan Overproduction & Risiko Susut Tinggi',
      type: 'warning',
      text: `Tingkat serapan pasar saat ini hanya ${tingkatSerapanPct.toFixed(1)}% (< 75%). Sistem merekomendasikan: Turunkan target tanam varietas ini untuk batch berikutnya sebesar 10%–15% guna menekan sayuran layu dan meminimalkan kerugian susut petani binaan.`
    };
  } else if (tingkatSerapanPct >= 95 && totalHasilPanenKg > 0) {
    autoAdvisory = {
      title: 'Rekomendasi Ekspansi Target Tanam (Underproduction Terdeteksi)',
      type: 'opportunity',
      text: `Tingkat serapan pasar mencapai ${tingkatSerapanPct.toFixed(1)}% (mendekati 100%) dan stok habis lebih cepat. Sistem merekomendasikan: Naikkan target tanam batch berikutnya sebesar 15%–20% dengan mengaktifkan kapasitas lubang tanam mitra yang masih menganggur.`
    };
  }

  const handleExportCsv = () => {
    const csvData = generateSCMReportCsv(filteredLots);
    downloadCsvFile(csvData, `laporan_evaluasi_serapan_susut_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-emerald-600/30">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Evaluasi & Laporan Rantai Pasok Terpadu
          </h1>
          <p className="text-sm text-slate-700 font-medium mt-0.5">
            Analisis serapan pasar, tingkat susut (waste) sayur segar, dan saran otomatis penyesuaian kapasitas tanam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-md border-2 border-emerald-400 text-emerald-950 bg-emerald-50 hover:bg-emerald-100 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            title="Download CSV Laporan Rantai Pasok"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>Ekspor CSV</span>
          </button>

          {/* Variety Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Filter Varietas:</span>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="text-sm py-2 px-3 border-2 border-slate-300 rounded-md bg-white font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="all">Semua Varietas Komoditas</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Core Formulas & Results Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Serapan Pasar Formula Card */}
        <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Tingkat Serapan Pasar (%)
            </span>
            <Percent className="w-5 h-5 text-emerald-700" />
          </div>

          <div className="text-3xl font-bold font-mono tabular-nums text-emerald-900">
            {tingkatSerapanPct.toFixed(1)}%
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-md text-xs space-y-1 font-mono tabular-nums text-slate-800">
            <div>
              Formula: <code className="font-bold text-emerald-950">(Total Penjualan Riil / Total Hasil Panen) × 100%</code>
            </div>
            <div>
              Hitungan: ({totalPenjualanRiilKg} kg / {totalHasilPanenKg} kg) × 100%
            </div>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Mengukur seberapa banyak produk dari kebun mitra yang benar-benar terserap oleh pesanan konsumen.
          </p>
        </div>

        {/* Susut Waste Formula Card */}
        <div className="bg-white border-2 border-amber-300 rounded-lg p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Tingkat Susut / Waste (%)
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>

          <div className="text-3xl font-bold font-mono tabular-nums text-rose-700">
            {tingkatSusutPct.toFixed(1)}%
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-md text-xs space-y-1 font-mono tabular-nums text-slate-800">
            <div>
              Formula: <code className="font-bold text-rose-950">(Total Terbuang / Total Hasil Panen) × 100%</code>
            </div>
            <div>
              Hitungan: ({totalTerbuangKg} kg / {totalHasilPanenKg} kg) × 100%
            </div>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Sayuran layu melewati batas 3 hari atau rusak. Tidak diperhitungkan dalam bagi hasil mitra.
          </p>
        </div>
      </div>

      {/* Saran Otomatis Sistem Box */}
      <div
        className={`p-4 rounded-lg border-2 shadow-2xs flex items-start gap-3.5 text-sm ${
          autoAdvisory.type === 'warning'
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : autoAdvisory.type === 'opportunity'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-sky-50 border-sky-300 text-sky-950'
        }`}
      >
        <Lightbulb
          className={`w-5 h-5 shrink-0 mt-0.5 ${
            autoAdvisory.type === 'warning'
              ? 'text-rose-700'
              : autoAdvisory.type === 'opportunity'
              ? 'text-emerald-700'
              : 'text-sky-700'
          }`}
        />
        <div className="space-y-0.5">
          <div className="font-bold text-base">{autoAdvisory.title}</div>
          <p className="leading-relaxed font-medium">{autoAdvisory.text}</p>
        </div>
      </div>

      {/* Breakdown per Varietas Komoditas */}
      <div className="bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b-2 border-emerald-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Perbandingan Kinerja Rantai Pasok per Varietas Sayuran
          </h3>
          <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
            Rantai Pasok Terdesentralisasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 px-4">Nama Varietas</th>
                <th className="py-3 px-4 text-right">Hasil Panen (kg)</th>
                <th className="py-3 px-4 text-right">Penjualan Riil (kg)</th>
                <th className="py-3 px-4 text-right">Susut (kg)</th>
                <th className="py-3 px-4 text-center">Tingkat Serapan (%)</th>
                <th className="py-3 px-4 text-center">Tingkat Susut (%)</th>
                <th className="py-3 px-4">Rekomendasi Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal text-slate-900">
              {products.map((prod) => {
                const lots = inventoryLots.filter((l) => l.productId === prod.id);
                const panen = lots.reduce((acc, l) => acc + l.initialQtyKg, 0);
                const terjual = lots.reduce((acc, l) => acc + l.soldQtyKg, 0);
                const susut = lots.reduce((acc, l) => acc + l.wasteQtyKg, 0);

                const serapan = panen > 0 ? (terjual / panen) * 100 : 0;
                const susutRate = panen > 0 ? (susut / panen) * 100 : 0;

                let recommendation = 'Pertahankan target siklus berjalan';
                if (serapan < 75 && panen > 0) {
                  recommendation = 'Evaluasi penurunan target tanam';
                } else if (serapan >= 90 && panen > 0) {
                  recommendation = 'Naikkan target tanam +15%';
                }

                return (
                  <tr key={prod.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-xs text-slate-500 italic">{prod.scientificName}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {panen} kg
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 font-bold">
                      {terjual} kg
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-700 font-bold">
                      {susut} kg
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-emerald-800">
                      {serapan.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-center font-mono tabular-nums text-rose-700 font-bold">
                      {susutRate.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                        {recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
