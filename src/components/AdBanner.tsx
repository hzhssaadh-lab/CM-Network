import React, { useEffect, useRef } from 'react';

export const AdBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    
    // Clear previous ad if re-rendered
    bannerRef.current.innerHTML = '';

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.text = `
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
    script.src = 'https://cabinetavidgrasp.com/5a2a6bc252f949f047b564163010e8a5/invoke.js';

    bannerRef.current.appendChild(conf);
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center my-4 w-full overflow-hidden max-w-full">
      <div ref={bannerRef} className="w-full flex justify-center max-w-full overflow-x-auto" />
    </div>
  );
};
