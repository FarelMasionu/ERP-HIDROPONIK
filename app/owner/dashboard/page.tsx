'use client';

import { OwnerDashboard } from '../../../src/components/owner/OwnerDashboard';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <OwnerDashboard onNavigateTab={(tab: string) => {
    if (tab === 'perencanaan_bahan') router.push('/owner/perencanaan-bahan');
    else if (tab === 'laporan_scm') router.push('/owner/laporan-scm');
    else if (tab === 'mitra_bagihasil') router.push('/owner/mitra-bagi-hasil');
    else if (tab === 'forecasting') router.push('/owner/forecasting');
    else if (tab === 'data_master') router.push('/owner/data-master');
  }} />;
}
