import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const OFFICIAL_SOCIALS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    handle: 'CM Network Official Channel',
    actionText: 'Join Channel',
    url: 'https://whatsapp.com/channel/0029Vb92OHY6BIEm6VDrL82g',
    brandColor: '#25D366',
    bgGradient: 'from-[#25D366]/15 via-[#25D366]/5 to-transparent',
    borderColor: 'border-[#25D366]/30 hover:border-[#25D366]/80',
    shadowColor: 'hover:shadow-[0_0_25px_rgba(37,211,102,0.25)]',
    iconBg: 'bg-[#25D366]/10 text-[#25D366]',
    icon: (
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.5C9.36 7.5 9.09 7.57 8.87 7.8C8.65 8.04 8.04 8.61 8.04 9.77C8.04 10.93 8.88 12.05 9 12.21C9.12 12.37 10.63 14.82 13.01 15.75C14.98 16.53 15.38 16.37 15.82 16.33C16.26 16.29 17.24 15.75 17.44 15.18C17.65 14.61 17.65 14.13 17.59 14.02C17.52 13.92 17.35 13.86 17.1 13.73C16.85 13.61 15.61 13 15.38 12.91C15.15 12.83 14.98 12.79 14.81 13.04C14.64 13.29 14.16 13.86 14.01 14.02C13.87 14.19 13.72 14.21 13.47 14.08C13.22 13.96 12.43 13.7 11.49 12.86C10.75 12.2 10.26 11.39 10.12 11.14C9.97 10.89 10.1 10.76 10.23 10.63C10.34 10.52 10.48 10.34 10.61 10.19C10.74 10.04 10.79 9.94 10.87 9.77C10.95 9.61 10.91 9.46 10.85 9.34C10.79 9.22 10.29 8 10.08 7.5" />
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X',
    handle: '@cmnetwork112',
    actionText: 'Follow on X',
    url: 'https://x.com/cmnetwork112',
    brandColor: '#FFFFFF',
    bgGradient: 'from-white/15 via-white/5 to-transparent',
    borderColor: 'border-white/20 hover:border-white/70',
    shadowColor: 'hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]',
    iconBg: 'bg-white/10 text-white',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'telegram',
    name: 'Telegram',
    handle: '@OfficialCMNetwork',
    actionText: 'Join Group',
    url: 'https://t.me/OfficialCMNetwork',
    brandColor: '#0088cc',
    bgGradient: 'from-[#0088cc]/15 via-[#0088cc]/5 to-transparent',
    borderColor: 'border-[#0088cc]/30 hover:border-[#0088cc]/80',
    shadowColor: 'hover:shadow-[0_0_25px_rgba(0,136,204,0.25)]',
    iconBg: 'bg-[#0088cc]/10 text-[#0088cc]',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    ),
  },
];

interface SocialChannelsProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function SocialChannels({
  title = "Official Community & Channels",
  subtitle = "Stay updated on Phase 2 contract release, liquidity pools & mining engine",
  compact = false,
}: SocialChannelsProps) {
  return (
    <div className="w-full pt-4">
      {/* Header divider */}
      <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-white/30 flex-1" />
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px] uppercase tracking-[0.2em] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFD700]" />
          <span>{title}</span>
        </div>
        <div className="h-px bg-gradient-to-l from-transparent via-white/20 to-white/30 flex-1" />
      </div>

      {subtitle && (
        <p className="text-gray-400 text-xs text-center mb-4 max-w-md mx-auto">
          {subtitle}
        </p>
      )}

      {/* The 3 Official Options: WhatsApp, X, Telegram */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        {OFFICIAL_SOCIALS.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative bg-gradient-to-b ${item.bgGradient} bg-[#0D0D0D] border ${item.borderColor} ${item.shadowColor} rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] text-left overflow-hidden`}
          >
            {/* Top row: Icon + Platform Name + Badge */}
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl ${item.iconBg} border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-base sm:text-lg tracking-tight group-hover:text-white transition-colors flex items-center gap-1.5">
                    {item.name}
                  </h4>
                  <p className="text-gray-400 text-[11px] font-medium tracking-wide">
                    {item.handle}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>

            {/* Bottom action bar */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: item.brandColor }}
                />
                Official Verified
              </span>
              <span
                className="text-xs font-black px-3 py-1 rounded-lg border transition-all duration-200"
                style={{
                  color: item.brandColor,
                  borderColor: `${item.brandColor}40`,
                  backgroundColor: `${item.brandColor}15`,
                }}
              >
                {item.actionText} →
              </span>
            </div>

            {/* Subtle corner light */}
            <div
              className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: item.brandColor }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
