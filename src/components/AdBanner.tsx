import React, { useEffect, useRef } from 'react';

export const AdBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    
    // Clear previous if any
    bannerRef.current.innerHTML = '';

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.innerHTML = `
      atOptions = {
        'key' : '5a2a6bc252f949f047b564163010e8a5',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/5a2a6bc252f949f047b564163010e8a5/invoke.js';

    bannerRef.current.appendChild(conf);
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden">
      <div ref={bannerRef} className="min-h-[90px] w-full max-w-[728px] flex justify-center items-center bg-gray-900 rounded-lg"></div>
    </div>
  );
};
