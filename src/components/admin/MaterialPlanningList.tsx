'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialPlan, PlantingReadinessStatus } from '../../types';
import { MaterialPlanningDetailModal } from './MaterialPlanningDetailModal';
import { MaterialStandardsConfig } from './MaterialStandardsConfig';
import {
  Boxes,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Search,
  Filter,
  Layers,
  Sprout,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';

export const MaterialPlanningList: React.FC = () => {
  const { materialPlans, batches, products, members } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'standards'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<MaterialPlan | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');

  // Metrics
  const totalPlans = materialPlans.length;
  const readyCount = materialPlans.filter((p) => p.plantingReadiness === 'siap_tanam').length;
  const shortageCount = materialPlans.filter((p) => p.plantingReadiness === 'belum_siap').length;
  const pendingCount = materialPlans.filter(
    (p) => p.plantingReadiness === 'menunggu_konfirmasi'
  ).length;
  const rejectedCount = materialPlans.filter((p) => p.plantingReadiness === 'menolak').length;

  // Filtered plans
  const filteredPlans = materialPlans.filter((p) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${p.id} ${p.batchCode} ${p.memberName} ${p.gardenName} ${p.productName}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && p.plantingReadiness !== statusFilter) {
      return false;
    }

    // Batch filter
    if (batchFilter !== 'all' && p.batchId !== batchFilter) {
      return false;
    }

    // Product filter
    if (productFilter !== 'all' && p.productId !== productFilter) {
      return false;
    }

    return true;
  });

  const getReadinessBadge = (status: PlantingReadinessStatus) => {
    switch (status) {
      case 'siap_tanam':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Siap Tanam</span>
          </span>
        );
      case 'belum_siap':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Belum Siap (Kurang)</span>
          </span>
        );
      case 'menunggu_konfirmasi':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Menunggu Konfirmasi</span>
          </span>
        );
      case 'menolak':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Menolak Alokasi</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Philosophy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              <Boxes className="w-4 h-4 text-emerald-700" />
            </span>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Perencanaan Kebutuhan Bahan Baku (MRP)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Estimasi kebutuhan benih, rockwool, dan nutrisi hidroponik terintegrasi dengan rencana
            produksi per kebun mitra. Anggota binaan bertanggung jawab mandiri atas pembelian
            bahannya; sistem mencatat estimasi kebutuhan dan konfirmasi ketersediaan sebelum penanaman.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'plans'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rencana per Batch & Anggota
          </button>
          <button
            onClick={() => setActiveSubTab('standards')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'standards'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Standar Kebutuhan</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'standards' ? (
        <MaterialStandardsConfig />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-500">Total Rencana Tanam</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900">{totalPlans}</div>
              <div className="text-[10px] text-slate-400">Alokasi kebun terdaftar</div>
            </div>

            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1 shadow-2xs">
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Siap Tanam</span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-900">{readyCount}</div>
              <div className="text-[10px] text-emerald-700">Bahan lengkap & siap mulai</div>
            </div>

            <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1 shadow-2xs">
              <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Belum Siap (Kurang)</span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-900">{shortageCount}</div>
              <div className="text-[10px] text-amber-700">Ada kekurangan bahan tanam</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 shadow-2xs">
              <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Menunggu Konfirmasi</span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-800">{pendingCount}</div>
              <div className="text-[10px] text-slate-400">Petani belum lapor stok</div>
            </div>

            <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-lg space-y-1 col-span-2 sm:col-span-1 shadow-2xs">
              <div className="text-[11px] text-rose-800 font-semibold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Menolak Alokasi</span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-rose-900">{rejectedCount}</div>
              <div className="text-[10px] text-rose-700">Kendala pipa/greenhouse</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari petani, kebun, batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>

              {/* Status Kesiapan Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="all">Semua Status Kesiapan</option>
                  <option value="siap_tanam">Siap Tanam</option>
                  <option value="belum_siap">Belum Siap (Kekurangan)</option>
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                  <option value="menolak">Menolak Alokasi</option>
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white font-mono focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="all">Semua Batch Tanam</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Filter */}
              <div>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="all">Semua Komoditas Sayur</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Plans Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Rencana & Batch</th>
                    <th className="py-2.5 px-3.5">Petani Mitra & Kebun</th>
                    <th className="py-2.5 px-3.5">Komoditas & Target</th>
                    <th className="py-2.5 px-3.5 text-center">Kebutuhan Benih</th>
                    <th className="py-2.5 px-3.5 text-center">Kebutuhan Rockwool</th>
                    <th className="py-2.5 px-3.5 text-center">Kebutuhan AB Mix</th>
                    <th className="py-2.5 px-3.5 text-center">Status Kesiapan</th>
                    <th className="py-2.5 px-3.5 text-right">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada rencana kebutuhan bahan baku yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => {
                      const seedItem = plan.items.find((i) => i.materialType === 'seed');
                      const rockwoolItem = plan.items.find((i) => i.materialType === 'rockwool');
                      const nutrientItem = plan.items.find((i) => i.materialType === 'nutrient');

                      return (
                        <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="font-mono font-bold text-slate-900">{plan.id}</div>
                            <div className="font-mono text-[10px] text-slate-500 font-semibold mt-0.5">
                              {plan.batchCode}
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900">{plan.memberName}</div>
                            <div className="text-[11px] text-slate-500">{plan.gardenName}</div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900">{plan.productName}</div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                              {plan.targetKg} kg · ~{plan.estimatedHoles.toLocaleString('id-ID')} lb
                            </div>
                          </td>

                          {/* Benih Column */}
                          <td className="py-2.5 px-3.5 text-center">
                            <div className="font-mono tabular-nums font-semibold text-slate-900">
                              {seedItem?.requiredQty.toLocaleString('id-ID')} {seedItem?.unit}
                            </div>
                            <div className="text-[10px] mt-0.5 font-mono tabular-nums">
                              {seedItem?.confirmedStockQty !== null ? (
                                seedItem?.shortageQty === 0 ? (
                                  <span className="text-emerald-700 font-medium">Stok cukup</span>
                                ) : (
                                  <span className="text-rose-700 font-bold">
                                    Kurang {seedItem?.shortageQty}
                                  </span>
                                )
                              ) : (
                                <span className="italic text-slate-400">Belum lapor</span>
                              )}
                            </div>
                          </td>

                          {/* Rockwool Column */}
                          <td className="py-2.5 px-3.5 text-center">
                            <div className="font-mono tabular-nums font-semibold text-slate-900">
                              {rockwoolItem?.requiredQty.toLocaleString('id-ID')} {rockwoolItem?.unit}
                            </div>
                            <div className="text-[10px] mt-0.5 font-mono tabular-nums">
                              {rockwoolItem?.confirmedStockQty !== null ? (
                                rockwoolItem?.shortageQty === 0 ? (
                                  <span className="text-emerald-700 font-medium">Stok cukup</span>
                                ) : (
                                  <span className="text-rose-700 font-bold">
                                    Kurang {rockwoolItem?.shortageQty}
                                  </span>
                                )
                              ) : (
                                <span className="italic text-slate-400">Belum lapor</span>
                              )}
                            </div>
                          </td>

                          {/* Nutrisi AB Mix Column */}
                          <td className="py-2.5 px-3.5 text-center">
                            <div className="font-mono tabular-nums font-semibold text-slate-900">
                              {nutrientItem?.requiredQty.toLocaleString('id-ID')} {nutrientItem?.unit}
                            </div>
                            <div className="text-[10px] mt-0.5 font-mono tabular-nums">
                              {nutrientItem?.confirmedStockQty !== null ? (
                                nutrientItem?.shortageQty === 0 ? (
                                  <span className="text-emerald-700 font-medium">Stok cukup</span>
                                ) : (
                                  <span className="text-rose-700 font-bold">
                                    Kurang {nutrientItem?.shortageQty}
                                  </span>
                                )
                              ) : (
                                <span className="italic text-slate-400">Belum lapor</span>
                              )}
                            </div>
                          </td>

                          {/* Status Kesiapan */}
                          <td className="py-2.5 px-3.5 text-center">
                            {getReadinessBadge(plan.plantingReadiness)}
                          </td>

                          {/* Action Button */}
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              onClick={() => setSelectedPlan(plan)}
                              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Rincian</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-semibold text-slate-800">
                Peringatan Operasional & Validasi Mulai Tanam:
              </span>
              <p>
                Penanaman tidak otomatis dimulai saat perhitungan selesai. Tombol{' '}
                <strong className="text-slate-800">Mulai Tanam</strong> pada modul Batch Produksi akan memvalidasi status
                seluruh mitra. Jika terdapat mitra yang masih <em>Menunggu Konfirmasi</em>,{' '}
                <em>Belum Siap</em>, atau <em>Menolak</em>, sistem akan memblokir dan meminta
                penyesuaian rencana agar tidak terjadi kegagalan serapan bibit di kebun mitra.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Detail & Manual Confirmation Modal */}
      {selectedPlan && (
        <MaterialPlanningDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};
