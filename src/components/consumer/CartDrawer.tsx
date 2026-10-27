'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  calculateAllocationStrategy,
  getPreorderCapacityInfo
} from '../../utils/scmAlgorithms';
import {
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Split,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOrder: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onSuccessOrder }) => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    checkoutOrder,
    batches,
    members,
    inventoryLots
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('Restoran Hijau Sejahtera');
  const [customerPhone, setCustomerPhone] = useState('0812-9988-3344');
  const [customerEmail, setCustomerEmail] = useState('procurement@restoranhijau.id');
  const [customerAddress, setCustomerAddress] = useState('Jl. Dago Asri No. 18, Coblong, Kota Bandung');
  const [customerType, setCustomerType] = useState<'Retail' | 'B2B/Katering'>('B2B/Katering');
  const [notes, setNotes] = useState('Harap sayuran dipotong pagi hari dan dikemas daun utuh.');

  if (!isOpen) return null;

  const readyItems = cart.filter((i) => i.type === 'ready');
  const preorderItems = cart.filter((i) => i.type === 'preorder');
  const totalAmount = cart.reduce((acc, i) => acc + i.quantityKg * i.pricePerKg, 0);

  // Evaluasi alokasi & kapasitas lubang tanam tiap item preorder
  const preorderAllocations = preorderItems.map((item) => {
    const batch = item.batchId ? batches.find((b) => b.id === item.batchId) : undefined;
    const alloc = calculateAllocationStrategy({
      orderQty: item.quantityKg,
      productId: item.productId,
      type: 'preorder',
      inventoryLots,
      batch,
      members
    });
    const capInfo = getPreorderCapacityInfo({ batch, members });
    return {
      item,
      alloc,
      capInfo
    };
  });

  const hasInvalidPreorder = preorderAllocations.some((p) => !p.alloc.isPossible);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!customerName || !customerPhone || !customerAddress) {
      setFormError('Silakan lengkapi data pemesan dan alamat pengiriman.');
      return;
    }

    if (hasInvalidPreorder) {
      setFormError('Terdapat item pre-order yang melebihi kapasitas lubang tanam / kuota tersedia. Harap sesuaikan jumlah pesanan terlebih dahulu.');
      return;
    }

    const order = checkoutOrder({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: customerAddress,
      customerType,
      notes
    });

    setCreatedOrderId(order.id);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-300 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900">
              {step === 'cart' && 'Keranjang Pesanan Panen'}
              {step === 'checkout' && 'Formulir Pemesanan & Alamat'}
              {step === 'success' && 'Pesanan Berhasil Dibuat'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-500 border border-slate-300 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Keranjang masih kosong</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Silakan pilih sayuran segar Ready Stock atau slot Pre-Order panen dari katalog.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Ready Stock Items */}
                    {readyItems.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                            Ready Stock (Kirim Cepat dari Kebun)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">Masa simpan 3 hari</span>
                        </div>
                        <div className="divide-y divide-slate-200 border border-slate-300 rounded-md overflow-hidden shadow-2xs">
                          {readyItems.map((item) => (
                            <div key={`ready-${item.productId}`} className="p-3 flex items-center justify-between gap-3 bg-white">
                              <div className="flex-1">
                                <div className="text-xs font-bold text-slate-900">{item.productName}</div>
                                <div className="text-[11px] text-slate-600 font-mono tabular-nums font-medium">{formatRupiah(item.pricePerKg)} / kg</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantityKg}
                                  onChange={(e) => updateCartQty(item.productId, 'ready', parseInt(e.target.value) || 1)}
                                  className="w-14 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-mono tabular-nums font-bold text-center focus:outline-none focus:ring-1 focus:ring-slate-500 text-slate-900"
                                />
                                <span className="text-xs text-slate-600 font-medium">kg</span>
                                <button
                                  onClick={() => removeFromCart(item.productId, 'ready')}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pre-Order Items */}
                    {preorderItems.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                            Pre-Order Panen (Kunci Kuota Batch)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">Jadwal panen tertera</span>
                        </div>
                        <div className="divide-y divide-slate-200 border border-slate-300 rounded-md overflow-hidden shadow-2xs">
                          {preorderItems.map((item) => {
                            const allocData = preorderAllocations.find(
                              (p) => p.item.productId === item.productId && p.item.type === 'preorder'
                            );
                            const alloc = allocData?.alloc;
                            const capInfo = allocData?.capInfo;

                            return (
                              <div key={`po-${item.productId}`} className="p-3 space-y-2 bg-white">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-900">{item.productName}</div>
                                    <div className="text-[11px] text-slate-700 font-mono font-medium">
                                      Estimasi Panen: <strong className="text-slate-900">{item.estimatedHarvestDate || 'Akhir Siklus'}</strong>
                                    </div>
                                    <div className="text-[11px] text-slate-600 font-mono tabular-nums font-medium">{formatRupiah(item.pricePerKg)} / kg</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="1"
                                      max={capInfo?.maxOrderableKg}
                                      value={item.quantityKg}
                                      onChange={(e) =>
                                        updateCartQty(
                                          item.productId,
                                          'preorder',
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      className="w-14 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-mono tabular-nums font-bold text-center focus:outline-none focus:ring-1 focus:ring-slate-500 text-slate-900"
                                    />
                                    <span className="text-xs text-slate-600 font-medium">kg</span>
                                    <button
                                      onClick={() => removeFromCart(item.productId, 'preorder')}
                                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Status Alokasi */}
                                {alloc && (
                                  <div>
                                    {alloc.isPossible ? (
                                      alloc.allocationType === 'Single-Fulfillment' ? (
                                        <div className="p-1.5 bg-emerald-50 border border-emerald-300 rounded text-[10px] text-emerald-950 flex items-center gap-1.5 font-semibold">
                                          <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                          <span>
                                            Alokasi 1 Mitra: <strong>{alloc.fulfillments[0]?.memberName}</strong> ({alloc.fulfillments[0]?.gardenName})
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="p-1.5 bg-slate-100 border border-slate-300 rounded text-[10px] text-slate-900 flex items-center gap-1.5 font-semibold">
                                          <Split className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                          <span>
                                            Alokasi Dibagi ke {alloc.fulfillments.length} Mitra ({alloc.fulfillments.map((f) => `${f.memberName} ${f.allocatedKg}kg`).join(', ')})
                                          </span>
                                        </div>
                                      )
                                    ) : (
                                      <div className="p-1.5 bg-rose-50 border border-rose-300 rounded text-[10px] text-rose-950 flex items-center gap-1.5 font-bold">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                                        <span>
                                          Melebihi kapasitas lubang tanam & kuota (Maks: {capInfo?.maxOrderableKg} kg)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Information Note */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-700 space-y-1 shadow-2xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        Jaminan Kualitas Rantai Pasok Segar
                      </div>
                      <p className="leading-relaxed font-medium">
                        Sayuran hidroponik langsung dipetik dari instalasi kebun mitra terdekat saat pesanan dialokasikan. Tanpa gudang pendingin perantara.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-md text-xs text-rose-900 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Jenis Pelanggan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerType('Retail')}
                      className={`py-1.5 text-xs font-bold rounded-md border text-center transition-colors shadow-2xs ${
                        customerType === 'Retail'
                          ? 'bg-slate-100 border-slate-400 text-slate-900'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Retail / Rumah Tangga
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerType('B2B/Katering')}
                      className={`py-1.5 text-xs font-bold rounded-md border text-center transition-colors shadow-2xs ${
                        customerType === 'B2B/Katering'
                          ? 'bg-slate-100 border-slate-400 text-slate-900'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      B2B / Katering / Resto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nama Pemesan / Bisnis *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
                    placeholder="Contoh: Bu Ratna / Restoran Hijau"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Konfirmasi
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
                    placeholder="email@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
                    placeholder="Jalan, No Rumah/Gedung, Kecamatan, Kota"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Catatan Khusus Pengiriman
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
                    placeholder="Contoh: Harap dipetik pagi hari, kirim jam 10"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Konfirmasi Buat Pesanan
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center py-6 space-y-3.5">
                <div className="w-12 h-12 bg-slate-100 text-slate-800 border border-slate-300 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pesanan Berhasil Didaftarkan!</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Pesanan Anda masuk ke sistem ERP dengan status <strong>Menunggu Pembayaran</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-300 rounded-md p-3.5 text-left text-xs space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900">Petunjuk Pembayaran Transfer:</div>
                  <div className="text-slate-700 space-y-0.5 font-medium">
                    <div>Bank: <strong>BCA</strong></div>
                    <div>No. Rekening: <span className="font-mono tabular-nums font-bold text-slate-900">777-019-2831</span></div>
                    <div>Atas Nama: <strong>Koperasi Tani Al-Baroqah Hidroponik</strong></div>
                    <div className="pt-1.5 text-slate-900 font-bold font-mono tabular-nums">
                      Total Transfer: {formatRupiah(totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  Setelah transfer, Anda dapat mengunggah bukti bayar di tab <strong>Pesanan Saya</strong> untuk diverifikasi admin.
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSuccessOrder(createdOrderId);
                      onClose();
                      setStep('cart');
                    }}
                    className="w-full py-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Buka Halaman Pesanan Saya
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer for Cart Step */}
          {step === 'cart' && cart.length > 0 && (
            <div className="p-4 border-t border-slate-300 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">Total Pembayaran:</span>
                <span className="font-bold text-sm text-slate-900 font-mono tabular-nums">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
              {hasInvalidPreorder && (
                <div className="p-2 bg-rose-50 border border-rose-300 text-rose-950 text-[10px] rounded-md flex items-center gap-1.5 font-bold shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                  <span>Kuantitas pre-order melebihi kapasitas lubang tanam/kuota. Harap kurangi kuantitas untuk melanjutkan.</span>
                </div>
              )}
              <button
                disabled={hasInvalidPreorder}
                onClick={() => setStep('checkout')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-2 shadow-2xs ${
                  !hasInvalidPreorder
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <span>
                  {hasInvalidPreorder
                    ? 'Kapasitas Pre-Order Tidak Cukup'
                    : 'Lanjut ke Formulir Checkout'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
