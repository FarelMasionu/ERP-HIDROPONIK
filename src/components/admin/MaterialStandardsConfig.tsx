import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialStandard } from '../../types';
import {
  Sliders,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  X,
  Sprout,
  Info
} from 'lucide-react';

export const MaterialStandardsConfig: React.FC = () => {
  const { materialStandards, updateMaterialStandard } = useApp();
  const [editingStandard, setEditingStandard] = useState<MaterialStandard | null>(null);
  const [formValues, setFormValues] = useState<{
    estimatedYieldPerHoleKg: number;
    seedUsagePerHole: number;
    seedUnit: string;
    rockwoolUsagePerHole: number;
    rockwoolUnit: string;
    nutrientUsagePerHole: number;
    nutrientUnit: string;
    isActive: boolean;
  }>({
    estimatedYieldPerHoleKg: 0.055,
    seedUsagePerHole: 1.2,
    seedUnit: 'butir',
    rockwoolUsagePerHole: 1.0,
    rockwoolUnit: 'kubus',
    nutrientUsagePerHole: 4.5,
    nutrientUnit: 'ml',
    isActive: true
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenEdit = (std: MaterialStandard) => {
    setEditingStandard(std);
    setFormValues({
      estimatedYieldPerHoleKg: std.estimatedYieldPerHoleKg,
      seedUsagePerHole: std.seedUsagePerHole,
      seedUnit: std.seedUnit,
      rockwoolUsagePerHole: std.rockwoolUsagePerHole,
      rockwoolUnit: std.rockwoolUnit,
      nutrientUsagePerHole: std.nutrientUsagePerHole,
      nutrientUnit: std.nutrientUnit,
      isActive: std.isActive
    });
    setErrorMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStandard) return;

    // Validasi Teknis
    if (formValues.estimatedYieldPerHoleKg <= 0) {
      setErrorMsg('Estimasi hasil panen per lubang tanam harus berupa angka positif lebih besar dari 0 (misal: 0.055 kg).');
      return;
    }
    if (formValues.seedUsagePerHole <= 0) {
      setErrorMsg('Standar penggunaan benih per lubang harus lebih besar dari 0 butir.');
      return;
    }
    if (formValues.rockwoolUsagePerHole <= 0) {
      setErrorMsg('Standar penggunaan media rockwool harus lebih besar dari 0 kubus.');
      return;
    }
    if (formValues.nutrientUsagePerHole <= 0) {
      setErrorMsg('Standar kebutuhan nutrisi AB Mix harus lebih besar dari 0 ml per lubang.');
      return;
    }

    const updated: MaterialStandard = {
      ...editingStandard,
      estimatedYieldPerHoleKg: formValues.estimatedYieldPerHoleKg,
      seedUsagePerHole: formValues.seedUsagePerHole,
      seedUnit: formValues.seedUnit,
      rockwoolUsagePerHole: formValues.rockwoolUsagePerHole,
      rockwoolUnit: formValues.rockwoolUnit,
      nutrientUsagePerHole: formValues.nutrientUsagePerHole,
      nutrientUnit: formValues.nutrientUnit,
      isActive: formValues.isActive
    };

    updateMaterialStandard(updated);
    setEditingStandard(null);
    setSuccessMsg(`Standar kebutuhan bahan baku untuk ${editingStandard.productName} berhasil diperbarui.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Informative Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-slate-100 rounded-md text-slate-800 border border-slate-200 shrink-0 mt-0.5">
            <Sliders className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Konfigurasi Standar Kebutuhan Bahan Baku per Varietas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar ini menjadi acuan otomatis bagi modul Perencanaan Kebutuhan Bahan (MRP). Perhitungan lubang: <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-[11px]">Target (kg) ÷ Hasil per Lubang (kg)</code>.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Standards Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3.5">Varietas Sayuran</th>
                <th className="py-2.5 px-3.5 text-center">Estimasi Hasil Panen</th>
                <th className="py-2.5 px-3.5 text-center">Standar Benih</th>
                <th className="py-2.5 px-3.5 text-center">Standar Rockwool</th>
                <th className="py-2.5 px-3.5 text-center">Standar Nutrisi AB Mix</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5">Terakhir Diperbarui</th>
                <th className="py-2.5 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {materialStandards.map((std) => {
                const holesPerKg = Math.round(1 / std.estimatedYieldPerHoleKg);

                return (
                  <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{std.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {std.productId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {std.estimatedYieldPerHoleKg} kg / lubang
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                        (~{holesPerKg} lubang / kg)
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {std.seedUsagePerHole} {std.seedUnit}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{std.seedBasis}</div>
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {std.rockwoolUsagePerHole} {std.rockwoolUnit}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{std.rockwoolBasis}</div>
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {std.nutrientUsagePerHole} {std.nutrientUnit}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        pekatan {std.nutrientBasis}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      {std.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="text-slate-700 font-mono tabular-nums text-[11px]">{std.updatedAt}</div>
                      <div className="text-[10px] text-slate-400">{std.updatedBy}</div>
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(std)}
                        className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
        <div className="font-semibold flex items-center gap-1.5 text-slate-900">
          <Info className="w-4 h-4 text-slate-600" />
          <span>Formula Matematis Estimasi Kebutuhan Bahan (Perencanaan MRP):</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          1. <strong>Estimasi Lubang Tanam:</strong> <code>Jumlah Lubang = ⌈Target Produksi (kg) ÷ Hasil per Lubang (kg)⌉</code><br />
          2. <strong>Estimasi Kebutuhan Bahan:</strong> <code>Kebutuhan = Jumlah Lubang × Standar Penggunaan Bahan per Lubang</code><br />
          3. <strong>Estimasi Kekurangan:</strong> <code>Maksimal(0, Kebutuhan - Stok yang Dilaporkan Anggota)</code>. Jika anggota belum melaporkan ketersediaan, kekurangan tidak dihitung (status <em>Belum Dikonfirmasi</em>).
        </p>
      </div>

      {/* Edit Standard Modal */}
      {editingStandard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 space-y-3.5 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ubah Standar Kebutuhan Bahan
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Varietas: <strong>{editingStandard.productName}</strong>
                </p>
              </div>
              <button
                onClick={() => setEditingStandard(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Hasil Panen per Lubang */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Estimasi Hasil Panen per Lubang Tanam (kg) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0.01"
                    required
                    value={formValues.estimatedYieldPerHoleKg}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        estimatedYieldPerHoleKg: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-28 p-1.5 border border-slate-300 rounded font-mono tabular-nums text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                  <span className="text-xs text-slate-600">kg / lubang tanam</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Setara dengan:{' '}
                  <strong className="text-slate-800">
                    ~
                    {formValues.estimatedYieldPerHoleKg > 0
                      ? Math.round(1 / formValues.estimatedYieldPerHoleKg)
                      : 0}{' '}
                    lubang per 1 kg sayur segar
                  </strong>
                </div>
              </div>

              {/* Standar Benih */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Standar Benih per Lubang *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={formValues.seedUsagePerHole}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        seedUsagePerHole: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-full p-1.5 border border-slate-300 rounded font-mono tabular-nums text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Satuan Benih
                  </label>
                  <input
                    type="text"
                    required
                    value={formValues.seedUnit}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, seedUnit: e.target.value }))
                    }
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                  />
                </div>
              </div>

              {/* Standar Rockwool */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Standar Rockwool per Lubang *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={formValues.rockwoolUsagePerHole}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        rockwoolUsagePerHole: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-full p-1.5 border border-slate-300 rounded font-mono tabular-nums text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Satuan Rockwool
                  </label>
                  <input
                    type="text"
                    required
                    value={formValues.rockwoolUnit}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, rockwoolUnit: e.target.value }))
                    }
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                  />
                </div>
              </div>

              {/* Standar Nutrisi AB Mix */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Standar Nutrisi AB Mix per Lubang *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={formValues.nutrientUsagePerHole}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        nutrientUsagePerHole: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-full p-1.5 border border-slate-300 rounded font-mono tabular-nums text-xs bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Satuan Nutrisi
                  </label>
                  <input
                    type="text"
                    required
                    value={formValues.nutrientUnit}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, nutrientUnit: e.target.value }))
                    }
                    className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formValues.isActive}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded text-slate-900 focus:ring-slate-500 border-slate-300"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-700">
                  Gunakan standar ini sebagai acuan aktif perhitungan rencana kebutuhan
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStandard(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Standar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
