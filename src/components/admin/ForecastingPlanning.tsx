'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  AlertTriangle,
  FileEdit,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface ForecastingPlanningProps {
  onNavigateTab?: (tab: string) => void;
}

export const ForecastingPlanning: React.FC<ForecastingPlanningProps> = ({ onNavigateTab }) => {
  const { products, forecastPlans, overrideForecastTarget } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>('prod-pakcoy');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideValue, setOverrideValue] = useState<number>(0);
  const [overrideNote, setOverrideNote] = useState('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const currentPlan = forecastPlans[selectedProductId];
  const currentProduct = products.find((p) => p.id === selectedProductId);

  const handleOpenOverride = () => {
    if (!currentPlan) return;
    setOverrideValue(currentPlan.finalTargetKg);
    setOverrideNote(currentPlan.justificationNote || '');
    setOverrideError(null);
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideNote.trim()) {
      setOverrideError('Wajib mencantumkan catatan alasan tertulis (justification note) saat mengubah rekomendasi sistem.');
      return;
    }

    overrideForecastTarget(selectedProductId, overrideValue, overrideNote);
    setIsOverrideModalOpen(false);
    setOverrideError(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Peramalan Permintaan (Forecasting WMA) & Perencanaan Tanam
          </h1>
          <p className="text-xs text-slate-500">
            Algoritma WMA 3 Periode (Bobot 3, 2, 1) + Koreksi Tren Linier & deteksi Censored Demand untuk siklus tanam berikutnya.
          </p>
        </div>

        {/* Product Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Pilih Varietas:</span>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentPlan && (
        <div className="space-y-4">
          
          {/* Censored Demand Warning Banner if detected */}
          {currentPlan.censoredDemandWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-md flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Peringatan Sensor Permintaan (Censored Demand Detected):</span>
                <p className="mt-0.5 leading-relaxed text-[11px] text-amber-800">
                  Pada periode histori sebelumnya, terjadi <em>stockout</em> (stok habis di kebun mitra sebelum akhir periode). 
                  Permintaan pasar riil diperkirakan lebih tinggi dari angka penjualan tercatat. Sistem memberikan bobot koreksi positif untuk mencegah kehilangan potensi penjualan di masa tanam berikutnya.
                </p>
              </div>
            </div>
          )}

          {/* 3 Steps Calculation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* Step 1: WMA + Trend */}
            <div className="bg-white border-2 border-sky-300 rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                Langkah 1: Forecast Ready Stock
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                {currentPlan.wmaForecastReadyKg} kg
              </div>
              <div className="text-xs text-slate-700 space-y-1 font-mono font-medium">
                <div>WMA = (3×P3 + 2×P2 + 1×P1) / 6</div>
                <div className="text-slate-600 font-sans">Ditambah smoothing tren linier antar-periode.</div>
              </div>
            </div>

            {/* Step 2: Pre-Order Terkunci */}
            <div className="bg-white border-2 border-amber-300 rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Langkah 2: Pre-Order Aktif
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-amber-900">
                + {currentPlan.activePreorderKg} kg
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Pesanan pre-order batch yang sudah dipesan & dikunci oleh konsumen/katering.
              </div>
            </div>

            {/* Step 3: Rekomendasi Target Tanam */}
            <div className="bg-emerald-50/40 border-2 border-emerald-400 rounded-lg p-4 space-y-2 shadow-2xs">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Langkah 3: Target Tanam Rekomendasi
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-emerald-900">
                {currentPlan.calculatedRecommendationKg} kg
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Formula: <code className="font-mono font-bold text-emerald-950">⌈(Forecast + PreOrder) / 5⌉ × 5</code>
              </div>
            </div>

          </div>

          {/* Visual History Comparison Bars */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Histori Penjualan 3 Periode vs Ramalan</h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Data realisasi penjualan aktual di kebun mitra vs proyeksi kebutuhan tanam
                </p>
              </div>
              <div className="text-xs text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                Satuan: Kilogram (kg)
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {currentPlan.history.map((h, idx) => {
                const maxVal = 200;
                const pct = Math.min(100, Math.round((h.actualSalesKg / maxVal) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{h.periodLabel}</span>
                        {h.stockoutDetected && (
                          <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold">
                            Habis Cepat (Stockout)
                          </span>
                        )}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">{h.actualSalesKg} kg</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className="bg-slate-500 h-2.5 rounded transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Target Rekomendasi Bar */}
              <div className="space-y-1 pt-2.5 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Target Rekomendasi Sistem Periode Berikutnya</span>
                  </span>
                  <span className="font-mono tabular-nums font-bold text-emerald-900 text-base">
                    {currentPlan.calculatedRecommendationKg} kg
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-emerald-700 h-2.5 rounded transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((currentPlan.calculatedRecommendationKg / 200) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive What-If Scenario Sandbox */}
          <div className="bg-sky-50/20 border-2 border-sky-300 rounded-lg p-5 space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-sky-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-700" />
                  <span>Sandbox Simulasi Skenario Pasar & Cuaca (What-If Analysis)</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Uji ketahanan kapasitas lubang tanam dan kebutuhan sarana BOM terhadap anomali cuaca atau lonjakan permintaan.
                </p>
              </div>
              <span className="text-xs uppercase font-mono font-bold text-sky-900 bg-sky-100 border border-sky-300 px-2.5 py-0.5 rounded">
                Simulasi Real-Time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const simulated = Math.ceil((currentPlan.wmaForecastReadyKg * 1.0 + currentPlan.activePreorderKg) / 5) * 5;
                  setOverrideValue(simulated);
                  setOverrideNote('Skenario Normal: Mengikuti peramalan standar WMA.');
                  setIsOverrideModalOpen(true);
                }}
                className="p-3.5 bg-white hover:bg-sky-50 border-2 border-sky-200 hover:border-sky-400 rounded-md text-left transition-colors space-y-1 shadow-2xs"
              >
                <div className="text-sm font-bold text-slate-900">Skenario Normal</div>
                <div className="text-xs text-slate-600 font-medium">Siklus reguler tanpa anomali iklim.</div>
                <div className="font-mono font-bold text-sky-900 text-sm pt-0.5 tabular-nums">
                  Target: {currentPlan.calculatedRecommendationKg} kg
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const rainyForecast = Math.round(currentPlan.wmaForecastReadyKg * 1.25);
                  const simulated = Math.ceil((rainyForecast + currentPlan.activePreorderKg) / 5) * 5;
                  setOverrideValue(simulated);
                  setOverrideNote('Skenario Musim Hujan: Antisipasi lonjakan permintaan +25% karena gagal panen sayur konvensional tanah.');
                  setIsOverrideModalOpen(true);
                }}
                className="p-3.5 bg-white hover:bg-sky-50 border-2 border-sky-200 hover:border-sky-400 rounded-md text-left transition-colors space-y-1 shadow-2xs"
              >
                <div className="text-sm font-bold text-slate-900">Skenario Musim Hujan (+25%)</div>
                <div className="text-xs text-slate-600 font-medium">Sayur konvensional banjir, beralih ke hidroponik.</div>
                <div className="font-mono font-bold text-sky-900 text-sm pt-0.5 tabular-nums">
                  Target: {Math.ceil((Math.round(currentPlan.wmaForecastReadyKg * 1.25) + currentPlan.activePreorderKg) / 5) * 5} kg
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const simulated = Math.ceil((currentPlan.wmaForecastReadyKg + currentPlan.activePreorderKg + 40) / 5) * 5;
                  setOverrideValue(simulated);
                  setOverrideNote('Skenario Kontrak Katering B2B: Tambahan reservasi katering hajatan +40 kg.');
                  setIsOverrideModalOpen(true);
                }}
                className="p-3.5 bg-white hover:bg-sky-50 border-2 border-sky-200 hover:border-sky-400 rounded-md text-left transition-colors space-y-1 shadow-2xs"
              >
                <div className="text-sm font-bold text-slate-900">Kontrak Katering (+40 kg)</div>
                <div className="text-xs text-slate-600 font-medium">Lonjakan katering hajatan & hotel weekend.</div>
                <div className="font-mono font-bold text-sky-900 text-sm pt-0.5 tabular-nums">
                  Target: {Math.ceil((currentPlan.wmaForecastReadyKg + currentPlan.activePreorderKg + 40) / 5) * 5} kg
                </div>
              </button>
            </div>

            {currentProduct && (
              <div className="p-3 bg-white rounded-md border border-sky-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs font-medium">
                <div>
                  <strong className="text-slate-900">BOM per 1 kg {currentProduct.name}:</strong> {currentProduct.bom.seedCount} benih · {currentProduct.bom.abMixLiters}L AB Mix · {currentProduct.bom.rockwoolSlabs} slab rockwool.
                </div>
                <div className="text-slate-600 font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  Estimasi kebutuhan: ~18 lubang/kg
                </div>
              </div>
            )}
          </div>

          {/* Aturan Sisa Stok & Target Final Section */}
          <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 space-y-3.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Keputusan Target Tanam Final</h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Target akhir yang akan didistribusikan ke modul pembagian batch kebun mitra.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenOverride}
                  className="px-3 py-1.5 text-xs font-bold rounded-md border-2 border-slate-300 text-slate-800 bg-white hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Ubah Target (Override)</span>
                </button>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('batch_produksi')}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-800 text-white hover:bg-emerald-900 flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Terapkan ke Batch Produksi ({currentPlan.finalTargetKg} kg) →</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-50 rounded-md border border-slate-300 text-xs space-y-1.5 shadow-2xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>Prinsip Bisnis Sisa Stok Hidroponik:</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs font-medium">
                  Perencanaan tanam <strong>TIDAK dikurangi sisa stok batch sebelumnya</strong>, karena talang instalasi hidroponik harus terus berputar dan sayuran lama akan susut/layu setelah 3 hari. Sisa stok yang tidak habis dialihkan ke metrik Evaluasi (Serapan Pasar & Susut).
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-md border border-emerald-300 text-xs flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-xs text-emerald-900 font-bold mb-0.5">Target Produksi Final (Wadah Induk):</div>
                  <div className="text-3xl font-bold font-mono tabular-nums text-emerald-950">
                    {currentPlan.finalTargetKg} kg
                  </div>
                  {currentPlan.isOverridden ? (
                    <div className="mt-2 text-amber-950 bg-amber-100 p-2.5 rounded border border-amber-300 text-xs font-medium">
                      <strong className="font-bold">Override Disetujui:</strong> {currentPlan.justificationNote}
                    </div>
                  ) : (
                    <div className="mt-2 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Mengikuti rekomendasi murni algoritma sistem</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Closed-Loop Explanation Card */}
            <div className="p-4 bg-sky-50 border-2 border-sky-300 rounded-md space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-sky-950 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-700" />
                  <span>Prinsip Closed-Loop Terpadu: Batch Sebagai Wadah Induk Penyerapan</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white text-sky-950 border border-sky-300 font-bold">
                  Total Kapasitas: {currentPlan.finalTargetKg} kg
                </span>
              </div>
              <p className="text-xs text-sky-950 leading-relaxed font-medium">
                Target tanam hasil peramalan ini (<strong>{currentPlan.finalTargetKg} kg</strong>) dijadikan satu <strong>Batch Produksi Induk</strong> di kebun mitra. Dari batch inilah kuota <strong>Pre-Order</strong> dibuka di katalog toko agar konsumen dapat memesan inden lebih awal ({currentPlan.activePreorderKg} kg sudah terkunci). Seluruh sisa kuota yang tidak terpesan pre-order secara otomatis dialokasikan menjadi <strong>Ready Stock segar</strong> saat tanggal panen tiba untuk melayani pembeli harian.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Modal Override Justification */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Ubah Target Tanam (Admin Override)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekomendasi algoritma sistem: <strong className="font-mono">{currentPlan?.calculatedRecommendationKg} kg</strong>
              </p>
            </div>

            <form onSubmit={handleSaveOverride} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Baru (kg) *
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
                <span className="text-[10px] text-slate-400">Dianjurkan kelipatan 5</span>
              </div>

              {overrideError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{overrideError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alasan Tertulis (Justification Note) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideNote}
                  onChange={(e) => {
                    setOverrideNote(e.target.value);
                    if (overrideError) setOverrideError(null);
                  }}
                  placeholder="Wajib diisi: contoh 'Ada kontrak katering pernikahan tanggal 25 Oktober sebanyak 30 kg tambahan.'"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Simpan Catatan & Target Final
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
