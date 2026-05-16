import { ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar - visible at xl (≥1280px) breakpoint, we'll customize to 960px */}
      <DesktopSidebar />

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <div className="xl:hidden">
        <BottomNav />
      </div>
    </div>
  );
}