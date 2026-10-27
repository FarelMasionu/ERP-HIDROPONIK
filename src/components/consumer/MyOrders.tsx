'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/scmAlgorithms';
import {
  Package,
  Upload,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  AlertCircle,
  X
} from 'lucide-react';

export const MyOrders: React.FC = () => {
  const { orders, uploadPaymentProof } = useApp();
  const [uploadOrderId, setUploadOrderId] = useState<string | null>(null);
  const [proofUrlInput, setProofUrlInput] = useState('');

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadOrderId) return;
    const url = proofUrlInput || 'https://placehold.co/400x600/png?text=Bukti+Transfer+BCA+Lunas';
    uploadPaymentProof(uploadOrderId, url);
    setUploadOrderId(null);
    setProofUrlInput('');
  };

  const getStatusBadge = (status: typeof orders[0]['status']) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Menunggu Pembayaran
          </span>
        );
      case 'diproses':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
            Diproses (Verifikasi Admin)
          </span>
        );
      case 'dialokasikan':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
            Dialokasikan ke Kebun Mitra
          </span>
        );
      case 'dikirim':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            Dalam Pengiriman Kurir
          </span>
        );
      case 'selesai':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Selesai Diterima
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Pesanan Saya</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status verifikasi pembayaran, penjemputan kebun, dan nomor resi pengiriman.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum ada riwayat pesanan</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Pesanan yang Anda buat melalui katalog sayur akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors space-y-3.5 shadow-2xs"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">{order.orderDate}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {order.customerType}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items & Amount */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="md:col-span-2 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700">Rincian Komoditas:</div>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.type === 'ready' ? (
                              <span className="text-emerald-700 font-medium">Ready Stock (Kirim Langsung)</span>
                            ) : (
                              <span className="text-slate-600 font-medium">
                                Pre-Order Panen (Estimasi: {item.estimatedHarvestDate})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right font-mono tabular-nums">
                          <span className="font-semibold text-slate-800">{item.quantityKg} kg</span>
                          <span className="text-slate-400 mx-1">×</span>
                          <span className="text-slate-600">{formatRupiah(item.pricePerKg)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Actions */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col justify-between text-xs space-y-2.5">
                    <div>
                      <div className="text-slate-500">Total Tagihan:</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        {formatRupiah(order.totalAmount)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Tujuan: <span className="text-slate-700 font-medium">{order.customerAddress}</span>
                      </div>
                    </div>

                    {order.status === 'menunggu_pembayaran' && (
                      <button
                        onClick={() => setUploadOrderId(order.id)}
                        className="w-full py-1.5 px-3 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Bukti Transfer</span>
                      </button>
                    )}

                    {order.paymentProofUrl && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Bukti transfer terkirim & tersimpan</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fulfillment Origin Information */}
                {order.fulfillments && order.fulfillments.length > 0 && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs">
                    <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      <span>
                        Alokasi Kebun Mitra: {order.allocationType || 'Single-Fulfillment'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                      {order.fulfillments.map((ful, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{ful.gardenName}</div>
                            <div className="text-[10px] text-slate-500">{ful.memberName} · {ful.location}</div>
                          </div>
                          <div className="text-right font-mono tabular-nums font-bold text-slate-900">
                            {ful.allocatedKg} kg
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Proof Modal */}
      {uploadOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3.5 border border-slate-200">
            <div className="flex items-start justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Unggah Bukti Transfer</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Transfer ke BCA <strong className="text-slate-800">777-019-2831</strong> an. Al-Baroqah.
                </p>
              </div>
              <button
                onClick={() => setUploadOrderId(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProofSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Bukti Struk Transfer (atau biarkan kosong untuk demo)
                </label>
                <input
                  type="text"
                  value={proofUrlInput}
                  onChange={(e) => setProofUrlInput(e.target.value)}
                  placeholder="https://... atau biarkan kosong untuk simulasi otomatis"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                Setelah diunggah, admin akan memverifikasi dana dan menentukan alokasi mitra jemput kurir terbaik.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadOrderId(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Kirim Bukti Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
