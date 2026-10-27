import React, { useState } from 'react';
import { calculateNutrientABMix } from '../../utils/scmAlgorithms';
import {
  Droplets,
  Thermometer,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';

interface AgronomyGuideModalProps {
  onClose: () => void;
}

export const AgronomyGuideModal: React.FC<AgronomyGuideModalProps> = ({ onClose }) => {
  const [tankLiters, setTankLiters] = useState<number>(500);
  const [targetEc, setTargetEc] = useState<number>(1.8);
  const [selectedCrop, setSelectedCrop] = useState<string>('pakcoy');

  const nutrientResult = calculateNutrientABMix(tankLiters, targetEc);

  const cropGuidelines: {
    [key: string]: {
      name: string;
      ecRange: string;
      phRange: string;
      defaultEc: number;
      tempMax: string;
      notes: string;
    };
  } = {
    pakcoy: {
      name: 'Pakcoy Shinta Super',
      ecRange: '1.8 – 2.2 mS/cm',
      phRange: '5.8 – 6.4',
      defaultEc: 2.0,
      tempMax: '24 – 27 °C',
      notes: 'Pemberian nutrisi bertahap: EC 1.2 pada minggu pertama, lalu naikkan ke 2.0 saat fase pembesaran talang.'
    },
    romaine: {
      name: 'Selada Romaine Paris Island',
      ecRange: '1.5 – 1.9 mS/cm',
      phRange: '5.5 – 6.2',
      defaultEc: 1.7,
      tempMax: '21 – 25 °C',
      notes: 'Sensitif terhadap tipburn (ujung daun gosong). Jaga sirkulasi angin malam hari dan hindari EC terlalu tinggi (>2.0).'
    },
    kangkung: {
      name: 'Kangkung Hidroponik Daun Lebar',
      ecRange: '1.4 – 1.8 mS/cm',
      phRange: '6.0 – 6.8',
      defaultEc: 1.6,
      tempMax: '25 – 30 °C',
      notes: 'Tahan panas dan rakus air. Pastikan aliran air NFT lancar agar batang renyah dan tidak berserat liat.'
    },
    bayam: {
      name: 'Bayam Merah Mira Hidroponik',
      ecRange: '1.8 – 2.4 mS/cm',
      phRange: '6.0 – 6.5',
      defaultEc: 2.1,
      tempMax: '24 – 28 °C',
      notes: 'Memerlukan intensitas cahaya matahari penuh agar pigmen antosianin merah marun terbentuk pekat alami.'
    }
  };

  const handleCropChange = (cropKey: string) => {
    setSelectedCrop(cropKey);
    setTargetEc(cropGuidelines[cropKey].defaultEc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 border border-slate-300">
        {/* Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-mono">
                Toolkit Agronomi Petani Mitra
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              Kalkulator Takaran Nutrisi AB Mix & Standar Operasional (SOP)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Variety Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Pilih Varietas Tanaman
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(cropGuidelines).map(([key, data]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCropChange(key)}
                className={`p-2 rounded-md border text-xs text-left transition-colors ${
                  selectedCrop === key
                    ? 'bg-slate-100 border-slate-400 text-slate-900 font-bold shadow-2xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div>{data.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-500 font-mono font-medium">{data.ecRange}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Inputs */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-300 space-y-2.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-slate-700" />
            <span>Kalkulator Larutan Tandon Air</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Volume Tandon Air (Liter)</label>
              <input
                type="number"
                min="50"
                step="50"
                value={tankLiters}
                onChange={(e) => setTankLiters(parseInt(e.target.value) || 0)}
                className="w-full p-1.5 border border-slate-300 rounded-md font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Target EC Nutrisi (mS/cm)</label>
              <input
                type="number"
                min="1.0"
                max="3.0"
                step="0.1"
                value={targetEc}
                onChange={(e) => setTargetEc(parseFloat(e.target.value) || 0)}
                className="w-full p-1.5 border border-slate-300 rounded-md font-mono tabular-nums bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-300">
            <div className="p-2.5 bg-white border border-slate-300 rounded-md shadow-2xs">
              <div className="text-[10px] text-slate-600 font-medium">Pekatan Nutrisi A:</div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {nutrientResult.pekatAMl.toLocaleString('id-ID')} ml
              </div>
            </div>
            <div className="p-2.5 bg-white border border-slate-300 rounded-md shadow-2xs">
              <div className="text-[10px] text-slate-600 font-medium">Pekatan Nutrisi B:</div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {nutrientResult.pekatBMl.toLocaleString('id-ID')} ml
              </div>
            </div>
          </div>
        </div>

        {/* Crop Guidelines Details */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-900">
            Rekomendasi Parameter: {cropGuidelines[selectedCrop].name}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-slate-50 border border-slate-300 rounded-md shadow-2xs">
              <div className="text-[10px] text-slate-600 font-medium">Rentang EC:</div>
              <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                {cropGuidelines[selectedCrop].ecRange}
              </div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-300 rounded-md shadow-2xs">
              <div className="text-[10px] text-slate-600 font-medium">Rentang pH:</div>
              <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                {cropGuidelines[selectedCrop].phRange}
              </div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-300 rounded-md shadow-2xs">
              <div className="text-[10px] text-slate-600 font-medium">Suhu Air Tandon:</div>
              <div className="font-mono tabular-nums font-bold text-slate-900 mt-0.5">
                {cropGuidelines[selectedCrop].tempMax}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-md text-[11px] text-slate-700 leading-relaxed font-medium shadow-2xs">
            <strong className="text-slate-900 font-bold">Catatan Agronomis:</strong> {cropGuidelines[selectedCrop].notes}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-300">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
