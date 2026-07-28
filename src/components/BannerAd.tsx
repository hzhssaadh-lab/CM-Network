import { useEffect, useRef } from 'react';

export function BannerAd() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: transparent;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            var atOptions = {
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

    iframeRef.current.srcdoc = htmlContent;
  }, []);

  return (
    <div className="my-4 flex justify-center items-center overflow-hidden w-full bg-black/30 border border-white/5 rounded-2xl p-2 min-h-[105px]">
      <iframe
        ref={iframeRef}
        title="Banner Advertisement"
        width="728"
        height="90"
        className="max-w-full border-0 overflow-hidden"
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
