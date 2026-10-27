'use client';

import { ForecastingPlanning } from '../../../src/components/admin/ForecastingPlanning';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <ForecastingPlanning onNavigateTab={(tab: string) => {
    if (tab === 'dashboard') router.push('/admin/dashboard');
    else if (tab === 'perencanaan_bahan') router.push('/admin/perencanaan-bahan');
  }} />;
}
