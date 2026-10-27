import React, { useState } from 'react';
import { MaterialPlan, PlantingReadinessStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Layers,
  Sprout,
  Save,
  PhoneCall,
  Info
} from 'lucide-react';

interface MaterialPlanningDetailModalProps {
  plan: MaterialPlan;
  onClose: () => void;
}

export const MaterialPlanningDetailModal: React.FC<MaterialPlanningDetailModalProps> = ({
  plan,
  onClose
}) => {
  const { confirmMemberMaterialStock } = useApp();

  const [isEditingAdminInput, setIsEditingAdminInput] = useState(false);
  const [seedInput, setSeedInput] = useState<number | ''>(
    plan.items.find((i) => i.materialType === 'seed')?.confirmedStockQty ?? ''
  );
  const [rockwoolInput, setRockwoolInput] = useState<number | ''>(
    plan.items.find((i) => i.materialType === 'rockwool')?.confirmedStockQty ?? ''
  );
  const [nutrientInput, setNutrientInput] = useState<number | ''>(
    plan.items.find((i) => i.materialType === 'nutrient')?.confirmedStockQty ?? ''
  );
  const [readinessSelect, setReadinessSelect] = useState<PlantingReadinessStatus>(
    plan.plantingReadiness
  );
  const [notesInput, setNotesInput] = useState(plan.readinessNotes || '');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    confirmMemberMaterialStock(
      plan.id,
      {
        seed: seedInput === '' ? undefined : Number(seedInput),
        rockwool: rockwoolInput === '' ? undefined : Number(rockwoolInput),
        nutrient: nutrientInput === '' ? undefined : Number(nutrientInput)
      },
      readinessSelect,
      notesInput
    );

    setSuccessNotice('Konfirmasi ketersediaan bahan & status kesiapan berhasil disimpan.');
    setIsEditingAdminInput(false);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const getReadinessBadge = (status: PlantingReadinessStatus) => {
    switch (status) {
      case 'siap_tanam':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Siap Tanam</span>
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
            <span>Menunggu Konfirmasi Petani</span>
          </span>
        );
      case 'menolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Menolak Alokasi Batch</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                {plan.id}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {plan.batchCode}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Rincian Kebutuhan Bahan & Konfirmasi Mitra
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {plan.productName} · Kebun {plan.gardenName} ({plan.memberName})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Target and Hole Requirement Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <div className="text-slate-500">Target Produksi Alokasi:</div>
            <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {plan.targetKg} kg
            </div>
          </div>
          <div>
            <div className="text-slate-500">Estimasi Kebutuhan Lubang:</div>
            <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{plan.estimatedHoles.toLocaleString('id-ID')} lubang</span>
            </div>
          </div>
          <div>
            <div className="text-slate-500">Status Kesiapan Tanam:</div>
            <div className="mt-1">{getReadinessBadge(plan.plantingReadiness)}</div>
          </div>
        </div>

        {/* 4-Column Requirements Breakdown Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tabel Kebutuhan vs Stok Dilaporkan vs Kekurangan
            </h3>
            <span className="text-[11px] text-slate-400">Pengadaan mandiri oleh mitra</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2 px-3">Jenis Bahan Tanam</th>
                  <th className="py-2 px-3 text-center">Standar Kebutuhan</th>
                  <th className="py-2 px-3 text-center">Stok Dilaporkan</th>
                  <th className="py-2 px-3 text-center">Estimasi Kekurangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                {plan.items.map((item, idx) => {
                  const isConfirmed = item.confirmedStockQty !== null;
                  const hasShortage = isConfirmed && (item.shortageQty ?? 0) > 0;
                  const isFulfilled = isConfirmed && item.shortageQty === 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.materialName}</div>
                        <div className="text-[10px] text-slate-400 capitalize font-mono">
                          Tipe: {item.materialType}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {item.requiredQty.toLocaleString('id-ID')}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">{item.unit}</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {isConfirmed ? (
                          <span className="font-mono tabular-nums font-semibold text-slate-800">
                            {item.confirmedStockQty?.toLocaleString('id-ID')}{' '}
                            <span className="text-[11px] text-slate-500">{item.unit}</span>
                          </span>
                        ) : (
                          <span className="italic text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Belum dikonfirmasi
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {!isConfirmed ? (
                          <span className="text-slate-400 text-[11px]">-</span>
                        ) : isFulfilled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Cukup (0 {item.unit})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Kurang {item.shortageQty?.toLocaleString('id-ID')} {item.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Farmer Confirmation & Notes Section */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Status Konfirmasi Petani:</span>
            <span className="text-slate-500 font-mono tabular-nums text-[11px]">
              {plan.confirmedAt ? `Dikonfirmasi: ${plan.confirmedAt}` : 'Belum ada konfirmasi'}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-slate-500">Catatan dari Anggota:</div>
            <div className="mt-1 p-2 bg-white border border-slate-200 rounded text-slate-800 italic">
              {plan.readinessNotes || 'Tidak ada catatan khusus dari anggota.'}
            </div>
          </div>
        </div>

        {/* Admin Input / Verbal Confirmation Section */}
        {!isEditingAdminInput ? (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsEditingAdminInput(true)}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1.5 p-2 rounded-md hover:bg-slate-100 border border-slate-300 transition-colors bg-white shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
              <span>Input Konfirmasi Manual (Telepon / Chat Petani)</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleAdminSubmit}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-700" />
                <span>Form Input Konfirmasi Manual oleh Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingAdminInput(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Stok Benih (butir)
                </label>
                <input
                  type="number"
                  min="0"
                  value={seedInput}
                  onChange={(e) =>
                    setSeedInput(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                  }
                  placeholder="Stok benih..."
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Stok Rockwool (kubus)
                </label>
                <input
                  type="number"
                  min="0"
                  value={rockwoolInput}
                  onChange={(e) =>
                    setRockwoolInput(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                  }
                  placeholder="Stok rockwool..."
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Stok Nutrisi AB Mix (ml)
                </label>
                <input
                  type="number"
                  min="0"
                  value={nutrientInput}
                  onChange={(e) =>
                    setNutrientInput(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                  }
                  placeholder="Stok ml nutrisi..."
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status Kesiapan Tanam *
                </label>
                <select
                  value={readinessSelect}
                  onChange={(e) =>
                    setReadinessSelect(e.target.value as PlantingReadinessStatus)
                  }
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="siap_tanam">Siap Tanam (Stok Mencukupi)</option>
                  <option value="belum_siap">Belum Siap (Kekurangan Bahan)</option>
                  <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
                  <option value="menolak">Menolak Alokasi Batch</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Catatan Keterangan
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Keterangan dari pembicaraan..."
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditingAdminInput(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Konfirmasi</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
