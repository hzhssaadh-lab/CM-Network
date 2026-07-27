import React from 'react';

export const AdBanner: React.FC = () => {
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            background: transparent; 
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
        <script type="text/javascript" src="https://www.highperformanceformat.com/5a2a6bc252f949f047b564163010e8a5/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="w-full flex justify-center items-center my-4 overflow-x-auto">
      <div className="min-w-[728px] flex justify-center items-center">
        <iframe
          title="Advertisement"
          srcDoc={iframeContent}
          width="728"
          height="90"
          className="border-0 overflow-hidden bg-gray-900/40 rounded-xl"
          scrolling="no"
        />
      </div>
    </div>
  );
};

