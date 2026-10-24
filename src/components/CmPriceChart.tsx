import React, { useState, useEffect, useId, useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Activity, Zap } from 'lucide-react';

interface PricePoint {
  time: string;
  price: number;
}

export function CmPriceChart() {
  const gradientId = useId();
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D' | 'ALL'>('24H');
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [liveTick, setLiveTick] = useState(0);

  // Generate deterministic realistic market price series bounded between $2.00 and $6.00
  const chartData = useMemo(() => {
    // Generate distinct waves with peaks and valleys (kab down kab up) strictly between 2.00 and 6.00
    const configs: Record<string, { count: number; times: string[]; seed: number; baseTrend: number[] }> = {
      '1H': {
        count: 16,
        times: ['60m', '55m', '50m', '45m', '40m', '35m', '30m', '25m', '20m', '15m', '12m', '9m', '6m', '4m', '2m', 'Just now'],
        seed: 10,
        baseTrend: [4.15, 3.80, 2.95, 3.40, 4.60, 5.25, 4.80, 3.90, 3.10, 2.65, 3.55, 4.70, 5.40, 5.10, 4.85, 4.98]
      },
      '24H': {
        count: 20,
        times: ['00:00', '01:30', '03:00', '04:30', '06:00', '07:30', '09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:00', '22:45', '23:15', '23:45', 'Live'],
        seed: 24,
        baseTrend: [3.45, 2.80, 2.35, 3.10, 3.90, 4.85, 5.60, 5.20, 4.40, 3.65, 2.90, 3.75, 4.90, 5.82, 5.45, 4.30, 4.75, 5.15, 4.95, 5.10]
      },
      '7D': {
        count: 14,
        times: ['Day 1', 'Day 2 AM', 'Day 2 PM', 'Day 3 AM', 'Day 3 PM', 'Day 4', 'Day 5 AM', 'Day 5 PM', 'Day 6 AM', 'Day 6 PM', 'Day 7 AM', 'Day 7 Mid', 'Day 7 Eve', 'Now'],
        seed: 70,
        baseTrend: [2.50, 3.20, 2.85, 4.10, 4.95, 5.75, 5.10, 3.80, 2.70, 3.60, 4.80, 5.90, 5.35, 5.12]
      },
      '30D': {
        count: 15,
        times: ['W1', 'W1.5', 'W2', 'W2.5', 'W3', 'W3.5', 'W4', 'W4.2', 'W4.4', 'W4.6', 'W4.8', 'Day 28', 'Day 29', 'Day 30', 'Live'],
        seed: 30,
        baseTrend: [2.20, 3.05, 4.15, 3.40, 2.65, 3.90, 5.30, 5.85, 4.60, 3.50, 4.25, 5.40, 5.75, 4.90, 5.15]
      },
      'ALL': {
        count: 16,
        times: ['Launch', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'Phase 2', 'Current'],
        seed: 100,
        baseTrend: [2.05, 2.60, 3.45, 2.80, 3.90, 4.75, 5.65, 4.20, 3.10, 4.50, 5.85, 5.20, 3.75, 4.80, 5.60, 5.18]
      }
    };

    const config = configs[timeframe];
    return config.baseTrend.map((val, idx) => {
      // Dynamic tiny pulse based on liveTick for realistic alive chart
      const microJitter = idx === config.baseTrend.length - 1 ? (Math.sin(liveTick) * 0.04) : 0;
      const finalPrice = Math.min(5.95, Math.max(2.05, Number((val + microJitter).toFixed(2))));
      return {
        time: config.times[idx],
        price: finalPrice
      };
    });
  }, [timeframe, liveTick]);

  // Live heart-beat ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(t => t + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const latestPrice = chartData[chartData.length - 1].price;
  const currentPrice = hoveredPoint ? hoveredPoint.price : latestPrice;
  const firstPrice = chartData[0].price;
  const priceChange = Number((latestPrice - firstPrice).toFixed(2));
  const percentChange = Number(((priceChange / firstPrice) * 100).toFixed(1));
  const isPositive = priceChange >= 0;

  // Chart viewport coordinates
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 24;

  // Price scale strictly between $2.00 and $6.00
  const minPriceBound = 2.00;
  const maxPriceBound = 6.00;

  const getCoordinates = (index: number, price: number) => {
    const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - paddingX * 2);
    // Inverted Y: $6.00 at top, $2.00 at bottom
    const y = paddingY + ((maxPriceBound - price) / (maxPriceBound - minPriceBound)) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  // Generate SVG smooth path using catmull-rom/cubic bezier
  const points = chartData.map((d, i) => getCoordinates(i, d.price));

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }, [points]);

  // Area path for gradient under the line
  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = svgHeight - paddingY;
    return `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`;
  }, [pathD, points, svgHeight, paddingY]);

  // Horizontal price levels strictly $2 to $6
  const priceLevels = [6.00, 5.00, 4.00, 3.00, 2.00];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const chartMouseX = mouseX * scaleX;

    let closestIdx = 0;
    let closestDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - chartMouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    setHoveredPoint(chartData[closestIdx]);
    setHoverX(points[closestIdx].x);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverX(null);
  };

  return (
    <div className="bg-gradient-to-b from-[#15130d] via-[#0f0e0a] to-[#080705] border-2 border-[#FFD700]/40 rounded-[32px] p-5 sm:p-7 relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,215,0,0.12)] space-y-5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-[#FFD700]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Row: Price Info & Timeframe Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[11px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
              LIVE CM INDEX
            </span>
            <span className="text-[11px] font-mono text-gray-400">CM / Tether USD</span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              ${currentPrice.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
              USD
            </span>
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
              isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{priceChange >= 0 ? `+$${priceChange.toFixed(2)}` : `-$${Math.abs(priceChange).toFixed(2)}`}</span>
              <span>({isPositive ? '+' : ''}{percentChange}%)</span>
            </div>
            {hoveredPoint && (
              <span className="text-xs text-[#FFD700] font-mono font-bold ml-1 bg-[#FFD700]/10 px-2 py-0.5 rounded">
                Point: {hoveredPoint.time}
              </span>
            )}
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-white/10 self-stretch sm:self-auto overflow-x-auto">
          {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setHoveredPoint(null);
                setHoverX(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-black tracking-wider uppercase rounded-xl transition-all ${
                timeframe === tf 
                  ? 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black shadow-[0_0_15px_rgba(255,215,0,0.4)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Price Chart Area */}
      <div className="relative w-full pt-1">
        {/* SVG Chart */}
        <div className="w-full overflow-hidden select-none">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full h-52 sm:h-64 cursor-crosshair overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradient for area fill */}
              <linearGradient id={`chartFill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#FFD700" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.00" />
              </linearGradient>

              {/* Gradient for price line */}
              <linearGradient id={`chartStroke-${gradientId}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>

              {/* Glowing shadow filter */}
              <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Guide Lines & Only Price Labels ($6.00 to $2.00) */}
            {priceLevels.map((lvl) => {
              const y = paddingY + ((maxPriceBound - lvl) / (maxPriceBound - minPriceBound)) * (svgHeight - paddingY * 2);
              return (
                <g key={lvl}>
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={svgWidth - paddingX} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.08)" 
                    strokeDasharray="4 4" 
                    strokeWidth="1"
                  />
                  {/* Price on vertical axis: ONLY PRICE SHOWS */}
                  <text 
                    x={paddingX - 8} 
                    y={y + 4} 
                    fill="rgba(255, 215, 0, 0.75)" 
                    fontSize="11" 
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    ${lvl.toFixed(2)}
                  </text>
                  <text 
                    x={svgWidth - paddingX + 8} 
                    y={y + 4} 
                    fill="rgba(255, 255, 255, 0.25)" 
                    fontSize="10" 
                    fontFamily="monospace"
                    textAnchor="start"
                  >
                    ${lvl.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill={`url(#chartFill-${gradientId})`} />

            {/* Glowing Price Curve */}
            <path 
              d={pathD} 
              fill="none" 
              stroke={`url(#chartStroke-${gradientId})`} 
              strokeWidth="3.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter={`url(#glow-${gradientId})`}
            />

            {/* Live End Point (Pulsing Dot) */}
            {points.length > 0 && (
              <g>
                <circle 
                  cx={points[points.length - 1].x} 
                  cy={points[points.length - 1].y} 
                  r="6" 
                  fill="#34D399" 
                  className="animate-pulse"
                />
                <circle 
                  cx={points[points.length - 1].x} 
                  cy={points[points.length - 1].y} 
                  r="2.5" 
                  fill="#FFFFFF" 
                />
              </g>
            )}

            {/* Interactive Hover Crosshair */}
            {hoverX !== null && hoveredPoint && (
              <g>
                <line 
                  x1={hoverX} 
                  y1={paddingY} 
                  x2={hoverX} 
                  y2={svgHeight - paddingY} 
                  stroke="#FFD700" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
                {(() => {
                  const targetPt = points.find((_, i) => chartData[i].time === hoveredPoint.time);
                  if (!targetPt) return null;
                  return (
                    <g>
                      <circle 
                        cx={targetPt.x} 
                        cy={targetPt.y} 
                        r="7" 
                        fill="#FFD700" 
                        stroke="#000" 
                        strokeWidth="2"
                        filter={`url(#glow-${gradientId})`}
                      />
                      <circle 
                        cx={targetPt.x} 
                        cy={targetPt.y} 
                        r="3" 
                        fill="#FFFFFF" 
                      />
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>

        {/* Time Labels on bottom */}
        <div className="flex justify-between items-center px-10 text-[10px] text-gray-400 font-mono pt-1">
          <span>{chartData[0]?.time}</span>
          <span>{chartData[Math.floor(chartData.length / 2)]?.time}</span>
          <span className="text-emerald-400 font-bold">{chartData[chartData.length - 1]?.time}</span>
        </div>
      </div>

      {/* Bottom Key Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/5">
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">24h Low</span>
          <p className="text-sm font-mono font-black text-red-400 mt-0.5">$2.35 USD</p>
        </div>
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">24h High</span>
          <p className="text-sm font-mono font-black text-emerald-400 mt-0.5">$5.82 USD</p>
        </div>
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">24h Vol (CM)</span>
          <p className="text-sm font-mono font-black text-[#FFD700] mt-0.5">148,290 CM</p>
        </div>
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">P2P Status</span>
          <p className="text-sm font-mono font-black text-emerald-400 mt-0.5 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Active Live
          </p>
        </div>
      </div>
    </div>
  );
}
