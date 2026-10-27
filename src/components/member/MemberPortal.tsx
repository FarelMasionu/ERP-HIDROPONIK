'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/scmAlgorithms';
import { AgronomyGuideModal } from './AgronomyGuideModal';
import {
  Sprout,
  Truck,
  CheckCircle,
  Clock,
  Layers,
  Send,
  Droplets,
  Calendar,
  AlertCircle,
  BookOpen,
  Boxes
} from 'lucide-react';
import { MemberMaterialReadiness } from './MemberMaterialReadiness';

interface MemberPortalProps {
  initialSubTab?: string;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({ initialSubTab = 'tugas_saya' }) => {
  const {
    members,
    selectedMemberId,
    batches,
    orders,
    revenueRecords,
    products,
    materialPlans,
    submitMemberHarvest
  } = useApp();

  const [portalTab, setPortalTab] = useState<string>(initialSubTab);
  const [isAgronomyModalOpen, setIsAgronomyModalOpen] = useState(false);

  const member = members.find((m) => m.id === selectedMemberId) || members[0];

  // Form Lapor Panen Mandiri State
  const [reportBatchId, setReportBatchId] = useState('');
  const [grossHarvestKg, setGrossHarvestKg] = useState<number>(30);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  // Active batches for this member
  const myAllocatedBatches = batches.filter((b) =>
    b.allocations.some((a) => a.memberId === member.id)
  );

  // Courier Pickup Instructions for this member
  const myPickupInstructions = orders.flatMap((order) => {
    const fuls = order.fulfillments.filter((f) => f.memberId === member.id);
    return fuls.map((f) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerType: order.customerType,
      productName: order.items[0]?.productName || 'Sayuran Hidroponik',
      allocatedKg: f.allocatedKg,
      pickupWindow: f.pickupTimeWindow || 'Hari ini, 13:00 - 15:00 WIB',
      orderStatus: order.status
    }));
  });

  // My Revenue records
  const myRevenueRecords = revenueRecords.filter((r) => r.memberId === member.id);
  const myAccrued = myRevenueRecords
    .filter((r) => r.payoutStatus === 'accrued')
    .reduce((acc, r) => acc + r.shareAmount, 0);
  const myDisbursed = myRevenueRecords
    .filter((r) => r.payoutStatus === 'disbursed')
    .reduce((acc, r) => acc + r.shareAmount, 0);

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportBatchId) {
      setSubmittedNotice('Peringatan: Silakan pilih batch tanam yang dipanen terlebih dahulu.');
      return;
    }

    const batch = batches.find((b) => b.id === reportBatchId);
    if (!batch) return;

    submitMemberHarvest(member.id, batch.id, batch.productId, grossHarvestKg);
    setSubmittedNotice(
      `Laporan panen ${grossHarvestKg} kg berhasil dikirim ke Admin untuk verifikasi QC!`
    );
    setTimeout(() => setSubmittedNotice(null), 3000);
  };

  const remainingHoles = member.totalHoles - member.activeLoadHoles;
  const loadPercentage = Math.round((member.activeLoadHoles / member.totalHoles) * 100);

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mb-1">
              Portal Petani Mitra Binaan
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{member.name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {member.gardenName} · {member.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAgronomyModalOpen(true)}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-600 shadow-2xs"
            >
              <Droplets className="w-3.5 h-3.5 text-slate-300" />
              <span>Kalkulator Nutrisi & SOP</span>
            </button>

            <div className="px-3.5 py-1.5 bg-slate-800 rounded-md text-right border border-slate-700 shadow-2xs">
              <div className="text-[10px] text-slate-300 font-medium">Hak Bagi Hasil</div>
              <div className="text-base font-bold font-mono tabular-nums text-white">
                {member.revenueSharePercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Personal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Kapasitas Lubang Tanam */}
        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Kapasitas Instalasi NFT</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {member.activeLoadHoles.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-medium text-slate-500">/ {member.totalHoles.toLocaleString('id-ID')} lb</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-300/80">
            <div
              className="bg-slate-800 h-1.5 rounded-full"
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-600 font-mono tabular-nums font-medium">
            Sisa bebas: <strong className="text-slate-900 font-bold">{remainingHoles.toLocaleString('id-ID')}</strong> lubang
          </div>
        </div>

        {/* Metric 2: Instruksi Jemput Hari Ini */}
        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Penjemputan Sayur</span>
            <Truck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {myPickupInstructions.filter((i) => i.orderStatus === 'dialokasikan' || i.orderStatus === 'dikirim').length} Pesanan
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Harap dipetik segar sesuai jadwal kurir tiba
          </div>
        </div>

        {/* Metric 3: Saldo Belum Cair */}
        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Bagi Hasil Belum Cair</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatRupiah(myAccrued)}
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Dari produk kebun yang telah diterima konsumen
          </div>
        </div>

        {/* Metric 4: Sudah Ditransfer */}
        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Total Sudah Ditransfer</span>
            <CheckCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatRupiah(myDisbursed)}
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Masuk ke {member.bankAccount.bankName} an. {member.bankAccount.holderName}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-300 text-xs overflow-x-auto shadow-2xs">
        <button
          onClick={() => setPortalTab('tugas_saya')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            portalTab === 'tugas_saya'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900 font-semibold'
          }`}
        >
          Tugas Tanam & SOP
        </button>
        <button
          onClick={() => setPortalTab('kesiapan_bahan')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
            portalTab === 'kesiapan_bahan'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900 font-semibold'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-slate-600" />
          <span>Kesiapan Bahan Tanam</span>
          {materialPlans.filter((p) => p.memberId === member.id && p.plantingReadiness === 'menunggu_konfirmasi').length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[10px] font-bold">
              {materialPlans.filter((p) => p.memberId === member.id && p.plantingReadiness === 'menunggu_konfirmasi').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setPortalTab('instruksi_jemput')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap relative flex items-center gap-1.5 ${
            portalTab === 'instruksi_jemput'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900 font-semibold'
          }`}
        >
          <span>Instruksi Penjemputan Kurir</span>
          {myPickupInstructions.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[10px] font-bold">
              {myPickupInstructions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setPortalTab('lapor_panen')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            portalTab === 'lapor_panen'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900 font-semibold'
          }`}
        >
          Lapor Panen Mandiri
        </button>
        <button
          onClick={() => setPortalTab('saldo_bagihasil')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            portalTab === 'saldo_bagihasil'
              ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-300'
              : 'text-slate-700 hover:text-slate-900 font-semibold'
          }`}
        >
          Buku Tabungan & Bagi Hasil Saya
        </button>
      </div>

      {/* Tab 1: Tugas Tanam & Panduan Nutrisi */}
      {portalTab === 'tugas_saya' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Jadwal Tanam Dialokasikan ke Kebun Anda
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAllocatedBatches.map((batch) => {
              const prod = products.find((p) => p.id === batch.productId);
              const alloc = batch.allocations.find((a) => a.memberId === member.id);
              if (!alloc) return null;

              return (
                <div
                  key={batch.id}
                  className="bg-white border border-slate-300 rounded-lg p-4 hover:border-slate-400 transition-colors space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between pb-2.5 border-b border-slate-200">
                    <div>
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-900 border border-slate-300">
                        {batch.batchCode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{prod?.name}</h3>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Tanam: <span className="font-semibold text-slate-800">{batch.startDate}</span> → Panen: <strong className="text-slate-900 font-bold">{batch.estimatedHarvestDate}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-300">
                      {alloc.progressStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-md">
                      <div className="text-slate-600 font-medium">Target Panen Anda:</div>
                      <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                        {alloc.targetKg} kg
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono tabular-nums font-medium">
                        {alloc.usedHoles.toLocaleString('id-ID')} lubang tanam
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-md space-y-1">
                      <div className="text-slate-700 font-semibold flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-slate-600" />
                        <span>Parameter SOP:</span>
                      </div>
                      <div className="text-[11px] text-slate-800 font-mono font-medium">
                        EC: 1.8 - 2.2 mS/cm
                      </div>
                      <div className="text-[11px] text-slate-800 font-mono font-medium">
                        pH: 5.8 - 6.4
                      </div>
                    </div>
                  </div>

                  {alloc.notes && (
                    <div className="p-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800">
                      <strong className="font-bold text-slate-900">Catatan Agronomis:</strong> {alloc.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Instruksi Penjemputan Kurir */}
      {portalTab === 'instruksi_jemput' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
            <Truck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950">Instruksi Petik Segar:</span>
              <p className="mt-0.5 leading-relaxed font-medium">
                Kurir Al-Baroqah menjemput langsung ke kebun Anda. Harap petik sayuran 1–2 jam sebelum jendela penjemputan, bersihkan akar dari lumut/kotoran, dan masukkan ke krat panen bersirkulasi udara.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {myPickupInstructions.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-300 rounded-lg text-slate-500 font-medium text-xs shadow-2xs">
                Tidak ada instruksi penjemputan aktif hari ini.
              </div>
            ) : (
              myPickupInstructions.map((ins, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-300 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ins.orderNumber}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs font-bold text-slate-800">{ins.customerName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded border border-slate-300 font-bold">
                        {ins.customerType}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {ins.productName}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono tabular-nums font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Jadwal Kurir Tiba: <strong className="text-slate-900 font-bold">{ins.pickupWindow}</strong></span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[11px] text-slate-600 font-medium">Jumlah Harus Dipetik:</div>
                    <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                      {ins.allocatedKg} kg
                    </div>
                    <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                      Siapkan di Meja Panen
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Lapor Panen Mandiri */}
      {portalTab === 'lapor_panen' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-300 rounded-lg p-5 space-y-3.5 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Formulir Laporan Panen Mandiri</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Laporkan hasil panen kotor dari talang instalasi kebun Anda untuk diverifikasi QC oleh Admin.
            </p>
          </div>

          {submittedNotice && (
            <div className={`p-3 rounded-md text-xs flex items-center gap-2 ${
              submittedNotice.startsWith('Peringatan')
                ? 'bg-amber-50 border border-amber-300 text-amber-900'
                : 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{submittedNotice}</span>
            </div>
          )}

          <form onSubmit={handleHarvestSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Pilih Batch Tanam Anda *
              </label>
              <select
                required
                value={reportBatchId}
                onChange={(e) => setReportBatchId(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 font-medium text-slate-900"
              >
                <option value="">-- Pilih Batch --</option>
                {myAllocatedBatches.map((b) => {
                  const p = products.find((prod) => prod.id === b.productId);
                  return (
                    <option key={b.id} value={b.id}>
                      {b.batchCode} - {p?.name} (Estimasi Panen: {b.estimatedHarvestDate})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Hasil Panen Kotor Terpetik (kg) *
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={grossHarvestKg}
                onChange={(e) => setGrossHarvestKg(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono tabular-nums p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 text-slate-900 font-semibold"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                Timbang basah setelah pembersihan awal talang.
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 leading-relaxed font-medium">
              Setelah dikirim, Admin QC Al-Baroqah akan memverifikasi hasil panen. Stok bersih akan otomatis masuk ke data kebun Anda tanpa proses gudang transit.
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Laporan Panen ke Admin</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Buku Tabungan & Bagi Hasil Saya */}
      {portalTab === 'saldo_bagihasil' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Tanggal & No. Order</th>
                    <th className="py-2.5 px-3.5">Komoditas & Qty Terjual</th>
                    <th className="py-2.5 px-3.5 text-right">Harga Produk</th>
                    <th className="py-2.5 px-3.5 text-center">Bagi Hasil ({member.revenueSharePercent}%)</th>
                    <th className="py-2.5 px-3.5 text-right">Hak Anda</th>
                    <th className="py-2.5 px-3.5 text-center">Status Pencairan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal text-slate-800">
                  {myRevenueRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                        Belum ada riwayat transaksi penjualan yang selesai dari kebun Anda.
                      </td>
                    </tr>
                  ) : (
                    myRevenueRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="font-mono font-bold text-slate-900">{r.orderNumber}</div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium">{r.transactionDate}</div>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="font-bold text-slate-900">{r.productName}</div>
                          <div className="text-[10px] text-slate-600 font-mono tabular-nums font-semibold">{r.qtyKg} kg</div>
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-700 font-medium">
                          {formatRupiah(r.pricePerKg)}
                        </td>

                        <td className="py-2.5 px-3.5 text-center font-mono tabular-nums font-bold text-slate-900">
                          {r.revenueSharePercent}%
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                          {formatRupiah(r.shareAmount)}
                        </td>

                        <td className="py-2.5 px-3.5 text-center">
                          {r.payoutStatus === 'accrued' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-900 border border-amber-300">
                              Belum Dicairkan
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                              Sudah Ditransfer
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Kesiapan Bahan Tanam */}
      {portalTab === 'kesiapan_bahan' && (
        <MemberMaterialReadiness member={member} />
      )}

      {/* Agronomy Guide Modal */}
      {isAgronomyModalOpen && (
        <AgronomyGuideModal onClose={() => setIsAgronomyModalOpen(false)} />
      )}
    </div>
  );
};
