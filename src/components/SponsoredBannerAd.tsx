import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

const NATIVE_AD_SCRIPT_URL = 'https://bauval.org/21/8104a131454213211f69be7621192500';
const NATIVE_AD_CONTAINER_ID = 'container-8104a131454213211f69be7621192500';

export function SponsoredBannerAd() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const existingContainer = document.getElementById(NATIVE_AD_CONTAINER_ID);
    if (existingContainer) {
      existingContainer.innerHTML = '';
    }

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = NATIVE_AD_SCRIPT_URL;
    host.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      const container = document.getElementById(NATIVE_AD_CONTAINER_ID);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-2 flex flex-col items-center gap-3">
      {/* Ad 1: Native / Async Container Ad */}
      <div
        ref={hostRef}
        className="w-full max-w-[748px] rounded-2xl bg-black/40 border border-white/10 p-3 flex flex-col items-center"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-bold mb-2 self-start px-1">
          Sponsored
        </span>
        <div
          id={NATIVE_AD_CONTAINER_ID}
          className="w-full flex justify-center items-center min-h-[50px]"
        />
      </div>

      {/* Ad 2: Sponsored Direct Link */}
      <a
        href={NATIVE_AD_SCRIPT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-[748px] rounded-2xl bg-gradient-to-r from-[#141208] via-black/60 to-[#141208] border border-[#FFD700]/20 hover:border-[#FFD700]/50 px-4 py-3 flex items-center justify-between gap-3 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white truncate">Featured Partner Offer</p>
            <p className="text-[10px] text-gray-400 truncate">Sponsored Network Highlight • Tap to explore</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#FFD700]/15 group-hover:bg-[#FFD700] text-[#FFD700] group-hover:text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0">
          <span>Visit</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      </a>
    </div>
  );
}
