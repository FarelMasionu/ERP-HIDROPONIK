'use client';

import { AdminDashboard } from '../../../src/components/admin/AdminDashboard';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <AdminDashboard onNavigateTab={(tab: string) => {
    if (tab === 'sales_distribusi') router.push('/admin/sales-distribusi');
    else if (tab === 'forecasting') router.push('/admin/forecasting');
    else if (tab === 'batch_produksi') router.push('/admin/batch-produksi');
    else if (tab === 'perencanaan_bahan') router.push('/admin/perencanaan-bahan');
    else if (tab === 'panen_qc') router.push('/admin/panen-qc');
    else if (tab === 'mitra_bagihasil') router.push('/admin/mitra-bagi-hasil');
    else if (tab === 'laporan_scm') router.push('/admin/laporan-scm');
    else if (tab === 'data_master') router.push('/admin/data-master');
  }} />;
}
