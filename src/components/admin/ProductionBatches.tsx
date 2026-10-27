'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Plus,
  Play,
  AlertCircle,
  CheckCircle,
  PackageCheck,
  ShieldAlert,
  Sprout,
  Users,
  Boxes
} from 'lucide-react';

export const ProductionBatches: React.FC = () => {
  const {
    batches,
    products,
    members,
    rawMaterials,
    materialPlans,
    createProductionBatch,
    startProductionBatch,
    restockRawMaterial
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Batch Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [batchCode, setBatchCode] = useState(`BATCH-PKC-2026-${Math.floor(10 + Math.random() * 89)}`);
  const [totalTargetKg, setTotalTargetKg] = useState(100);
  const [startDate, setStartDate] = useState('2026-10-18');
  const [estHarvestDate, setEstHarvestDate] = useState('2026-11-18');
  const [batchNotes, setBatchNotes] = useState('Siklus NFT musim basah');

  // Allocation per member state
  const [allocations, setAllocations] = useState<{ [memberId: string]: number }>({
    'mbr-01': 50,
    'mbr-02': 50
  });

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const handleAllocationChange = (memberId: string, kg: number) => {
    setAllocations((prev) => ({
      ...prev,
      [memberId]: kg
    }));
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Hitung total alokasi
    const allocArray = Object.entries(allocations)
      .filter(([_, kg]) => kg > 0)
      .map(([mId, kg]) => {
        // Asumsi estimasi 1 kg sayur butuh ~18 lubang tanam
        const holes = Math.round(kg * 18);
        return {
          memberId: mId,
          targetKg: kg,
          usedHoles: holes
        };
      });

    const sumAllocated = allocArray.reduce((acc, a) => acc + a.targetKg, 0);
    if (sumAllocated !== totalTargetKg) {
      setErrorMessage(
        `Total alokasi ke mitra (${sumAllocated} kg) harus sama persis dengan total target batch (${totalTargetKg} kg).`
      );
      return;
    }

    const res = createProductionBatch({
      productId: selectedProductId,
      batchCode,
      totalTargetKg,
      startDate,
      estimatedHarvestDate: estHarvestDate,
      allocations: allocArray,
      notes: batchNotes
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Terjadi kesalahan validasi kapasitas.');
    } else {
      setIsCreateModalOpen(false);
      setErrorMessage(null);
    }
  };

  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleStartBatch = (batchId: string) => {
    const res = startProductionBatch(batchId);
    if (!res.success) {
      setNotificationBanner({
        type: 'error',
        message: `Validasi Kesiapan Tanam Gagal: ${res.error}`
      });
    } else {
      setNotificationBanner({
        type: 'success',
        message: 'Batch berhasil dimulai! Seluruh mitra binaan telah terkonfirmasi siap tanam dan beban instalasi lubang NFT telah aktif.'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Notification banner */}
      {notificationBanner && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            notificationBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationBanner.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notificationBanner.message}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Produksi & Pembagian Batch Kebun</h1>
          <p className="text-sm text-slate-600 mt-1">
            Alokasi target ke mitra dengan validasi ketat kapasitas lubang tanam dan otomasi pemotongan bahan baku (BOM).
          </p>
        </div>

        <button
          onClick={() => {
            setBatchCode(`BATCH-${product.id.slice(5, 8).toUpperCase()}-2026-${Math.floor(10 + Math.random() * 89)}`);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-bold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-2xs border-2 border-emerald-900"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Batch Tanam Baru</span>
        </button>
      </div>

      {/* Raw Materials Quick Status */}
      <div className="bg-white border-2 border-emerald-300 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b-2 border-emerald-100">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4.5 h-4.5 text-emerald-800" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Stok Bahan Baku & Sarana Produksi (BOM Ready)
            </span>
          </div>
          <button
            onClick={() => {
              const mat = rawMaterials[0];
              if (mat) {
                restockRawMaterial(mat.id, 500);
                setNotificationBanner({
                  type: 'success',
                  message: `Stok ${mat.name} berhasil ditambah sebanyak 500 ${mat.unit} ke gudang.`
                });
              }
            }}
            className="text-xs font-bold text-emerald-900 bg-emerald-50 border-2 border-emerald-300 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            + Quick Restock Benih (500 butir)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {rawMaterials.map((mat) => {
            const isLow = mat.stock <= mat.minStockAlert;
            return (
              <div
                key={mat.id}
                className={`p-3 rounded-lg border-2 text-xs shadow-2xs ${
                  isLow ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs text-slate-600 font-medium line-clamp-1">{mat.name}</div>
                <div className="font-mono font-bold tabular-nums text-base text-slate-900 mt-1">
                  {mat.stock} <span className="text-xs font-normal text-slate-500">{mat.unit}</span>
                </div>
                {isLow && (
                  <div className="text-xs text-rose-700 font-bold mt-1">
                    Hampir Habis
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Batches Table */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Daftar Siklus Batch Produksi
        </div>

        <div className="grid grid-cols-1 gap-3">
          {batches.map((batch) => {
            const prod = products.find((p) => p.id === batch.productId);
            const isPlanned = batch.status === 'planned';
            const isInProgress = batch.status === 'in_progress';

            return (
              <div
                key={batch.id}
                className={`bg-white rounded-lg p-4 transition-colors space-y-3 shadow-2xs ${
                  isInProgress
                    ? 'border-2 border-emerald-400'
                    : isPlanned
                    ? 'border-2 border-amber-300'
                    : 'border-2 border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b-2 border-slate-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded">
                      {batch.batchCode}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{prod?.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-600 font-mono">
                      Tanam: {batch.startDate} → Estimasi Panen: <strong className="text-slate-800 font-bold">{batch.estimatedHarvestDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded border-2 ${
                        isPlanned
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : isInProgress
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {isPlanned && 'Direncanakan (Belum Tanam)'}
                      {isInProgress && 'Sedang Ditanam di NFT'}
                      {batch.status === 'completed' && 'Siklus Selesai'}
                    </span>

                    {isPlanned && (
                      <>
                        {(() => {
                          const bPlans = materialPlans.filter((p) => p.batchId === batch.id);
                          if (bPlans.length === 0) return null;
                          const notReady = bPlans.filter((p) => p.plantingReadiness !== 'siap_tanam').length;
                          return notReady > 0 ? (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>{notReady} Mitra Belum Siap</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Semua Siap Tanam</span>
                            </span>
                          );
                        })()}

                        <button
                          onClick={() => handleStartBatch(batch.id)}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Mulai Tanam</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Body: Allocations per Member & Dual-Channel Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {(() => {
                    const remainingReadyKg = Math.max(0, batch.totalTargetKg - batch.preorderSoldKg);
                    const pctPreorder = Math.min(100, Math.round((batch.preorderSoldKg / batch.totalTargetKg) * 100));
                    const pctReady = 100 - pctPreorder;

                    return (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-2">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                            Wadah Induk Kapasitas:
                          </div>
                          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                            {batch.totalTargetKg} kg
                          </div>
                        </div>

                        {/* Dual-Channel Visual Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                            <div
                              className="bg-sky-600 h-2 transition-all"
                              style={{ width: `${pctPreorder}%` }}
                              title={`Pre-Order: ${batch.preorderSoldKg} kg (${pctPreorder}%)`}
                            />
                            <div
                              className="bg-emerald-600 h-2 transition-all"
                              style={{ width: `${pctReady}%` }}
                              title={`Sisa Ready Stock: ${remainingReadyKg} kg (${pctReady}%)`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono tabular-nums">
                            <span className="text-sky-700 font-semibold">
                              Pre-Order: {batch.preorderSoldKg} kg ({pctPreorder}%)
                            </span>
                            <span className="text-emerald-700 font-semibold">
                              Ready: {remainingReadyKg} kg ({pctReady}%)
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 leading-tight">
                          Kuota pre-order diambil dari batch ini; sisa saat panen otomatis menjadi stok pasar harian.
                        </div>

                        {batch.materialsDeducted && (
                          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5 border-t border-slate-200">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>BOM bahan baku telah dipotong</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="md:col-span-3">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Distribusi Kuota per Kebun Mitra:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {batch.allocations.map((alloc) => {
                        const member = members.find((m) => m.id === alloc.memberId);
                        return (
                          <div
                            key={alloc.memberId}
                            className="p-2.5 border border-slate-200 rounded-md text-xs bg-white space-y-1"
                          >
                            <div className="font-medium text-slate-900">{member?.name}</div>
                            <div className="text-[11px] text-slate-500">{member?.gardenName}</div>
                            <div className="flex justify-between pt-1 border-t border-slate-100 font-mono text-[11px] tabular-nums">
                              <span>Target: <strong>{alloc.targetKg} kg</strong></span>
                              <span>{alloc.usedHoles} lubang</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Status: <span className="font-medium text-slate-700">{alloc.progressStatus}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Buat Batch Tanam Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Buat Batch Tanam & Alokasi Beban Mitra
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sistem memvalidasi: <code className="font-mono text-slate-700">Target Baru ≤ Kapasitas Lubang - Beban Berjalan</code>.
              </p>
            </div>

            {errorMessage && (
              <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="p-5 space-y-3.5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Varietas Sayuran *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kode Batch *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Target (kg) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={totalTargetKg}
                    onChange={(e) => setTotalTargetKg(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 font-mono border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tanggal Semai/Tanam *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estimasi Panen *
                  </label>
                  <input
                    type="date"
                    required
                    value={estHarvestDate}
                    onChange={(e) => setEstHarvestDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* Member Capacity Breakdown & Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Alokasi Target per Mitra (kg) & Cek Kapasitas Lubang
                </label>
                <div className="space-y-1.5 border border-slate-200 rounded-md p-2.5 bg-slate-50">
                  {members.map((member) => {
                    const remainingHoles = member.totalHoles - member.activeLoadHoles;
                    const assignedKg = allocations[member.id] || 0;
                    const neededHoles = Math.round(assignedKg * 18);
                    const isExceeded = neededHoles > remainingHoles;

                    return (
                      <div
                        key={member.id}
                        className={`p-2.5 rounded-md border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isExceeded ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{member.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {member.gardenName} · Sisa Kapasitas:{' '}
                            <strong className="font-mono tabular-nums">{remainingHoles}</strong> / {member.totalHoles} lubang
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Target:</span>
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={assignedKg}
                            onChange={(e) => handleAllocationChange(member.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-xs border border-slate-300 rounded-md text-center font-mono tabular-nums bg-white focus:outline-none focus:border-slate-500"
                          />
                          <span className="text-xs text-slate-500">kg</span>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                            (~{neededHoles} lb)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                >
                  Simpan & Rencanakan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
