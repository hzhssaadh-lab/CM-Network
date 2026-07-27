import React from 'react';

export const AdBanner: React.FC = () => {
  return (
    <div className="w-full flex justify-center items-center my-4 overflow-x-auto">
      <div className="min-w-[728px] flex justify-center items-center">
        <iframe
          title="Advertisement"
          src="/adsterra-banner.html"
          width="728"
          height="90"
          className="border-0 overflow-hidden bg-gray-900/40 rounded-xl"
          scrolling="no"
        />
      </div>
    </div>
  );
};


