'use client';

import React, { useState } from 'react';
import { Order, Member } from '../../types';
import {
  Truck,
  Printer,
  CheckCircle,
  MapPin,
  Clock,
  Phone,
  Package,
  X,
  AlertCircle
} from 'lucide-react';

interface DispatchManifestModalProps {
  order: Order;
  members: Member[];
  onClose: () => void;
  onConfirmAllPickedUp?: () => void;
}

export const DispatchManifestModal: React.FC<DispatchManifestModalProps> = ({
  order,
  members,
  onClose,
  onConfirmAllPickedUp
}) => {
  const [pickedUpState, setPickedUpState] = useState<{ [memberId: string]: boolean }>({});

  const togglePickedUp = (memberId: string) => {
    setPickedUpState((prev) => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const allChecked = order.fulfillments.every((f) => pickedUpState[f.memberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
        
        {/* Header Manifest */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                Surat Jalan Kurir Penjemputan
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                SJ-KURIR-{order.orderNumber.replace('ORD-', '')}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              Manifest Rute Logistik Sayuran Segar Al-Baroqah
            </h2>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              Tipe Distribusi:{' '}
              <span className="text-slate-900 font-bold">{order.allocationType || 'Single-Fulfillment'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors shadow-2xs"
              title="Cetak Surat Jalan"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Courier & Vehicle Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-md border border-slate-300 text-xs shadow-2xs">
          <div>
            <div className="text-slate-600 font-bold text-[10px] uppercase">Petugas Kurir Logistik:</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">Kang Dedi Supriyadi</div>
            <div className="text-slate-600 font-mono font-medium">Kontak: 0812-4455-8899</div>
          </div>
          <div>
            <div className="text-slate-600 font-bold text-[10px] uppercase">Armada Kendaraan Khusus:</div>
            <div className="font-bold text-slate-900 text-xs mt-0.5">Blind Van Sirkulasi Terbuka (D-1982-BAQ)</div>
            <div className="text-emerald-800 font-semibold">Dilengkapi Krat Berventilasi (Anti-Layu)</div>
          </div>
        </div>

        {/* Destination Customer Info */}
        <div className="p-3 bg-slate-50 rounded-md border border-slate-300 text-xs space-y-0.5 shadow-2xs">
          <div className="text-slate-600 font-bold text-[10px] uppercase">Tujuan Akhir Pengiriman:</div>
          <div className="font-bold text-slate-900">{order.customerName} ({order.customerType})</div>
          <div className="text-slate-700 font-medium">{order.customerAddress}</div>
          <div className="text-slate-600 font-mono font-medium">Penerima: {order.customerPhone}</div>
          {order.notes && (
            <div className="text-slate-800 bg-white p-2 rounded border border-slate-300 mt-2 font-medium text-[11px]">
              <strong>Catatan:</strong> {order.notes}
            </div>
          )}
        </div>

        {/* Route Stops Checklist */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>Titik Penjemputan Kebun Mitra (Checklist Kurir)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-700">
              {order.fulfillments.length} Titik Kebun
            </span>
          </div>

          <div className="space-y-2">
            {order.fulfillments.map((ful, index) => {
              const memberObj = members.find((m) => m.id === ful.memberId);
              const isChecked = !!pickedUpState[ful.memberId];

              return (
                <div
                  key={index}
                  className={`p-3 rounded-md border transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-white border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[10px]">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-900">{ful.gardenName}</span>
                    </div>

                    <div className="text-slate-700 pl-7 text-[11px] font-medium">
                      Petani: <span className="font-bold text-slate-900">{ful.memberName}</span> · <span className="font-mono">{memberObj?.phone}</span>
                    </div>

                    <div className="text-slate-600 pl-7 text-[11px] font-medium">{ful.location}</div>

                    <div className="text-[11px] text-slate-700 pl-7 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Jendela Penjemputan: <span className="font-bold text-slate-900">{ful.pickupTimeWindow}</span></span>
                    </div>
                  </div>

                  <div className="sm:text-right pl-7 sm:pl-0 flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Muatan Panen:</div>
                      <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                        {ful.allocatedKg} kg
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePickedUp(ful.memberId)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors border shadow-2xs ${
                        isChecked
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isChecked ? 'Sudah Dimuat' : 'Konfirmasi Muat'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-700 font-medium">
            Total Muatan: <strong className="font-mono tabular-nums text-slate-900 font-bold">{order.items[0]?.quantityKg} kg</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-md bg-white hover:bg-slate-50 font-semibold transition-colors shadow-2xs"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                if (onConfirmAllPickedUp) onConfirmAllPickedUp();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs border border-slate-900"
            >
              <Truck className="w-4 h-4" />
              <span>Selesai Verifikasi Surat Jalan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
