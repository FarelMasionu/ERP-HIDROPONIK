'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  calculateAllocationStrategy,
  getFreshnessInfo
} from '../../utils/scmAlgorithms';
import { Order, OrderStatus, FulfillmentAllocation, InventoryLot } from '../../types';
import { DispatchManifestModal } from './DispatchManifestModal';
import {
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  Split,
  UserCheck,
  Building,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  X,
  MapPin,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const SalesDistribution: React.FC = () => {
  const {
    orders,
    members,
    inventoryLots,
    batches,
    verifyPayment,
    allocateOrder,
    updateOrderStatus
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrderForAllocation, setSelectedOrderForAllocation] = useState<Order | null>(null);
  const [selectedOrderForManifest, setSelectedOrderForManifest] = useState<Order | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  // Dynamic FIFO Allocation Modal States
  const [allocationStrategyMode, setAllocationStrategyMode] = useState<
    'strict_fifo' | 'single_best_fit' | 'custom'
  >('strict_fifo');
  const [customLotAllocations, setCustomLotAllocations] = useState<Record<string, number>>({});
  const [customPreorderAllocations, setCustomPreorderAllocations] = useState<Record<string, number>>({});

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const memberMap = useMemo(() => {
    const map = new Map<string, (typeof members)[0]>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // When selected order changes, reset allocation states
  useEffect(() => {
    if (selectedOrderForAllocation) {
      setAllocationStrategyMode('strict_fifo');
      setCustomLotAllocations({});
      setCustomPreorderAllocations({});
    }
  }, [selectedOrderForAllocation]);

  // Available lots for the selected order (sorted strictly by harvestDate ASC = FIFO)
  const currentOrderItem = selectedOrderForAllocation?.items[0];
  const orderTargetKg = currentOrderItem?.quantityKg || 0;
  const isReadyOrder = currentOrderItem?.type === 'ready';

  const eligibleLotsForOrder = useMemo(() => {
    if (!selectedOrderForAllocation || !currentOrderItem || !isReadyOrder) return [];
    return inventoryLots
      .filter(
        (l) =>
          l.productId === currentOrderItem.productId &&
          l.currentQtyKg > 0 &&
          (l.status === 'Fresh' || l.status === 'Good' || l.status === 'Expiring')
      )
      .sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
  }, [selectedOrderForAllocation, currentOrderItem, isReadyOrder, inventoryLots]);

  // Candidate 1: Strict FIFO Recommendation (Panen Terlama Dihabiskan Duluan)
  const strictFifoPreview = useMemo(() => {
    if (!selectedOrderForAllocation || !currentOrderItem || !isReadyOrder) return null;

    let remainingNeeded = orderTargetKg;
    const fulfillments: FulfillmentAllocation[] = [];

    for (const lot of eligibleLotsForOrder) {
      if (remainingNeeded <= 0) break;
      const take = Math.min(remainingNeeded, lot.currentQtyKg);
      const member = memberMap.get(lot.memberId);

      const existing = fulfillments.find((f) => f.memberId === lot.memberId);
      if (existing) {
        existing.allocatedKg += take;
      } else {
        fulfillments.push({
          memberId: lot.memberId,
          memberName: member?.name || 'Mitra',
          gardenName: member?.gardenName || 'Kebun Mitra',
          location: member?.location || 'Bandung',
          allocatedKg: take,
          lotId: lot.id,
          pickupTimeWindow: 'Hari ini, 13:00 - 15:00 WIB'
        });
      }
      remainingNeeded -= take;
    }

    const isPossible = remainingNeeded === 0;
    const allocationType: 'Single-Fulfillment' | 'Multi-Member Split' =
      fulfillments.length === 1 ? 'Single-Fulfillment' : 'Multi-Member Split';

    return {
      isPossible,
      allocationType,
      fulfillments,
      shortageKg: remainingNeeded,
      title: 'Rekomendasi 1: Strict FIFO (Prioritas Usia Simpan)',
      badge: 'Minimalkan Susut Sayur',
      description: `Mengalokasikan lot panen tertua terlebih dahulu (${eligibleLotsForOrder[0]?.harvestDate || '-'}) untuk menekan risiko sayuran layu melewati batas 3 hari.`
    };
  }, [selectedOrderForAllocation, currentOrderItem, isReadyOrder, eligibleLotsForOrder, orderTargetKg, memberMap]);

  // Candidate 2: Single-Fulfillment Best-Fit Recommendation (Efisiensi 1 Titik Kurir)
  const singleBestFitPreview = useMemo(() => {
    if (!selectedOrderForAllocation || !currentOrderItem) return null;

    const targetBatch = currentOrderItem.batchId
      ? batches.find((b) => b.id === currentOrderItem.batchId)
      : undefined;

    return calculateAllocationStrategy({
      orderQty: orderTargetKg,
      productId: currentOrderItem.productId,
      type: currentOrderItem.type,
      inventoryLots,
      batch: targetBatch,
      members
    });
  }, [selectedOrderForAllocation, currentOrderItem, orderTargetKg, inventoryLots, batches, members]);

  // Custom Fulfillments computed from user's manual inputs
  const customFulfillments = useMemo<FulfillmentAllocation[]>(() => {
    if (!selectedOrderForAllocation || !currentOrderItem) return [];

    if (isReadyOrder) {
      const fuls: FulfillmentAllocation[] = [];
      Object.entries(customLotAllocations).forEach(([lotId, qty]) => {
        if (qty > 0) {
          const lot = eligibleLotsForOrder.find((l) => l.id === lotId);
          if (lot) {
            const member = memberMap.get(lot.memberId);
            const existing = fuls.find((f) => f.memberId === lot.memberId);
            if (existing) {
              existing.allocatedKg += qty;
            } else {
              fuls.push({
                memberId: lot.memberId,
                memberName: member?.name || 'Mitra',
                gardenName: member?.gardenName || 'Kebun Mitra',
                location: member?.location || 'Bandung',
                allocatedKg: qty,
                lotId: lot.id,
                pickupTimeWindow: 'Hari ini, 13:00 - 15:00 WIB'
              });
            }
          }
        }
      });
      return fuls;
    } else {
      // Pre-order custom
      const fuls: FulfillmentAllocation[] = [];
      Object.entries(customPreorderAllocations).forEach(([memberId, qty]) => {
        if (qty > 0) {
          const member = memberMap.get(memberId);
          fuls.push({
            memberId,
            memberName: member?.name || 'Mitra',
            gardenName: member?.gardenName || 'Kebun Mitra',
            location: member?.location || 'Bandung',
            allocatedKg: qty,
            pickupTimeWindow: `Estimasi Panen: ${currentOrderItem.estimatedHarvestDate || 'Akhir Siklus'}`
          });
        }
      });
      return fuls;
    }
  }, [
    selectedOrderForAllocation,
    currentOrderItem,
    isReadyOrder,
    customLotAllocations,
    customPreorderAllocations,
    eligibleLotsForOrder,
    memberMap
  ]);

  const totalCustomAllocatedKg = useMemo(() => {
    return customFulfillments.reduce((acc, f) => acc + f.allocatedKg, 0);
  }, [customFulfillments]);

  // Auto-fill custom allocations following FIFO
  const handleAutoFillCustomFifo = () => {
    if (!isReadyOrder) return;
    let remaining = orderTargetKg;
    const newAlloc: Record<string, number> = {};
    for (const lot of eligibleLotsForOrder) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, lot.currentQtyKg);
      newAlloc[lot.id] = take;
      remaining -= take;
    }
    setCustomLotAllocations(newAlloc);
  };

  // Determine active preview based on selected strategy mode
  const activeFulfillmentPlan = useMemo(() => {
    if (allocationStrategyMode === 'strict_fifo' && strictFifoPreview) {
      return {
        isPossible: strictFifoPreview.isPossible,
        allocationType: strictFifoPreview.allocationType,
        fulfillments: strictFifoPreview.fulfillments,
        reason: strictFifoPreview.description
      };
    }
    if (allocationStrategyMode === 'single_best_fit' && singleBestFitPreview) {
      return {
        isPossible: singleBestFitPreview.isPossible,
        allocationType: singleBestFitPreview.allocationType,
        fulfillments: singleBestFitPreview.fulfillments,
        reason: singleBestFitPreview.reason
      };
    }
    if (allocationStrategyMode === 'custom') {
      const diff = orderTargetKg - totalCustomAllocatedKg;
      const isExact = diff === 0 && orderTargetKg > 0;
      const type: 'Single-Fulfillment' | 'Multi-Member Split' =
        customFulfillments.length === 1 ? 'Single-Fulfillment' : 'Multi-Member Split';
      return {
        isPossible: isExact,
        allocationType: type,
        fulfillments: customFulfillments,
        reason: isExact
          ? `Alokasi Kustom Mandiri Admin: ${customFulfillments.length} titik kebun telah diverifikasi sesuai total pesanan ${orderTargetKg} kg.`
          : diff > 0
          ? `Kuantitas alokasi masih kurang ${diff} kg dari total pesanan ${orderTargetKg} kg.`
          : `Kuantitas alokasi berlebih ${Math.abs(diff)} kg melebihi pesanan ${orderTargetKg} kg.`
      };
    }
    return null;
  }, [
    allocationStrategyMode,
    strictFifoPreview,
    singleBestFitPreview,
    orderTargetKg,
    totalCustomAllocatedKg,
    customFulfillments
  ]);

  // Execute Allocation Verification
  const handleConfirmAllocation = () => {
    if (
      !selectedOrderForAllocation ||
      !activeFulfillmentPlan ||
      !activeFulfillmentPlan.isPossible ||
      activeFulfillmentPlan.fulfillments.length === 0
    ) {
      return;
    }

    allocateOrder(
      selectedOrderForAllocation.id,
      activeFulfillmentPlan.allocationType,
      activeFulfillmentPlan.fulfillments
    );

    setSelectedOrderForAllocation(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Menunggu Bayar
          </span>
        );
      case 'diproses':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-sky-50 text-sky-800 border border-sky-200">
            Diproses
          </span>
        );
      case 'dialokasikan':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800 border border-slate-300">
            Dialokasikan
          </span>
        );
      case 'dikirim':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-800 border border-blue-200">
            Dikirim
          </span>
        );
      case 'selesai':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            Selesai (Bagi Hasil Sah)
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-800 border border-rose-200">
            Batal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Manajemen Penjualan & Distribusi Pesanan
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Verifikasi pembayaran, rekomendasi cerdas alokasi FIFO vs Best-Fit, serta rute penjemputan kurir ke kebun mitra.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs overflow-x-auto self-start sm:self-auto border border-slate-300 shadow-2xs">
          {['all', 'menunggu_pembayaran', 'diproses', 'dialokasikan', 'dikirim', 'selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md font-semibold capitalize transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {st === 'all' ? 'Semua' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3.5">No. Pesanan</th>
                <th className="py-2.5 px-3.5">Pelanggan</th>
                <th className="py-2.5 px-3.5">Komoditas & Qty</th>
                <th className="py-2.5 px-3.5 text-right">Total Nilai</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5">Alokasi Kebun Mitra</th>
                <th className="py-2.5 px-3.5 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal text-slate-900">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                    Tidak ada pesanan dalam status ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const item = order.items[0];
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* No Pesanan */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-medium">{order.orderDate}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {order.customerPhone} · {order.customerType}
                        </div>
                      </td>

                      {/* Komoditas */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900">{item?.productName}</div>
                        <div className="text-[11px] text-slate-600 font-mono tabular-nums font-medium">
                          {item?.quantityKg} kg ({item?.type === 'ready' ? 'Ready Stock' : 'Pre-Order'})
                        </div>
                      </td>

                      {/* Total Nilai */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatRupiah(order.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 text-center">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Alokasi Mitra */}
                      <td className="py-2.5 px-3.5">
                        {order.fulfillments && order.fulfillments.length > 0 ? (
                          <div className="space-y-1">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1 border ${
                                order.allocationType === 'Single-Fulfillment'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : 'bg-purple-50 text-purple-900 border-purple-300'
                              }`}
                            >
                              {order.allocationType === 'Single-Fulfillment' ? (
                                <>
                                  <UserCheck className="w-3 h-3 text-emerald-700" />
                                  <span>1 Mitra (Single)</span>
                                </>
                              ) : (
                                <>
                                  <Split className="w-3 h-3 text-purple-700" />
                                  <span>Dibagi ke {order.fulfillments.length} Mitra</span>
                                </>
                              )}
                            </span>
                            <div className="text-[10px] text-slate-700 font-mono tabular-nums font-medium">
                              {order.fulfillments.map((f, i) => (
                                <div key={i}>
                                  • {f.memberName}: <strong className="text-slate-900">{f.allocatedKg} kg</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px] font-medium">Belum dialokasikan</span>
                        )}
                      </td>

                      {/* Aksi Operasional */}
                      <td className="py-2.5 px-3.5 text-right space-y-1">
                        {/* Verifikasi Pembayaran */}
                        {order.status === 'menunggu_pembayaran' && (
                          <div className="flex items-center justify-end gap-1.5">
                            {order.paymentProofUrl && (
                              <button
                                onClick={() => setViewProofUrl(order.paymentProofUrl!)}
                                className="px-2 py-1 text-[11px] font-semibold border border-slate-300 rounded text-slate-800 bg-white hover:bg-slate-50 flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <Eye className="w-3 h-3 text-slate-600" />
                                <span>Bukti</span>
                              </button>
                            )}
                            <button
                              onClick={() => verifyPayment(order.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors shadow-2xs border border-emerald-800"
                            >
                              Verifikasi Bayar
                            </button>
                          </div>
                        )}

                        {/* Tombol Buka Modal Alokasi FIFO Dinamis */}
                        {order.status === 'diproses' && (
                          <button
                            onClick={() => setSelectedOrderForAllocation(order)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1 ml-auto shadow-2xs border border-slate-900"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Pilih Alokasi (FIFO)</span>
                          </button>
                        )}

                        {/* Ubah Status ke Dikirim & Buka Surat Jalan */}
                        {order.status === 'dialokasikan' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForManifest(order)}
                              className="px-2 py-1 text-[11px] font-semibold border border-slate-300 rounded text-slate-800 bg-white hover:bg-slate-50 flex items-center gap-1 transition-colors shadow-2xs"
                              title="Lihat Rute Penjemputan Kurir"
                            >
                              <FileText className="w-3 h-3 text-slate-600" />
                              <span>Surat Jalan</span>
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'dikirim')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-2xs border border-slate-900"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Berangkat</span>
                            </button>
                          </div>
                        )}

                        {/* Selesaikan Pesanan */}
                        {order.status === 'dikirim' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForManifest(order)}
                              className="px-2 py-1 text-[11px] font-semibold border border-slate-300 rounded text-slate-800 bg-white hover:bg-slate-50 flex items-center gap-1 transition-colors shadow-2xs"
                              title="Lihat Surat Jalan"
                            >
                              <FileText className="w-3 h-3 text-slate-600" />
                              <span>Surat Jalan</span>
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'selesai')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors flex items-center gap-1 shadow-2xs border border-emerald-800"
                              title="Konfirmasi barang diterima pelanggan, potong stok kebun FIFO & catat bagi hasil mitra"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Selesai Diterima</span>
                            </button>
                          </div>
                        )}

                        {order.status === 'selesai' && (
                          <span className="text-[11px] text-emerald-800 font-bold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Bagi hasil tercatat</span>
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

      {/* DYNAMIC FIFO RECOMMENDATION & SELECTION MODAL */}
      {selectedOrderForAllocation && currentOrderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between px-5 py-3.5 border-b border-slate-300 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono bg-slate-200 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                    {selectedOrderForAllocation.orderNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Alokasi & Verifikasi Pemenuhan FIFO
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-1">
                  Pelanggan: <strong className="text-slate-900">{selectedOrderForAllocation.customerName}</strong> · Kebutuhan:{' '}
                  <strong className="text-slate-900 font-mono">{orderTargetKg} kg {currentOrderItem.productName}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForAllocation(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Order Info Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-300 rounded-md">
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] block uppercase">Tipe Pesanan</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {isReadyOrder ? 'Ready Stock Kebun' : 'Pre-Order Panen'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] block uppercase">Kuantitas Dipesan</span>
                  <span className="font-bold text-slate-900 font-mono text-sm tabular-nums">
                    {orderTargetKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold text-[10px] block uppercase">Prinsip Distribusi</span>
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Desentralisasi Kebun</span>
                  </span>
                </div>
              </div>

              {/* Strategy Selector Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pilih Metode Alokasi & Rekomendasi FIFO:
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Pilih opsi atau sesuaikan lot</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Strict FIFO */}
                  <button
                    type="button"
                    onClick={() => setAllocationStrategyMode('strict_fifo')}
                    className={`p-3 rounded-md border text-left transition-all ${
                      allocationStrategyMode === 'strict_fifo'
                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs border-l-4 border-l-slate-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">1. Strict FIFO</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                        Prioritas Panen
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Ambil dari lot panen paling awal terlebih dahulu untuk menekan susut sayuran layu.
                    </p>
                  </button>

                  {/* Option 2: Single Best-Fit */}
                  <button
                    type="button"
                    onClick={() => setAllocationStrategyMode('single_best_fit')}
                    className={`p-3 rounded-md border text-left transition-all ${
                      allocationStrategyMode === 'single_best_fit'
                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs border-l-4 border-l-slate-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">2. Single-Fulfillment</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold">
                        Efisiensi Kurir
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Prioritaskan 1 mitra tunggal dengan kelebihan stok terkecil (1 titik rute penjemputan).
                    </p>
                  </button>

                  {/* Option 3: Custom Lot Picker */}
                  <button
                    type="button"
                    onClick={() => {
                      setAllocationStrategyMode('custom');
                      if (Object.keys(customLotAllocations).length === 0) {
                        handleAutoFillCustomFifo();
                      }
                    }}
                    className={`p-3 rounded-md border text-left transition-all ${
                      allocationStrategyMode === 'custom'
                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs border-l-4 border-l-slate-900'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">3. Pilih Manual</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                        Kustomisasi
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Admin memilih dan menentukan sendiri kuantitas kg per lot/kebun mitra.
                    </p>
                  </button>
                </div>
              </div>

              {/* DETAIL CONTENT ACCORDING TO STRATEGY */}
              {allocationStrategyMode === 'strict_fifo' && strictFifoPreview && (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                      <span>Rencana Pemenuhan Berdasarkan FIFO Terlama</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white border border-slate-300 text-slate-900">
                      {strictFifoPreview.allocationType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {strictFifoPreview.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {strictFifoPreview.fulfillments.map((ful, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white border border-slate-300 rounded-md flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{ful.memberName}</div>
                          <div className="text-[11px] text-slate-600 font-medium">{ful.gardenName} · {ful.location}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                            {ful.allocatedKg} kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allocationStrategyMode === 'single_best_fit' && singleBestFitPreview && (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                      <span>Rencana Pemenuhan Berdasarkan Best-Fit 1 Mitra</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white border border-slate-300 text-slate-900">
                      {singleBestFitPreview.allocationType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    {singleBestFitPreview.reason}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {singleBestFitPreview.fulfillments.map((ful, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white border border-slate-300 rounded-md flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{ful.memberName}</div>
                          <div className="text-[11px] text-slate-600 font-medium">{ful.gardenName} · {ful.location}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                            {ful.allocatedKg} kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allocationStrategyMode === 'custom' && isReadyOrder && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Daftar Lot Stok Kebun Mitra (Urut FIFO Tanggal Panen):
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillCustomFifo}
                      className="px-2 py-1 text-[10px] rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Isi Sesuai FIFO</span>
                    </button>
                  </div>

                  <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Lot & Tanggal Panen (FIFO)</th>
                          <th className="py-2 px-3">Petani & Kebun</th>
                          <th className="py-2 px-3 text-center">Status Umur Simpan</th>
                          <th className="py-2 px-3 text-right">Stok Ada</th>
                          <th className="py-2 px-3 text-right">Ambil (kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {eligibleLotsForOrder.map((lot, idx) => {
                          const member = memberMap.get(lot.memberId);
                          const freshness = getFreshnessInfo(lot.harvestDate);
                          const assignedQty = customLotAllocations[lot.id] || 0;

                          return (
                            <tr key={lot.id} className="hover:bg-slate-50/80">
                              <td className="py-2 px-3">
                                <div className="font-mono font-bold text-slate-900">{lot.id}</div>
                                <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                                  <span>Panen: {lot.harvestDate}</span>
                                  {idx === 0 && (
                                    <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                                      Terlama
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-2 px-3">
                                <div className="font-semibold text-slate-900">{member?.name}</div>
                                <div className="text-[10px] text-slate-600">{member?.gardenName}</div>
                              </td>

                              <td className="py-2 px-3 text-center">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1 ${
                                    freshness.badgeType === 'fresh'
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                                      : freshness.badgeType === 'good'
                                      ? 'bg-sky-50 text-sky-900 border border-sky-300'
                                      : 'bg-amber-50 text-amber-950 border border-amber-300'
                                  }`}
                                >
                                  {freshness.label}
                                </span>
                              </td>

                              <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                                {lot.currentQtyKg} kg
                              </td>

                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  max={lot.currentQtyKg}
                                  step="0.5"
                                  value={assignedQty || ''}
                                  placeholder="0"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setCustomLotAllocations((prev) => ({
                                      ...prev,
                                      [lot.id]: Math.min(lot.currentQtyKg, val)
                                    }));
                                  }}
                                  className="w-16 p-1 text-xs border border-slate-300 rounded font-mono tabular-nums text-right font-bold focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary of Custom Allocation */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono">
                    <span className="text-slate-700">
                      Total Terpilih: <strong className="text-slate-900">{totalCustomAllocatedKg} kg</strong> / Target:{' '}
                      <strong className="text-slate-900">{orderTargetKg} kg</strong>
                    </span>
                    <span
                      className={`font-bold ${
                        totalCustomAllocatedKg === orderTargetKg
                          ? 'text-emerald-800'
                          : totalCustomAllocatedKg < orderTargetKg
                          ? 'text-amber-800'
                          : 'text-rose-800'
                      }`}
                    >
                      {totalCustomAllocatedKg === orderTargetKg
                        ? '✓ Kuantitas Tepat Sesuai'
                        : totalCustomAllocatedKg < orderTargetKg
                        ? `Kurang ${(orderTargetKg - totalCustomAllocatedKg).toFixed(1)} kg`
                        : `Kelebihan ${(totalCustomAllocatedKg - orderTargetKg).toFixed(1)} kg`}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Verification Strip */}
              {activeFulfillmentPlan && (
                <div
                  className={`p-3 rounded-md border text-xs flex items-center justify-between ${
                    activeFulfillmentPlan.isPossible
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {activeFulfillmentPlan.isPossible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">
                        {activeFulfillmentPlan.isPossible
                          ? 'Alokasi Valid & Siap Diverifikasi'
                          : 'Alokasi Belum Memenuhi Syarat'}
                      </div>
                      <div className="text-[11px] opacity-90">{activeFulfillmentPlan.reason}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-sm tabular-nums">
                    {activeFulfillmentPlan.fulfillments.reduce((acc, f) => acc + f.allocatedKg, 0)} / {orderTargetKg} kg
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 border-t border-slate-300 bg-slate-50/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForAllocation(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!activeFulfillmentPlan || !activeFulfillmentPlan.isPossible}
                onClick={handleConfirmAllocation}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-2xs border ${
                  activeFulfillmentPlan && activeFulfillmentPlan.isPossible
                    ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900'
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verifikasi & Tetapkan Alokasi FIFO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-300 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900">Bukti Transfer Pembayaran</h3>
              <button
                onClick={() => setViewProofUrl(null)}
                className="text-slate-500 hover:text-slate-800 text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-3/4 bg-slate-100 rounded border border-slate-300 overflow-hidden flex items-center justify-center">
                <img
                  src={viewProofUrl}
                  alt="Bukti Transfer"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="px-4 py-2.5 border-t border-slate-300 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewProofUrl(null)}
                className="py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors shadow-2xs border border-slate-900"
              >
                Selesai Tinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Manifest Modal */}
      {selectedOrderForManifest && (
        <DispatchManifestModal
          order={selectedOrderForManifest}
          members={members}
          onClose={() => setSelectedOrderForManifest(null)}
          onConfirmAllPickedUp={() => {
            if (selectedOrderForManifest.status === 'dialokasikan') {
              updateOrderStatus(selectedOrderForManifest.id, 'dikirim');
            }
          }}
        />
      )}
    </div>
  );
};
