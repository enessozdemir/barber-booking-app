import type { ReactNode } from 'react';
import BarberSidebar from './BarberSidebar';

interface BarberLayoutProps {
  children: ReactNode;
}

export default function BarberLayout({ children }: BarberLayoutProps) {
  return (
    <div className="flex min-h-screen bg-dark">
      <BarberSidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
