import React, { useEffect, useRef } from 'react';
import { useApp } from '../hooks/useAppStore';

interface AdDisplayProps {
  className?: string;
  type?: 'banner' | 'rectangle';
}

export function AdDisplay({ className = '', type = 'banner' }: AdDisplayProps) {
  const { adSettings } = useApp();
  const admobLoaded = useRef(false);

  useEffect(() => {
    if (adSettings?.showAds && adSettings.admobBannerId && !admobLoaded.current) {
      admobLoaded.current = true;
      const timeoutId = setTimeout(() => {
        try {
          ;(window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        } catch (e: any) {
          if (!e.message?.includes('already have ads')) {
            console.error('AdSense error:', e.message || e);
          }
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [adSettings]);

  if (!adSettings?.showAds) {
    return null;
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-4 my-4 ${className}`}>
      {adSettings.adsterraSnippet && (
        <div className="w-full overflow-hidden flex justify-center items-center" style={{ minHeight: type === 'banner' ? '60px' : '250px' }}>
          <iframe
            title="Adsterra"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head><title>Advertisement</title></head>
                <body style="margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;">
                  ${adSettings.adsterraSnippet.replace(/src="\/\//g, 'src="https://').replace(/href="\/\//g, 'href="https://')}
                </body>
              </html>
            `}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
            scrolling="no"
          />
        </div>
      )}

      {adSettings.admobBannerId && (
         <div className="w-full overflow-hidden flex justify-center" style={{ minWidth: 250, minHeight: 50 }}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '50px' }}
            data-ad-client="ca-app-pub-2188880193328580"
            data-ad-slot={adSettings.admobBannerId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  );
}
