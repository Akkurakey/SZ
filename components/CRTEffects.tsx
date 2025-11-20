import React from 'react';

export const CRTEffects: React.FC = () => {
  return (
    <>
      {/* Scanlines - pointer-events-none allows clicks to pass through to the image */}
      <div className="absolute inset-0 z-30 pointer-events-none animate-scanline opacity-50 rounded-[40px]" />
      
      {/* Flicker */}
      <div className="absolute inset-0 z-30 pointer-events-none animate-flicker bg-white/5 rounded-[40px]" />
      
      {/* Vignette Shadow */}
      <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] rounded-[40px]" />
    </>
  );
};

interface NoiseProps {
  active: boolean;
}

export const NoiseOverlay: React.FC<NoiseProps> = ({ active }) => {
  const noiseSvg = `data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="1"/%3E%3C/svg%3E`;

  return (
    <div 
      className={`
        absolute inset-0 z-40 w-full h-full pointer-events-none transition-opacity duration-300 ease-in-out rounded-[40px]
        ${active ? 'opacity-80 animate-noise' : 'opacity-0'}
      `}
      style={{ backgroundImage: `url('${noiseSvg}')` }}
    />
  );
};