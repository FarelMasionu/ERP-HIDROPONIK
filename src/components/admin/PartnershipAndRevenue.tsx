'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  generateRevenueShareCsv,
  downloadCsvFile
} from '../../utils/scmAlgorithms';
import { RevenueShareRecord, Member } from '../../types';
import {
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Check,
  Download,
  X
} from 'lucide-react';

export const PartnershipAndRevenue: React.FC = () => {
  const { members, revenueRecords, disburseRevenueShare } = useApp();
  const [activeTab, setActiveTab] = useState<'laporan_bagihasil' | 'profil_mitra'>('laporan_bagihasil');
  const [payoutModalRecord, setPayoutModalRecord] = useState<RevenueShareRecord | null>(null);
  const [payoutNotice, setPayoutNotice] = useState<string | null>(null);

  // Totals
  const totalAccrued = revenueRecords
    .filter((r) => r.payoutStatus === 'accrued')
    .reduce((acc, r) => acc + r.shareAmount, 0);

  const totalDisbursed = revenueRecords
    .filter((r) => r.payoutStatus === 'disbursed')
    .reduce((acc, r) => acc + r.shareAmount, 0);

  const handleDisburseConfirm = () => {
    if (!payoutModalRecord) return;
    disburseRevenueShare(payoutModalRecord.id);
    const paidMember = payoutModalRecord.memberName;
    const paidAmount = formatRupiah(payoutModalRecord.shareAmount);
    setPayoutModalRecord(null);
    setPayoutNotice(`Pencairan sebesar ${paidAmount} kepada ${paidMember} berhasil diverifikasi dan ditransfer!`);
    setTimeout(() => setPayoutNotice(null), 4000);
  };

  const handleExportCsv = () => {
    const csvData = generateRevenueShareCsv(revenueRecords);
    downloadCsvFile(csvData, `rekapitulasi_bagi_hasil_albaroqah_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-5">
      {/* Payout Notification Banner */}
      {payoutNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{payoutNotice}</span>
          </div>
          <button
            onClick={() => setPayoutNotice(null)}
            className="text-slate-500 hover:text-slate-800 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Kemitraan Petani & Transparansi Bagi Hasil
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Formula bagi hasil adil dan transparan: hanya dihitung dari produk yang sah terjual ke konsumen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            title="Download file CSV rekapitulasi bagi hasil"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-300 shadow-2xs text-xs">
            <button
              onClick={() => setActiveTab('laporan_bagihasil')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'laporan_bagihasil'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Laporan Bagi Hasil Terjual
            </button>
            <button
              onClick={() => setActiveTab('profil_mitra')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'profil_mitra'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Profil & Kapasitas Kebun Mitra
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Bagi Hasil Belum Dicairkan (Accrued)</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatRupiah(totalAccrued)}
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Hak petani dari transaksi yang telah selesai diterima
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Total Bagi Hasil Sudah Ditransfer</span>
            <CheckCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {formatRupiah(totalDisbursed)}
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Telah ditransfer ke rekening bank mitra terdaftar
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-lg p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Total Anggota Petani Binaan</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
            {members.length} Petani Mitra
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Total kapasitas:{' '}
            {members.reduce((acc, m) => acc + m.totalHoles, 0).toLocaleString('id-ID')} lubang
          </div>
        </div>
      </div>

      {/* Tab 1: Ledger Bagi Hasil Transparan */}
      {activeTab === 'laporan_bagihasil' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-900 font-bold">Formula Akuntansi Syariah / Transparan:</strong>{' '}
              <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded border border-slate-300 font-bold text-slate-800">
                Hak Mitra = ∑(Qty Terjual × Harga Satuan × % Bagi Hasil Mitra)
              </code>
              . Sayuran susut, rusak, atau busuk karena tidak laku <strong className="text-slate-900 font-bold">TIDAK dibayarkan</strong> dalam bagi hasil.
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Tanggal & No. Order</th>
                    <th className="py-2.5 px-3.5">Petani Penerima Hak</th>
                    <th className="py-2.5 px-3.5">Komoditas & Qty Terjual</th>
                    <th className="py-2.5 px-3.5 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3.5 text-center">Bagi Hasil (%)</th>
                    <th className="py-2.5 px-3.5 text-right">Nominal Hak Mitra</th>
                    <th className="py-2.5 px-3.5 text-center">Status Pencairan</th>
                    <th className="py-2.5 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal text-slate-900">
                  {revenueRecords.map((rev) => {
                    const isAccrued = rev.payoutStatus === 'accrued';
                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="font-mono font-bold text-slate-900">{rev.orderNumber}</div>
                          <div className="text-[10px] text-slate-500 font-mono font-medium">{rev.transactionDate}</div>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-slate-900">{rev.memberName}</div>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-slate-900">{rev.productName}</div>
                          <div className="text-[10px] text-slate-600 font-mono tabular-nums font-medium">{rev.qtyKg} kg</div>
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-700 font-semibold">
                          {formatRupiah(rev.pricePerKg)}
                        </td>

                        <td className="py-2.5 px-3.5 text-center font-mono tabular-nums font-bold text-slate-900">
                          {rev.revenueSharePercent}%
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900">
                          {formatRupiah(rev.shareAmount)}
                        </td>

                        <td className="py-2.5 px-3.5 text-center">
                          {isAccrued ? (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-900 border border-amber-300">
                              Belum Dicairkan
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                              Sudah Ditransfer
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 text-right">
                          {isAccrued && (
                            <button
                              onClick={() => setPayoutModalRecord(rev)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors shadow-2xs border border-slate-900"
                            >
                              Transfer Hak
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Profil & Kapasitas Kebun Mitra */}
      {activeTab === 'profil_mitra' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((m) => {
            const remainingHoles = m.totalHoles - m.activeLoadHoles;
            const loadPct = Math.round((m.activeLoadHoles / m.totalHoles) * 100);

            return (
              <div
                key={m.id}
                className="bg-white border border-slate-300 rounded-lg p-4 hover:border-slate-400 transition-colors space-y-3.5 shadow-2xs"
              >
                <div className="flex items-start justify-between pb-2.5 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                    <div className="text-xs text-slate-600 font-medium">{m.gardenName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.location}</div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300">
                    Bagi Hasil {m.revenueSharePercent}%
                  </span>
                </div>

                {/* Hole Capacity Indicator */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono tabular-nums text-[11px]">
                    <span className="text-slate-600 font-medium">Beban Berjalan: {m.activeLoadHoles.toLocaleString('id-ID')} lubang</span>
                    <span className="font-bold text-slate-900">Total: {m.totalHoles.toLocaleString('id-ID')} lubang</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-300">
                    <div
                      className="bg-slate-800 h-2 rounded-full transition-all"
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] text-slate-600 font-mono tabular-nums font-medium">
                    Sisa Kapasitas Tersedia: <strong className="text-slate-900">{remainingHoles.toLocaleString('id-ID')}</strong> lubang ({100 - loadPct}% bebas)
                  </div>
                </div>

                {/* Bank Account Info */}
                <div className="p-3 bg-slate-50 rounded-md text-xs space-y-1 border border-slate-300 shadow-2xs">
                  <div className="text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    Rekening Pencairan Resmi:
                  </div>
                  <div className="font-bold text-slate-900">
                    {m.bankAccount.bankName} - <span className="font-mono tabular-nums">{m.bankAccount.accountNumber}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] font-medium">
                    an. {m.bankAccount.holderName} · Kontak: {m.phone}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payout Transfer Modal */}
      {payoutModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3.5 border border-slate-300">
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-300 bg-slate-50 -mx-5 -mt-5 p-4 rounded-t-lg">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Konfirmasi Pencairan Bagi Hasil
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Transfer dana bagi hasil ke petani mitra dari pesanan selesai.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalRecord(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-md text-xs space-y-1.5 border border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Petani:</span>
                <span className="font-bold text-slate-900">{payoutModalRecord.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Komoditas Terjual:</span>
                <span className="font-bold text-slate-900">
                  {payoutModalRecord.qtyKg} kg {payoutModalRecord.productName}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Nominal Hak ({payoutModalRecord.revenueSharePercent}%):</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                  {formatRupiah(payoutModalRecord.shareAmount)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Pastikan dana telah dikirim via transfer bank sebelum mengonfirmasi pencairan ini.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-300">
              <button
                type="button"
                onClick={() => setPayoutModalRecord(null)}
                className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 shadow-2xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDisburseConfirm}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs border border-slate-900"
              >
                Konfirmasi Sudah Ditransfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
