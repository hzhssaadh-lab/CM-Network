import React, { useEffect, useRef } from 'react';
import { useApp } from '../hooks/useAppStore';

export const AdBanner = () => {
  const { adSettings } = useApp();
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    
    // Clear previous ad if re-rendered
    bannerRef.current.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.width = "100%";
    iframe.height = "90";
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.maxWidth = '100%';
    iframe.scrolling = "no";
    
    if (adSettings?.adsterraSnippet) {
      iframe.srcdoc = `
        <html>
          <head>
            <style>body { margin: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
          </head>
          <body>
            ${adSettings.adsterraSnippet}
          </body>
        </html>
      `;
    } else {
      iframe.srcdoc = `
        <html>
          <head>
            <style>body { margin: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }</style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '5a2a6bc252f949f047b564163010e8a5',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://cabinetavidgrasp.com/5a2a6bc252f949f047b564163010e8a5/invoke.js"></script>
          </body>
        </html>
      `;
    }
    
    bannerRef.current.appendChild(iframe);
  }, [adSettings?.adsterraSnippet]);

  return (
    <div className="flex justify-center my-4 w-full overflow-hidden max-w-full min-h-[90px]">
      <div ref={bannerRef} className="w-full flex justify-center max-w-full overflow-hidden" />
    </div>
  );
};

