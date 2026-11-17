import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

const BANNER_AD_SRC_DOC = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <base target="_blank" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 728px;
        height: 90px;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script>
      atOptions = {
        'key' : '5a2a6bc252f949f047b564163010e8a5',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    </script>
    <script src="https://bauval.org/22/5a2a6bc252f949f047b564163010e8a5"></script>
  </body>
</html>`;

export function SponsoredBannerAd() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-8 px-2 flex flex-col items-center gap-3">
      <div className="w-full max-w-[748px] rounded-2xl bg-black/40 border border-white/10 p-2 overflow-x-auto scrollbar-hide flex flex-col items-center">
        <span className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-bold mb-1.5 self-start px-1">
          Sponsored
        </span>
        <div className="w-[728px] h-[90px] mx-auto shrink-0 rounded-lg overflow-hidden bg-black/20">
          <iframe
            title="Sponsored Banner"
            srcDoc={BANNER_AD_SRC_DOC}
            width={728}
            height={90}
            scrolling="no"
            frameBorder={0}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-same-origin"
            className="w-[728px] h-[90px] border-0 block"
          />
        </div>
      </div>

      {/* Extra Sponsored Partner Link */}
      <a
        href="https://araplhn.org/4/a6284cca79326b8b45f522cad8bae99f"
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
