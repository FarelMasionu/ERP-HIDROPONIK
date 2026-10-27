'use client';

import { useApp } from '../../src/context/AppContext';
import { Sidebar } from '../../src/components/Sidebar';
import { TopHeader } from '../../src/components/TopHeader';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { role } = useApp();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (role !== 'member') {
      if (role === 'admin') router.replace('/admin/dashboard');
      else if (role === 'owner') router.replace('/owner/dashboard');
      else if (role === 'consumer') router.replace('/consumer/katalog');
    }
  }, [role, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 antialiased font-sans">
      <Sidebar
        activeTab=""
        setActiveTab={() => {}}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <TopHeader
          activeTab=""
          onOpenSidebar={() => setIsSidebarOpen(true)}
          openCart={() => {}}
          onNavigateTab={() => {}}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5 lg:p-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-3.5 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:p-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              © 2026 <span className="font-semibold text-slate-700">Al-Baroqah Hidroponik ERP</span> · Rantai Pasok Segar Desentralisasi
            </div>
            <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-mono tabular-nums">
              <span>Kesegaran Max 3 Hari</span>
              <span>·</span>
              <span>Single-Fulfillment Priority</span>
              <span>·</span>
              <span>Bagi Hasil Terjual 60%</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
