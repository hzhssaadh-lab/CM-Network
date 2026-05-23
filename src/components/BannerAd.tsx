import { useEffect, useRef } from 'react';

interface BannerAdProps {
  slot: string;
  className?: string;
}

export function BannerAd({ slot, className = '' }: BannerAdProps) {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current) return;
    adLoaded.current = true;
    
    const timeoutId = setTimeout(() => {
      try {
        ;(window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e: any) {
        if (!e.message?.includes('already have ads')) {
          console.error('AdSense error:', e.message || e);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`} style={{ minWidth: 250, minHeight: 50 }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '50px' }}
        data-ad-client="ca-app-pub-2188880193328580"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
