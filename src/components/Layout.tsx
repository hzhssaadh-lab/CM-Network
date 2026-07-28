import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { BannerAd } from './BannerAd';

export function Layout() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#050505] text-white">
      <Header />
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 max-w-5xl mx-auto w-full scrollbar-hide pb-32">
        <BannerAd />
        <Outlet />
      </main>
      <div className="fixed bottom-0 w-full left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5">
        <Navigation />
        <footer className="flex justify-between items-center px-4 py-3 mx-auto max-w-5xl">
          <p className="text-[9px] text-gray-600 tracking-[0.3em] font-bold">SECURED BY CM NETWORK</p>
          <p className="text-[9px] text-[#FFD700]/70 tracking-[0.2em] font-bold">v1.0.0 PLATINUM</p>
        </footer>
      </div>
    </div>
  );
}
