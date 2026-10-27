'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../src/context/AppContext';

export default function HomePage() {
  const { role } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (role === 'admin') {
      router.replace('/admin/dashboard');
    } else if (role === 'owner') {
      router.replace('/owner/dashboard');
    } else if (role === 'member') {
      router.replace('/member');
    } else if (role === 'consumer') {
      router.replace('/consumer/katalog');
    }
  }, [role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-600 text-sm">Memuat...</div>
    </div>
  );
}
