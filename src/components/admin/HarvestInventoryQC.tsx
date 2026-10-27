'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getFreshnessInfo } from '../../utils/scmAlgorithms';
import { HarvestSubmission } from '../../types';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Sprout,
  Info,
  Check,
  X
} from 'lucide-react';

export const HarvestInventoryQC: React.FC = () => {
  const {
    inventoryLots,
    harvestSubmissions,
    products,
    members,
    approveHarvestAndQC
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stok_kebun' | 'antrean_qc'>('stok_kebun');

  // Simple QC Modal state - direct verification without complex grading, labels, or waste
  const [selectedSubmission, setSelectedSubmission] = useState<HarvestSubmission | null>(null);
  const [verifiedHarvestKg, setVerifiedHarvestKg] = useState<number>(0);
  const [qcNotes, setQcNotes] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const pendingSubmissions = harvestSubmissions.filter((s) => s.status === 'pending_qc');

  const handleOpenQC = (sub: HarvestSubmission) => {
    setSelectedSubmission(sub);
    setVerifiedHarvestKg(sub.grossHarvestKg);
    setQcNotes('Hasil panen segar, kondisi daun bagus & siap didistribusikan langsung dari kebun.');
  };

  const handleConfirmQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    // Direct approval: all verified harvest kg recorded directly into partner garden stock
    approveHarvestAndQC(
      selectedSubmission.id,
      verifiedHarvestKg,
      0,
      0,
      qcNotes
    );

    const subMember = members.find((m) => m.id === selectedSubmission.memberId);
    setSuccessBanner(
      `Panen ${verifiedHarvestKg} kg dari ${subMember?.name || 'Mitra'} berhasil diverifikasi dan aktif di kebun!`
    );
    setSelectedSubmission(null);

    // Auto dismiss banner
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  };

  return (
    <div className="space-y-5">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            QC Panen & Inventaris Kebun Mitra
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Sistem desentralisasi stok: hasil panen tersimpan langsung di instalasi kebun anggota binaan tanpa gudang utama.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border-2 border-slate-300 shadow-2xs text-xs shrink-0">
          <button
            onClick={() => setActiveTab('stok_kebun')}
            className={`px-3.5 py-2 rounded-md text-sm font-bold transition-colors ${
              activeTab === 'stok_kebun'
                ? 'bg-white text-emerald-950 shadow-2xs border-2 border-emerald-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Stok Aktif Kebun ({inventoryLots.length})
          </button>
          <button
            onClick={() => setActiveTab('antrean_qc')}
            className={`px-3.5 py-2 rounded-md text-sm font-bold transition-colors relative flex items-center gap-2 ${
              activeTab === 'antrean_qc'
                ? 'bg-white text-amber-950 shadow-2xs border-2 border-amber-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Verifikasi Panen (QC)</span>
            {pendingSubmissions.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-950 border border-amber-400 rounded-md font-mono text-xs font-bold">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Stok Terdesentralisasi di Kebun Mitra */}
      {activeTab === 'stok_kebun' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50/60 border-2 border-emerald-300 rounded-lg text-sm text-slate-700 flex items-start gap-3 shadow-2xs">
            <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-emerald-950 font-bold">Model Tanpa Gudang Utama:</strong> Sayuran hidroponik tetap berada di instalasi kebun anggota binaan setelah dipetik dan langsung dijemput kurir untuk distribusi pesanan. Proses disederhanakan tanpa pelabelan barcode gudang atau formulir susut.
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-300 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-2.5 px-3.5">Komoditas Sayuran</th>
                    <th className="py-2.5 px-3.5">Lokasi Kebun Mitra</th>
                    <th className="py-2.5 px-3.5">Tanggal Panen</th>
                    <th className="py-2.5 px-3.5">Masa Segar</th>
                    <th className="py-2.5 px-3.5 text-right">Total Panen</th>
                    <th className="py-2.5 px-3.5 text-right">Teralokasi / Terjual</th>
                    <th className="py-2.5 px-3.5 text-right">Stok Siap Kirim</th>
                    <th className="py-2.5 px-3.5 text-center">Status Kebun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal text-slate-900">
                  {inventoryLots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 font-medium">
                        Belum ada data stok panen di kebun mitra.
                      </td>
                    </tr>
                  ) : (
                    inventoryLots.map((lot) => {
                      const product = products.find((p) => p.id === lot.productId);
                      const member = members.find((m) => m.id === lot.memberId);
                      const freshness = getFreshnessInfo(lot.harvestDate);
                      const isAvailable = lot.currentQtyKg > 0;

                      return (
                        <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900">{product?.name || 'Sayuran'}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-medium">
                              Lot ID: {lot.id}
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{member?.name || 'Mitra'}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 ml-5 font-medium">{member?.gardenName}</div>
                          </td>

                          <td className="py-2.5 px-3.5 font-mono tabular-nums text-slate-800 font-semibold">{lot.harvestDate}</td>

                          <td className="py-2.5 px-3.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 ${
                                freshness.badgeType === 'fresh'
                                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                                  : freshness.badgeType === 'good'
                                  ? 'bg-sky-50 text-sky-900 border border-sky-300'
                                  : freshness.badgeType === 'expiring'
                                  ? 'bg-amber-50 text-amber-950 border border-amber-300'
                                  : 'bg-slate-100 text-slate-800 border border-slate-300'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {freshness.label}
                            </span>
                          </td>

                          <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-700 font-semibold">
                            {lot.initialQtyKg} kg
                          </td>

                          <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-700 font-semibold">
                            {lot.soldQtyKg} kg
                          </td>

                          <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                            {lot.currentQtyKg} kg
                          </td>

                          <td className="py-2.5 px-3.5 text-center">
                            {isAvailable ? (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                                Tersedia di Kebun
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                                Habis / Teralokasi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Antrean Verifikasi Panen Anggota Binaan */}
      {activeTab === 'antrean_qc' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Tanggal & Anggota Binaan</th>
                    <th className="py-2.5 px-3.5">Komoditas & Batch</th>
                    <th className="py-2.5 px-3.5 text-right">Laporan Panen Petani</th>
                    <th className="py-2.5 px-3.5 text-center">Status Verifikasi</th>
                    <th className="py-2.5 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal text-slate-900">
                  {harvestSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                        Belum ada laporan panen dari anggota binaan.
                      </td>
                    </tr>
                  ) : (
                    harvestSubmissions.map((sub) => {
                      const prod = products.find((p) => p.id === sub.productId);
                      const member = members.find((m) => m.id === sub.memberId);
                      const isPending = sub.status === 'pending_qc';

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900">{member?.name}</div>
                            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {member?.gardenName} · {sub.submissionDate}
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900">{prod?.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-medium">
                              Batch: {sub.batchId}
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                            {sub.grossHarvestKg} kg
                          </td>

                          <td className="py-2.5 px-3.5 text-center">
                            {isPending ? (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-900 border border-amber-300">
                                Menunggu Verifikasi
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                Terverifikasi ({sub.qcResult?.gradeAKg || sub.grossHarvestKg} kg)
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3.5 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handleOpenQC(sub)}
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 shadow-2xs border border-slate-900"
                              >
                                <ClipboardCheck className="w-3.5 h-3.5" />
                                <span>Verifikasi Panen</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">
                                Selesai
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Simplified QC Verification Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-300">
            <div className="flex items-start justify-between pb-3 border-b border-slate-300 bg-slate-50 -mx-5 -mt-5 p-4 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white text-slate-800 rounded-md border border-slate-300 shadow-2xs">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Verifikasi Hasil Panen Kebun
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Stok sayuran langsung aktif di kebun mitra untuk siap diambil kurir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmQC} className="space-y-3.5 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-md text-xs space-y-1.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Anggota Binaan:</span>
                  <span className="font-bold text-slate-900">
                    {members.find((m) => m.id === selectedSubmission.memberId)?.name} (
                    {members.find((m) => m.id === selectedSubmission.memberId)?.gardenName})
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Komoditas & Batch:</span>
                  <span className="font-bold text-slate-900">
                    {products.find((p) => p.id === selectedSubmission.productId)?.name} · {selectedSubmission.batchId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Laporan Panen Petani:</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                    {selectedSubmission.grossHarvestKg} kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Jumlah Panen Terverifikasi (kg) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={verifiedHarvestKg}
                  onChange={(e) => setVerifiedHarvestKg(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-md font-mono tabular-nums font-bold focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white"
                />
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Jumlah panen bersih yang disetujui untuk siap dijual/dikirim.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Catatan Pemeriksaan
                </label>
                <input
                  type="text"
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  placeholder="Kondisi sayuran segar, siap dijemput kurir..."
                  className="w-full text-xs p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 shadow-2xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs border border-slate-900"
                >
                  Verifikasi & Terbitkan Stok Kebun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
