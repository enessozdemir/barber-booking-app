import type { ReactNode } from 'react';
import Header from '../../shared/components/Header';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-dark">
      <Header />
      
      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
