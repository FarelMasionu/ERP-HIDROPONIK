import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, MaterialPlan, PlantingReadinessStatus } from '../../types';
import {
  Boxes,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Save,
  Layers,
  Sprout,
  HelpCircle,
  Check,
  Info
} from 'lucide-react';

interface MemberMaterialReadinessProps {
  member: Member;
}

export const MemberMaterialReadiness: React.FC<MemberMaterialReadinessProps> = ({ member }) => {
  const { materialPlans, confirmMemberMaterialStock } = useApp();

  const myPlans = materialPlans.filter((p) => p.memberId === member.id);

  // Per-plan editing state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [seedStocks, setSeedStocks] = useState<{ [planId: string]: number | '' }>({});
  const [rockwoolStocks, setRockwoolStocks] = useState<{ [planId: string]: number | '' }>({});
  const [nutrientStocks, setNutrientStocks] = useState<{ [planId: string]: number | '' }>({});
  const [readinessStatuses, setReadinessStatuses] = useState<{
    [planId: string]: PlantingReadinessStatus;
  }>({});
  const [notesState, setNotesState] = useState<{ [planId: string]: string }>({});
  const [savedNotices, setSavedNotices] = useState<{ [planId: string]: string }>({});

  const initPlanForm = (plan: MaterialPlan) => {
    const seed = plan.items.find((i) => i.materialType === 'seed')?.confirmedStockQty;
    const rockwool = plan.items.find((i) => i.materialType === 'rockwool')?.confirmedStockQty;
    const nutrient = plan.items.find((i) => i.materialType === 'nutrient')?.confirmedStockQty;

    setSeedStocks((prev) => ({ ...prev, [plan.id]: seed ?? '' }));
    setRockwoolStocks((prev) => ({ ...prev, [plan.id]: rockwool ?? '' }));
    setNutrientStocks((prev) => ({ ...prev, [plan.id]: nutrient ?? '' }));
    setReadinessStatuses((prev) => ({ ...prev, [plan.id]: plan.plantingReadiness }));
    setNotesState((prev) => ({ ...prev, [plan.id]: plan.readinessNotes || '' }));
    setEditingPlanId(plan.id);
  };

  const handleConfirmSubmit = (plan: MaterialPlan, e: React.FormEvent) => {
    e.preventDefault();

    const seedVal = seedStocks[plan.id];
    const rockwoolVal = rockwoolStocks[plan.id];
    const nutrientVal = nutrientStocks[plan.id];
    const readiness = readinessStatuses[plan.id] || 'menunggu_konfirmasi';
    const notes = notesState[plan.id] || '';

    confirmMemberMaterialStock(
      plan.id,
      {
        seed: seedVal === '' ? undefined : Number(seedVal),
        rockwool: rockwoolVal === '' ? undefined : Number(rockwoolVal),
        nutrient: nutrientVal === '' ? undefined : Number(nutrientVal)
      },
      readiness,
      notes
    );

    setSavedNotices((prev) => ({
      ...prev,
      [plan.id]: 'Laporan stok bahan & kesiapan tanam berhasil disimpan!'
    }));
    setEditingPlanId(null);
    setTimeout(() => {
      setSavedNotices((prev) => {
        const copy = { ...prev };
        delete copy[plan.id];
        return copy;
      });
    }, 4000);
  };

  const getReadinessBadge = (status: PlantingReadinessStatus) => {
    switch (status) {
      case 'siap_tanam':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Siap Tanam (Bahan Cukup)</span>
          </span>
        );
      case 'belum_siap':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Belum Siap (Kekurangan Bahan)</span>
          </span>
        );
      case 'menunggu_konfirmasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Menunggu Laporan Kesiapan</span>
          </span>
        );
      case 'menolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Menolak Alokasi Batch Ini</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Informative Guidance Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
        <Boxes className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <div className="font-bold text-slate-900">
            Pengecekan Kesiapan Bahan Baku Kebun Sendiri
          </div>
          <p className="text-slate-700 font-medium">
            Sebagai anggota binaan Al-Baroqah, Anda bertanggung jawab secara mandiri atas pembelian
            dan persediaan bahan tanam (benih, rockwool, serta pekatan AB Mix). Sistem membantu
            menghitung estimasi jumlah yang dibutuhkan berdasarkan kapasitas lubang tanam batch.
            Silakan laporkan ketersediaan stok Anda di bawah sebelum jadwal semai dimulai.
          </p>
        </div>
      </div>

      {myPlans.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-300 rounded-lg text-slate-500 font-medium text-xs shadow-2xs">
          Belum ada jadwal rencana kebutuhan bahan baku yang dialokasikan ke kebun Anda.
        </div>
      ) : (
        <div className="space-y-4">
          {myPlans.map((plan) => {
            const isEditing = editingPlanId === plan.id;
            const seedItem = plan.items.find((i) => i.materialType === 'seed');
            const rockwoolItem = plan.items.find((i) => i.materialType === 'rockwool');
            const nutrientItem = plan.items.find((i) => i.materialType === 'nutrient');

            // Interactive live inputs
            const curSeed = seedStocks[plan.id] ?? seedItem?.confirmedStockQty ?? '';
            const curRockwool = rockwoolStocks[plan.id] ?? rockwoolItem?.confirmedStockQty ?? '';
            const curNutrient = nutrientStocks[plan.id] ?? nutrientItem?.confirmedStockQty ?? '';
            const curReadiness = readinessStatuses[plan.id] ?? plan.plantingReadiness;
            const curNotes = notesState[plan.id] ?? plan.readinessNotes ?? '';

            // Compute live shortages
            const seedShortage =
              curSeed === '' ? null : Math.max(0, (seedItem?.requiredQty || 0) - Number(curSeed));
            const rockwoolShortage =
              curRockwool === ''
                ? null
                : Math.max(0, (rockwoolItem?.requiredQty || 0) - Number(curRockwool));
            const nutrientShortage =
              curNutrient === ''
                ? null
                : Math.max(0, (nutrientItem?.requiredQty || 0) - Number(curNutrient));

            return (
              <div
                key={plan.id}
                className="bg-white border border-slate-300 rounded-lg p-4 hover:border-slate-400 transition-colors space-y-3.5 shadow-2xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                        {plan.batchCode}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{plan.productName}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-2">
                      <span>Target Panen Anda: <strong className="text-slate-900 font-bold">{plan.targetKg} kg</strong></span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        Estimasi Lubang: <strong className="text-slate-900 font-bold">{plan.estimatedHoles.toLocaleString('id-ID')} lubang</strong>
                      </span>
                    </div>
                  </div>

                  <div>{getReadinessBadge(plan.plantingReadiness)}</div>
                </div>

                {savedNotices[plan.id] && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-900 font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{savedNotices[plan.id]}</span>
                  </div>
                )}

                {/* Display Table of Requirements */}
                <div className="border border-slate-300 rounded-md overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Bahan Tanam</th>
                        <th className="py-2.5 px-3 text-center">Estimasi Kebutuhan</th>
                        <th className="py-2.5 px-3 text-center">Stok Kebun Anda</th>
                        <th className="py-2.5 px-3 text-center">Status Kekurangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
                      {/* Benih */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{seedItem?.materialName}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Benih tanaman</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-slate-900">
                          {seedItem?.requiredQty.toLocaleString('id-ID')} {seedItem?.unit}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {seedItem?.confirmedStockQty !== null ? (
                            <span className="font-mono tabular-nums font-semibold text-slate-800">
                              {seedItem?.confirmedStockQty?.toLocaleString('id-ID')} {seedItem?.unit}
                            </span>
                          ) : (
                            <span className="italic text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Belum lapor</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {seedItem?.confirmedStockQty === null ? (
                            <span className="text-slate-400 text-[11px]">-</span>
                          ) : seedItem?.shortageQty === 0 ? (
                            <span className="text-emerald-800 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Cukup
                            </span>
                          ) : (
                            <span className="text-rose-800 font-bold font-mono tabular-nums text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Kurang {seedItem?.shortageQty?.toLocaleString('id-ID')} {seedItem?.unit}
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Rockwool */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{rockwoolItem?.materialName}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Media semai kubus</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-slate-900">
                          {rockwoolItem?.requiredQty.toLocaleString('id-ID')} {rockwoolItem?.unit}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {rockwoolItem?.confirmedStockQty !== null ? (
                            <span className="font-mono tabular-nums font-bold text-slate-900">
                              {rockwoolItem?.confirmedStockQty?.toLocaleString('id-ID')}{' '}
                              {rockwoolItem?.unit}
                            </span>
                          ) : (
                            <span className="italic text-slate-500 font-medium text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">Belum lapor</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {rockwoolItem?.confirmedStockQty === null ? (
                            <span className="text-slate-400 text-[11px] font-bold">-</span>
                          ) : rockwoolItem?.shortageQty === 0 ? (
                            <span className="text-emerald-900 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              Cukup
                            </span>
                          ) : (
                            <span className="text-rose-900 font-bold font-mono tabular-nums text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                              Kurang {rockwoolItem?.shortageQty?.toLocaleString('id-ID')}{' '}
                              {rockwoolItem?.unit}
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Nutrisi AB Mix */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{nutrientItem?.materialName}</div>
                          <div className="text-[10px] text-slate-500 font-medium">Pekatan nutrisi NFT</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-slate-900">
                          {nutrientItem?.requiredQty.toLocaleString('id-ID')} {nutrientItem?.unit}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {nutrientItem?.confirmedStockQty !== null ? (
                            <span className="font-mono tabular-nums font-bold text-slate-900">
                              {nutrientItem?.confirmedStockQty?.toLocaleString('id-ID')}{' '}
                              {nutrientItem?.unit}
                            </span>
                          ) : (
                            <span className="italic text-slate-500 font-medium text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">Belum lapor</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {nutrientItem?.confirmedStockQty === null ? (
                            <span className="text-slate-400 text-[11px] font-bold">-</span>
                          ) : nutrientItem?.shortageQty === 0 ? (
                            <span className="text-emerald-900 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                              Cukup
                            </span>
                          ) : (
                            <span className="text-rose-900 font-bold font-mono tabular-nums text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                              Kurang {nutrientItem?.shortageQty?.toLocaleString('id-ID')}{' '}
                              {nutrientItem?.unit}
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Member Notes if present */}
                {plan.readinessNotes && !isEditing && (
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 shadow-2xs">
                    <span className="font-bold text-slate-900 block mb-0.5">Catatan Kesiapan Anda:</span>
                    <p className="italic font-medium">{plan.readinessNotes}</p>
                    {plan.confirmedAt && (
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono font-medium">
                        Dikonfirmasi pada: {plan.confirmedAt}
                      </span>
                    )}
                  </div>
                )}

                {/* Edit Toggle / Form */}
                {!isEditing ? (
                  <div className="pt-1 flex items-center justify-between">
                    <div className="text-[11px] text-slate-600 font-medium">
                      {plan.memberConfirmationStatus === 'sudah_konfirmasi'
                        ? 'Status telah dilaporkan ke manajemen.'
                        : 'Mohon konfirmasi ketersediaan bahan Anda.'}
                    </div>
                    <button
                      onClick={() => initPlanForm(plan)}
                      className="px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>
                        {plan.memberConfirmationStatus === 'sudah_konfirmasi'
                          ? 'Perbarui Laporan Bahan'
                          : 'Laporkan Stok & Kesiapan'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => handleConfirmSubmit(plan, e)}
                    className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-slate-700" />
                        <span>Formulir Lapor Ketersediaan Bahan di Kebun Anda</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Batal
                      </button>
                    </div>

                    {/* Stock Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Stok Benih Anda ({seedItem?.unit})
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={seedStocks[plan.id] ?? ''}
                          onChange={(e) =>
                            setSeedStocks((prev) => ({
                              ...prev,
                              [plan.id]: e.target.value === '' ? '' : parseInt(e.target.value) || 0
                            }))
                          }
                          placeholder={`Butuh ${seedItem?.requiredQty}`}
                          className="w-full p-2 border border-slate-300 rounded text-xs font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                        {seedShortage !== null && (
                          <div className="text-[10px] mt-1 font-mono tabular-nums">
                            {seedShortage === 0 ? (
                              <span className="text-emerald-700 font-semibold">✓ Stok cukup</span>
                            ) : (
                              <span className="text-rose-700 font-bold">
                                Kurang {seedShortage} {seedItem?.unit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Stok Rockwool Anda ({rockwoolItem?.unit})
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={rockwoolStocks[plan.id] ?? ''}
                          onChange={(e) =>
                            setRockwoolStocks((prev) => ({
                              ...prev,
                              [plan.id]: e.target.value === '' ? '' : parseInt(e.target.value) || 0
                            }))
                          }
                          placeholder={`Butuh ${rockwoolItem?.requiredQty}`}
                          className="w-full p-2 border border-slate-300 rounded text-xs font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                        {rockwoolShortage !== null && (
                          <div className="text-[10px] mt-1 font-mono tabular-nums">
                            {rockwoolShortage === 0 ? (
                              <span className="text-emerald-700 font-semibold">✓ Stok cukup</span>
                            ) : (
                              <span className="text-rose-700 font-bold">
                                Kurang {rockwoolShortage} {rockwoolItem?.unit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Stok Nutrisi AB Mix ({nutrientItem?.unit})
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={nutrientStocks[plan.id] ?? ''}
                          onChange={(e) =>
                            setNutrientStocks((prev) => ({
                              ...prev,
                              [plan.id]: e.target.value === '' ? '' : parseInt(e.target.value) || 0
                            }))
                          }
                          placeholder={`Butuh ${nutrientItem?.requiredQty}`}
                          className="w-full p-2 border border-slate-300 rounded text-xs font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                        {nutrientShortage !== null && (
                          <div className="text-[10px] mt-1 font-mono tabular-nums">
                            {nutrientShortage === 0 ? (
                              <span className="text-emerald-700 font-semibold">✓ Stok cukup</span>
                            ) : (
                              <span className="text-rose-700 font-bold">
                                Kurang {nutrientShortage} {nutrientItem?.unit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Readiness Radio / Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Pernyataan Kesiapan Tanam Anda:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label
                          className={`p-2.5 rounded-md border text-xs cursor-pointer transition-colors flex items-start gap-2 shadow-2xs ${
                            curReadiness === 'siap_tanam'
                              ? 'bg-slate-100 border-slate-400 text-slate-900 font-bold'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`readiness-${plan.id}`}
                            value="siap_tanam"
                            checked={curReadiness === 'siap_tanam'}
                            onChange={() =>
                              setReadinessStatuses((prev) => ({ ...prev, [plan.id]: 'siap_tanam' }))
                            }
                            className="mt-0.5 text-slate-900 focus:ring-slate-500"
                          />
                          <div>
                            <div className="font-bold">Siap Tanam</div>
                            <div className="text-[10px] font-medium text-slate-600">
                              Stok bahan cukup & instalasi siap
                            </div>
                          </div>
                        </label>

                        <label
                          className={`p-2.5 rounded-md border text-xs cursor-pointer transition-colors flex items-start gap-2 shadow-2xs ${
                            curReadiness === 'belum_siap'
                              ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`readiness-${plan.id}`}
                            value="belum_siap"
                            checked={curReadiness === 'belum_siap'}
                            onChange={() =>
                              setReadinessStatuses((prev) => ({ ...prev, [plan.id]: 'belum_siap' }))
                            }
                            className="mt-0.5 text-amber-700 focus:ring-amber-500"
                          />
                          <div>
                            <div className="font-bold text-amber-950">Belum Siap</div>
                            <div className="text-[10px] font-medium text-amber-800">
                              Masih menunggu pesanan bahan
                            </div>
                          </div>
                        </label>

                        <label
                          className={`p-2.5 rounded-md border text-xs cursor-pointer transition-colors flex items-start gap-2 shadow-2xs ${
                            curReadiness === 'menolak'
                              ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`readiness-${plan.id}`}
                            value="menolak"
                            checked={curReadiness === 'menolak'}
                            onChange={() =>
                              setReadinessStatuses((prev) => ({ ...prev, [plan.id]: 'menolak' }))
                            }
                            className="mt-0.5 text-rose-700 focus:ring-rose-500"
                          />
                          <div>
                            <div className="font-bold text-rose-950">Menolak Alokasi</div>
                            <div className="text-[10px] font-medium text-rose-800">
                              Kendala pipa / talang / perbaikan
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Notes Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Catatan atau Keterangan Kesiapan (Opsional):
                      </label>
                      <textarea
                        rows={2}
                        value={notesState[plan.id] ?? ''}
                        onChange={(e) =>
                          setNotesState((prev) => ({ ...prev, [plan.id]: e.target.value }))
                        }
                        placeholder="Contoh: Benih sedang dikirim dari toko pertanian, estimasi tiba besok..."
                        className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-md hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Kirim Laporan Kesiapan ke Admin</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
