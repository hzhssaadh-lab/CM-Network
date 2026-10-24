import React from 'react';
import { LivePriceChart } from './LivePriceChart';

interface MobileDashboardMockupProps {
  onOpenAuth?: () => void;
}

export function MobileDashboardMockup({ onOpenAuth }: MobileDashboardMockupProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-4 w-full">
      {/* Golden pedestal glow underneath the chart */}
      <div className="absolute -bottom-10 w-full max-w-xl h-24 bg-gradient-to-r from-transparent via-[#FFD700]/25 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-2 w-72 sm:w-96 h-6 border border-[#FFD700]/30 rounded-full bg-gradient-to-b from-[#FFD700]/10 to-transparent pointer-events-none" />

      {/* Live Fluctuation Price Chart ($4.00 - $6.00 CM/USDT) */}
      <LivePriceChart />
    </div>
  );
}
