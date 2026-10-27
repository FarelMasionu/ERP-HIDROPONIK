import type { Metadata } from 'next';
import { AppProvider } from '../src/context/AppContext';

export const metadata: Metadata = {
  title: 'Al-Baroqah Hidroponik ERP',
  description: 'Rantai Pasok Segar Desentralisasi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
