'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  calculateAllocationStrategy,
  getPreorderCapacityInfo
} from '../../utils/scmAlgorithms';
import {
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Leaf,
  Layers,
  Check,
  UserCheck,
  Split,
  AlertCircle
} from 'lucide-react';

interface ConsumerStoreProps {
  onOpenCart: () => void;
}

export const ConsumerStore: React.FC<ConsumerStoreProps> = ({ onOpenCart }) => {
  const { products, batches, inventoryLots, members, addToCart } = useApp();
  const [storeTab, setStoreTab] = useState<'ready' | 'preorder'>('ready');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [preorderQtyMap, setPreorderQtyMap] = useState<Record<string, number>>({});

  const handleAddReady = (product: typeof products[0]) => {
    // Total ready stock available
    const availableLots = inventoryLots.filter(
      (l) => l.productId === product.id && l.currentQtyKg > 0 && (l.status === 'Fresh' || l.status === 'Good' || l.status === 'Expiring')
    );
    const totalKg = availableLots.reduce((acc, l) => acc + l.currentQtyKg, 0);
    if (totalKg <= 0) {
      setErrorNotice(`Stok ${product.name} saat ini sedang kosong di kebun mitra.`);
      setTimeout(() => setErrorNotice(null), 3500);
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      pricePerKg: product.pricePerKg,
      quantityKg: 1,
      type: 'ready'
    });

    setAddedNotice(`1 kg ${product.name} (Ready Stock) ditambahkan ke keranjang`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleAddPreorder = (
    product: typeof products[0],
    batch: typeof batches[0],
    qty: number
  ) => {
    // Validasi alokasi & kapasitas lubang tanam
    const allocResult = calculateAllocationStrategy({
      orderQty: qty,
      productId: product.id,
      type: 'preorder',
      inventoryLots,
      batch,
      members
    });

    if (!allocResult.isPossible) {
      setErrorNotice(allocResult.reason);
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      pricePerKg: product.pricePerKg,
      quantityKg: qty,
      type: 'preorder',
      batchId: batch.id,
      estimatedHarvestDate: batch.estimatedHarvestDate
    });

    const allocDesc =
      allocResult.allocationType === 'Single-Fulfillment'
        ? `dialokasikan ke 1 mitra (${allocResult.fulfillments[0]?.memberName})`
        : `dibagi ke ${allocResult.fulfillments.length} mitra binaan`;

    setAddedNotice(
      `${qty} kg ${product.name} (Pre-Order Panen ${batch.estimatedHarvestDate}) ditambahkan ke keranjang - ${allocDesc}`
    );
    setTimeout(() => setAddedNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Greenhouse Image */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 border border-slate-800 text-white min-h-[220px] flex items-center shadow-2xs">
        <img
          src="/src/assets/images/hero_hydroponic_greenhouse_1792232446358.jpg"
          alt="Greenhouse Hidroponik Al-Baroqah"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="relative max-w-2xl px-5 py-6 sm:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PANEN SEGAR LANGSUNG DARI KEBUN MITRA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
            Sayuran Hidroponik Berkualitas Tanpa Perantara Gudang
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Al-Baroqah menghubungkan konsumen dan katering langsung ke instalasi kebun petani binaan. Sayuran baru dipetik saat pesanan masuk, menjamin batas kesegaran 3 hari tetap prima.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bebas Pestisida Kimia Sintetis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Maksimal 3 Hari Sejak Petik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notifications */}
      {addedNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-3.5 py-2.5 rounded-md shadow-xl flex items-center gap-2 text-xs border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{addedNotice}</span>
          <button
            onClick={onOpenCart}
            className="ml-2 underline text-emerald-300 hover:text-white font-bold"
          >
            Lihat Keranjang
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-rose-900 text-white px-3.5 py-2.5 rounded-md shadow-xl flex items-center gap-2 text-xs border border-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          <span className="font-semibold">{errorNotice}</span>
          <button
            onClick={() => setErrorNotice(null)}
            className="ml-2 text-rose-200 hover:text-white font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Catalog Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Sayuran Hidroponik</h2>
            <p className="text-sm text-slate-600 mt-1">
              Pilih antara pengiriman cepat stok siap panen, atau amankan kuota panen mendatang.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border-2 border-slate-300 shadow-2xs text-xs shrink-0">
            <button
              onClick={() => setStoreTab('ready')}
              className={`px-3.5 py-2 font-bold text-sm rounded-md transition-colors ${
                storeTab === 'ready'
                  ? 'bg-white text-emerald-950 shadow-2xs border-2 border-emerald-500'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Ready Stock (Kirim Cepat)
            </button>
            <button
              onClick={() => setStoreTab('preorder')}
              className={`px-3.5 py-2 font-bold text-sm rounded-md transition-colors ${
                storeTab === 'preorder'
                  ? 'bg-white text-amber-950 shadow-2xs border-2 border-amber-500'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Pre-Order Panen (Kunci Kuota)
            </button>
          </div>
        </div>

        {/* Tab 1: Ready Stock Grid */}
        {storeTab === 'ready' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              // Agregasi stok segar yang tersedia di seluruh kebun mitra
              const availableLots = inventoryLots.filter(
                (l) =>
                  l.productId === product.id &&
                  l.currentQtyKg > 0 &&
                  (l.status === 'Fresh' || l.status === 'Good' || l.status === 'Expiring')
              );
              const totalStockKg = availableLots.reduce((acc, l) => acc + l.currentQtyKg, 0);

              // Cek jika ada lot yang masuk hari ke-3 (Segera Jual)
              const hasExpiringLot = availableLots.some((l) => l.status === 'Expiring');

              return (
                <div
                  key={`ready-prod-${product.id}`}
                  className="bg-white border-2 border-emerald-300 rounded-lg overflow-hidden flex flex-col hover:border-emerald-500 transition-colors shadow-2xs"
                >
                  <div className="aspect-4/3 relative bg-slate-100 border-b-2 border-emerald-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="text-xs font-bold bg-white/95 text-emerald-950 px-2 py-0.5 rounded border-2 border-emerald-300 shadow-2xs">
                        Siap Petik di Kebun
                      </span>
                      {hasExpiringLot && (
                        <span className="text-xs font-bold bg-amber-600 text-white px-2 py-0.5 rounded shadow-2xs border border-amber-700">
                          Segera Jual (Hari ke-3)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-slate-500 italic mb-0.5 font-semibold">{product.scientificName}</div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed font-normal">{product.description}</p>
                    </div>

                    <div className="pt-3 border-t-2 border-emerald-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-slate-500 font-bold uppercase">Harga Satuan</div>
                          <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                            {formatRupiah(product.pricePerKg)} <span className="text-xs font-normal text-slate-500">/ kg</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-bold uppercase">Stok Siap</div>
                          <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                            {totalStockKg} kg
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddReady(product)}
                        disabled={totalStockKg <= 0}
                        className={`w-full py-2 px-3 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs border-2 ${
                          totalStockKg > 0
                            ? 'bg-emerald-800 text-white hover:bg-emerald-900 border-emerald-900'
                            : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{totalStockKg > 0 ? '+ Keranjang Ready' : 'Habis di Kebun'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Pre-Order Panen Grid */}
        {storeTab === 'preorder' && (
          <div className="mt-4 space-y-4">
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 mb-0.5">Sistem Pemesanan Pre-Order Panen Terjadwal</div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Pemesanan pre-order diambil langsung dari kuota <strong>Batch Produksi aktif</strong> yang sedang berjalan di kebun mitra (wadah induk hasil gabungan peramalan). Sisa kuota yang tidak terpesan hingga hari panen otomatis dialihkan menjadi <strong>Ready Stock segar</strong> untuk pembeli harian. Pemenuhan pesanan diprioritaskan kepada <strong className="text-slate-900">1 orang mitra binaan (Single-Fulfillment)</strong>, atau <strong className="text-slate-900">Multi-Member Split</strong> jika kebutuhan melebihi kapasitas 1 kebun.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches
                .filter((b) => b.status === 'in_progress')
                .map((batch) => {
                  const product = products.find((p) => p.id === batch.productId);
                  if (!product) return null;

                  const capInfo = getPreorderCapacityInfo({ batch, members });
                  const currentQty = preorderQtyMap[batch.id] || 5;

                  const allocPreview = calculateAllocationStrategy({
                    orderQty: currentQty,
                    productId: product.id,
                    type: 'preorder',
                    inventoryLots,
                    batch,
                    members
                  });

                  const progressPct = Math.round(
                    (batch.preorderSoldKg / batch.totalTargetKg) * 100
                  );

                  return (
                    <div
                      key={`batch-card-${batch.id}`}
                      className="bg-white border border-slate-300 rounded-lg overflow-hidden flex flex-col hover:border-slate-400 transition-colors shadow-2xs"
                    >
                      <div className="aspect-16/9 relative bg-slate-100 border-b border-slate-300">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                          {batch.batchCode}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-white/95 px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs border border-slate-300 shadow-2xs">
                          <span className="text-slate-600 font-medium">Estimasi Panen:</span>
                          <span className="font-bold text-slate-900 font-mono">{batch.estimatedHarvestDate}</span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3.5">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                                {formatRupiah(product.pricePerKg)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">/kg</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 mb-2.5 font-medium">{batch.notes || 'Penanaman NFT sistemik'}</div>

                          {/* Progress Kuota Pre-Order */}
                          <div className="space-y-1 mb-2.5 bg-slate-50 p-2.5 rounded-md border border-slate-300 shadow-2xs">
                            <div className="flex justify-between text-[11px] font-mono tabular-nums">
                              <span className="text-slate-600 font-medium">Terkunci: {batch.preorderSoldKg} kg</span>
                              <span className="font-bold text-slate-900">Target: {batch.totalTargetKg} kg</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                              <div
                                className="bg-slate-800 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, progressPct)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                              <span className="text-slate-900 font-bold">
                                Sisa Kuota: {capInfo.remainingBatchQuota} kg
                              </span>
                              <span className="text-slate-600 font-medium">
                                Lubang Kosong: {capInfo.totalEmptyHoles}
                              </span>
                            </div>
                          </div>

                          {/* Selector Kuantitas Pesanan Pre-Order */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800">
                                Rencana Pre-Order:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreorderQtyMap((prev) => ({
                                      ...prev,
                                      [batch.id]: Math.max(1, currentQty - 5)
                                    }))
                                  }
                                  className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center text-xs font-bold shadow-2xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={capInfo.maxOrderableKg}
                                  value={currentQty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    setPreorderQtyMap((prev) => ({
                                      ...prev,
                                      [batch.id]: val
                                    }));
                                  }}
                                  className="w-14 py-0.5 text-xs border border-slate-300 rounded text-center font-mono tabular-nums font-bold bg-white"
                                />
                                <span className="text-xs text-slate-600 font-semibold">kg</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreorderQtyMap((prev) => ({
                                      ...prev,
                                      [batch.id]: Math.min(capInfo.maxOrderableKg, currentQty + 5)
                                    }))
                                  }
                                  className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center text-xs font-bold shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Preset Chips */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Cepat:</span>
                              {[5, 10, 20, 50].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() =>
                                    setPreorderQtyMap((prev) => ({
                                      ...prev,
                                      [batch.id]: preset
                                    }))
                                  }
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors shadow-2xs ${
                                    currentQty === preset
                                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-medium'
                                  }`}
                                >
                                  {preset} kg
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Evaluasi Alokasi Real-Time */}
                          <div className="mt-2.5">
                            {allocPreview.isPossible ? (
                              allocPreview.allocationType === 'Single-Fulfillment' ? (
                                <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-md text-[11px] text-emerald-950 space-y-0.5 shadow-2xs">
                                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Alokasi 1 Mitra Tunggal (Single)</span>
                                  </div>
                                  <p className="text-[10px] text-emerald-800 font-medium">
                                    Cukup dipenuhi oleh <strong>{allocPreview.fulfillments[0]?.memberName}</strong> ({allocPreview.fulfillments[0]?.gardenName}).
                                  </p>
                                </div>
                              ) : (
                                <div className="p-2 bg-slate-100 border border-slate-300 rounded-md text-[11px] text-slate-950 space-y-0.5 shadow-2xs">
                                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                                    <Split className="w-3.5 h-3.5 text-slate-700" />
                                    <span>Alokasi Dibagi ke {allocPreview.fulfillments.length} Mitra (Split)</span>
                                  </div>
                                  <p className="text-[10px] text-slate-700 font-medium">
                                    Dibagi ke: {allocPreview.fulfillments.map((f) => `${f.memberName} (${f.allocatedKg}kg)`).join(', ')}.
                                  </p>
                                </div>
                              )
                            ) : (
                              <div className="p-2 bg-rose-50 border border-rose-300 rounded-md text-[11px] text-rose-950 flex items-start gap-1.5 shadow-2xs">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block font-bold">Kapasitas Tanam Tidak Mencukupi!</strong>
                                  <span className="text-[10px] leading-tight font-medium">
                                    Pesanan {currentQty} kg melebihi kapasitas (Maks: {capInfo.maxOrderableKg} kg).
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total & Action Button */}
                        <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Nilai ({currentQty} kg)</div>
                            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                              {formatRupiah(product.pricePerKg * currentQty)}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddPreorder(product, batch, currentQty)}
                            disabled={!allocPreview.isPossible || currentQty <= 0}
                            className={`py-1.5 px-3 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors shadow-2xs border ${
                              allocPreview.isPossible && currentQty > 0
                                ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                                : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              {allocPreview.isPossible
                                ? `+ Pesan ${currentQty} kg`
                                : 'Kapasitas Tidak Cukup'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
