import { useEffect, useRef } from 'react';

export function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous elements to avoid duplicate injections
    containerRef.current.innerHTML = '';

    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : '5a2a6bc252f949f047b564163010e8a5',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://cabinetavidgrasp.com/5a2a6bc252f949f047b564163010e8a5/invoke.js';

    containerRef.current.appendChild(confScript);
    containerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div className="my-4 flex justify-center items-center overflow-hidden w-full bg-black/30 border border-white/5 rounded-2xl p-2 min-h-[100px]">
      <div ref={containerRef} className="max-w-full overflow-x-auto flex justify-center items-center" />
    </div>
  );
}
