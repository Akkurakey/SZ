
import React, { useState, useRef, useEffect } from 'react';
import { CRTEffects, NoiseOverlay } from './CRTEffects';

interface TVSetProps {
  children: React.ReactNode;
  isProcessing: boolean;
  onReset: () => void;
  showReset: boolean;
}

export const TVSet: React.FC<TVSetProps> = ({ children, isProcessing, onReset, showReset }) => {
  const [powerLightState, setPowerLightState] = useState<'off' | 'on' | 'processing'>('off');

  useEffect(() => {
    if (isProcessing) {
      setPowerLightState('processing');
    } else {
      setPowerLightState('on');
    }
  }, [isProcessing]);

  return (
    <div className="relative flex flex-col items-center w-full max-w-[800px]">
      {/* Main Chassis - Adjusted padding for mobile */}
      <div className="relative w-full aspect-[4/3] bg-[#1a1a1a] p-3 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[30px] border-4 sm:border-8 border-[#333] shadow-[inset_0_0_20px_#000,0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Screen Container */}
        <div className="relative w-full h-full bg-[#050505] rounded-[20px] sm:rounded-[40px] overflow-hidden border-2 sm:border-4 border-[#111] shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
           <CRTEffects />
           <NoiseOverlay active={isProcessing} />
           
           {/* Screen Content */}
           <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2 sm:p-6">
             {children}
           </div>
        </div>

        {/* Power Light */}
        <div className={`
          absolute bottom-3 right-6 sm:bottom-4 sm:right-8 md:bottom-6 md:right-12 w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 shadow-[0_0_2px_#000]
          ${powerLightState === 'on' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : ''}
          ${powerLightState === 'processing' ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b] animate-pulse' : ''}
          ${powerLightState === 'off' ? 'bg-[#333]' : ''}
        `} />
        
        {/* Branding */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-[#444] font-sans text-[10px] sm:text-xs tracking-[0.2em] opacity-50 pointer-events-none whitespace-nowrap">
          SONY TRINITRON
        </div>
      </div>
      
      {/* Instruction Text (Long Press) - Always Rendered but Opacity Toggled */}
      {/* Added min-h to prevent layout shift, moved closer to TV */}
      <div className={`
        mt-4 sm:mt-6 text-[#86efac] text-opacity-70 text-[10px] sm:text-xs md:text-sm tracking-widest transition-opacity duration-500 font-light text-center w-full px-4
        ${showReset ? 'opacity-100' : 'opacity-0'}
      `}>
        [ RIGHT CLICK / LONG PRESS TO SAVE IMAGE ]
      </div>
    </div>
  );
};
