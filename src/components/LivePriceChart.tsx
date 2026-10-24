import React, { useState, useEffect } from 'react';
import { Activity, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PricePoint {
  time: string;
  price: number;
}

export function LivePriceChart() {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '1M' | '1Y'>('24H');
  const [currentPrice, setCurrentPrice] = useState<number>(4.85);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('up');
  const [change24h, setChange24h] = useState<number>(12.65);
  const [high24h, setHigh24h] = useState<number>(5.82);
  const [low24h, setLow24h] = useState<number>(4.15);
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  // Generate historical baseline points between $4.00 and $6.00
  const generateChartPoints = (tf: string, base: number): PricePoint[] => {
    const points: PricePoint[] = [];
    const count = tf === '1H' ? 20 : tf === '24H' ? 24 : tf === '7D' ? 28 : 30;
    let price = 4.30;

    for (let i = 0; i < count; i++) {
      const step = (Math.random() - 0.46) * 0.18;
      price = Math.min(5.85, Math.max(4.10, price + step));
      
      let timeLabel = '';
      if (tf === '1H') timeLabel = `${i * 3}m ago`;
      else if (tf === '24H') timeLabel = `${i}:00`;
      else if (tf === '7D') timeLabel = `Day ${i + 1}`;
      else timeLabel = `Wk ${Math.floor(i / 7) + 1}`;

      points.push({
        time: timeLabel,
        price: parseFloat(price.toFixed(2)),
      });
    }
    // Anchor last point to current price
    points[points.length - 1].price = base;
    return points;
  };

  const [points, setPoints] = useState<PricePoint[]>(() => generateChartPoints('24H', 4.85));

  // Switch dataset when timeframe changes
  useEffect(() => {
    setPoints(generateChartPoints(timeframe, currentPrice));
  }, [timeframe]);

  // Live real-time price fluctuation between $4.00 and $6.00 (uper nichay ho)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        // Bias downward when nearing $5.90, bias upward when nearing $4.10
        let bias = 0.48;
        if (prev >= 5.80) bias = 0.70; // Push down
        if (prev <= 4.20) bias = 0.25; // Push up

        const delta = (Math.random() - bias) * 0.12;
        const newPrice = Math.min(5.95, Math.max(4.05, parseFloat((prev + delta).toFixed(2))));
        
        if (newPrice > prev) {
          setPriceDirection('up');
        } else if (newPrice < prev) {
          setPriceDirection('down');
        }

        // Update 24h high/low
        setHigh24h((h) => Math.max(h, newPrice));
        setLow24h((l) => Math.min(l, newPrice));

        // Update 24h change slightly
        setChange24h((c) => parseFloat((c + (delta > 0 ? 0.25 : -0.25)).toFixed(2)));

        // Update last point in chart
        setPoints((prevPoints) => {
          if (prevPoints.length === 0) return prevPoints;
          const updated = [...prevPoints];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            price: newPrice,
          };
          return updated;
        });

        return newPrice;
      });
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  // Compute SVG coordinates bound within trading range $4.00 - $6.00
  const minPrice = 3.90;
  const maxPrice = 6.10;
  const priceRange = maxPrice - minPrice;

  const svgWidth = 600;
  const svgHeight = 160;

  const getX = (index: number) => (index / (points.length - 1)) * (svgWidth - 20) + 10;
  const getY = (price: number) => svgHeight - 15 - ((price - minPrice) / priceRange) * (svgHeight - 35);

  // Build SVG smooth bezier path
  const pathD = points.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.price);
    if (index === 0) return `M ${x} ${y}`;
    const prevX = getX(index - 1);
    const prevY = getY(points[index - 1].price);
    const cpX1 = prevX + (x - prevX) / 2;
    const cpY1 = prevY;
    const cpX2 = prevX + (x - prevX) / 2;
    const cpY2 = y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points.length - 1)} ${svgHeight} L ${getX(0)} ${svgHeight} Z`;

  const lastPointX = getX(points.length - 1);
  const lastPointY = getY(points[points.length - 1].price);

  return (
    <div className="w-full max-w-3xl mb-6 bg-gradient-to-b from-[#18150d] via-[#100f0b] to-[#0a0907] border border-[#FFD700]/30 rounded-3xl p-4 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(255,215,0,0.1)] relative overflow-hidden">
      
      {/* Subtle top gold reflection */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/60 to-transparent" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-24 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Title, Live Ticker, and Timeframes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 border-b border-white/5 pb-4">
        
        {/* Left: Token and Live Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">CM / USDT</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Market
              </span>
            </div>
            <p className="text-[11px] text-gray-400">CM Network Official Rate</p>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-xl self-stretch sm:self-auto justify-between sm:justify-start">
          {(['1H', '24H', '7D', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-[#FFD700] to-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

      </div>

      {/* Price Display and 24h Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        
        {/* Current Fluctuating Price ($4 to $6) */}
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Price</span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight transition-colors duration-300 ${
              priceDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ${currentPrice.toFixed(2)}
            </span>
            <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
              change24h >= 0 
                ? 'bg-emerald-500/15 text-emerald-400' 
                : 'bg-rose-500/15 text-rose-400'
            }`}>
              {change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {change24h > 0 ? `+${change24h}%` : `${change24h}%`}
            </span>
          </div>
        </div>

        {/* 24h High */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[9px] font-bold text-gray-400 uppercase">24h High</span>
          <p className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">${high24h.toFixed(2)}</p>
        </div>

        {/* 24h Low */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[9px] font-bold text-gray-400 uppercase">24h Low</span>
          <p className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">${low24h.toFixed(2)}</p>
        </div>

        {/* 24h Volume */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[9px] font-bold text-gray-400 uppercase">24h Volume</span>
          <p className="text-xs sm:text-sm font-mono font-bold text-[#FFD700] mt-0.5">$4.85M USDT</p>
        </div>

      </div>

      {/* SVG Interactive Animated Chart */}
      <div className="relative w-full h-40 sm:h-44 bg-black/40 rounded-2xl border border-white/5 p-2 overflow-hidden">
        
        {/* Horizontal grid lines with $ labels */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
          <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
            <span>$6.00</span>
            <div className="border-b border-gray-500 border-dashed flex-1 mx-2" />
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
            <span>$5.00</span>
            <div className="border-b border-gray-500 border-dashed flex-1 mx-2" />
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
            <span>$4.00</span>
            <div className="border-b border-gray-500 border-dashed flex-1 mx-2" />
          </div>
        </div>

        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e5b332" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Glowing Stroke line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#strokeGradient)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow)"
          />

          {/* Live pulsing current price point */}
          <circle 
            cx={lastPointX} 
            cy={lastPointY} 
            r="6" 
            className="fill-emerald-400 animate-ping opacity-75" 
          />
          <circle 
            cx={lastPointX} 
            cy={lastPointY} 
            r="4.5" 
            className="fill-emerald-400 stroke-2 stroke-black" 
          />

          {/* Hover indicator point */}
          {hoveredPoint && (
            <circle 
              cx={getX(points.indexOf(hoveredPoint))} 
              cy={getY(hoveredPoint.price)} 
              r="5" 
              className="fill-[#FFD700] stroke-2 stroke-white" 
            />
          )}
        </svg>

        {/* Hover / Touch interaction points */}
        <div className="absolute inset-0 flex justify-between">
          {points.map((p, idx) => (
            <div
              key={idx}
              className="flex-1 h-full cursor-pointer hover:bg-white/[0.04] transition-colors"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </div>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-black/90 border border-[#FFD700]/50 text-white text-[11px] font-mono shadow-xl pointer-events-none z-20 flex items-center gap-2">
            <span className="text-gray-400">{hoveredPoint.time}:</span>
            <span className="text-[#FFD700] font-bold">${hoveredPoint.price.toFixed(2)}</span>
          </div>
        )}

      </div>

      {/* Bottom ticker bar */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 font-medium px-1">
        <span className="flex items-center gap-1.5 text-gray-300">
          <Clock className="w-3.5 h-3.5 text-[#FFD700]" /> Real-time tick frequency: 1.6s
        </span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Price Ticks Active
        </span>
      </div>

    </div>
  );
}
