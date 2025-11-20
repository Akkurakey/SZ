
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TVSet } from './components/TVSet';
import { generateDreamText, constructImageURL, preloadImage } from './services/geminiService';

// Using a reliable source for Gymnopedie No 1.
const AUDIO_URL = "https://upload.wikimedia.org/wikipedia/commons/3/35/Gymnopedie_No_1.ogg";

const App: React.FC = () => {
  // State
  const [stage, setStage] = useState<'input' | 'generating' | 'viewing'>('input');
  const [inputs, setInputs] = useState({ k1: '', k2: '', k3: '' });
  const [result, setResult] = useState({ imgUrl: '', text: '' });
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Effect to manage audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // CORE LOGIC: Handle start to ensure no gap between noise and image
  const startProtocol = async () => {
    // 1. User Interaction Trigger (Required for Audio)
    if (audioRef.current) {
      // Reset time to 0 if it ended
      if(audioRef.current.ended) audioRef.current.currentTime = 0;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Audio autoplay blocked or failed:", error);
        });
      }
    }

    // 2. Switch UI to "generating" (shows noise)
    setStage('generating');

    const keywords = [
      inputs.k1 || 'pool', 
      inputs.k2 || 'clouds', 
      inputs.k3 || 'empty'
    ];

    try {
      // 3. Parallel Execution: Generate Text AND Load Image
      const imgUrl = constructImageURL(keywords);

      const [textResult] = await Promise.all([
        generateDreamText(keywords), 
        preloadImage(imgUrl)
      ]);

      // 4. Set Data immediately after preload
      // The Result View opacity is controlled by showResultContent.
      // We set this state, which makes the result visible BEHIND the active noise.
      setResult({
        imgUrl: imgUrl,
        text: textResult
      });

      // 5. Wait a moment while image is rendered behind noise, then fade noise out.
      // Increased delay slightly to ensure DOM paint is complete.
      setTimeout(() => {
         setStage('viewing');
      }, 500);

    } catch (error) {
      console.error("Protocol failure:", error);
      setStage('input');
    }
  };

  const resetProtocol = useCallback(() => {
    setStage('generating'); // Briefly show noise
    
    setTimeout(() => {
      setInputs({ k1: '', k2: '', k3: '' });
      setStage('input');
      setResult({ imgUrl: '', text: '' });
    }, 600);
  }, []);

  // Show result if viewing OR if generating but we already have the image loaded
  const showResultContent = stage === 'viewing' || (stage === 'generating' && result.imgUrl !== '');

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-4 overflow-y-auto overflow-x-hidden select-none font-vt323">
      <audio 
        ref={audioRef} 
        src={AUDIO_URL} 
        loop 
        preload="auto" 
      />
      
      <TVSet 
        isProcessing={stage === 'generating'} 
        onReset={resetProtocol}
        showReset={showResultContent}
      >
        
        {/* INPUT VIEW */}
        <div 
          className={`
            absolute inset-0 flex flex-col items-center justify-center text-[#86efac] transition-opacity duration-500 z-20
            ${stage === 'input' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-8 text-center tracking-widest text-strong-glow animate-rgb-split">
            // SAFE ZONE PROTOCOL
          </h1>
          
          <div className="mb-4 sm:mb-6 opacity-90 text-base sm:text-lg md:text-xl font-light text-glow tracking-wider">
            INPUT 3 MEMORIES (KEYWORDS)
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-10 w-full max-w-lg px-2">
            {['k1', 'k2', 'k3'].map((key, idx) => (
              <input
                key={key}
                name={key}
                type="text"
                maxLength={15}
                placeholder={['Pool', 'Sunset', 'Empty'][idx]}
                value={inputs[key as keyof typeof inputs]}
                onChange={handleInputChange}
                className="bg-transparent border-b-2 border-[#86efac] text-[#86efac] text-center text-lg sm:text-xl md:text-2xl w-24 sm:w-28 md:w-32 py-1 sm:py-2 focus:outline-none focus:border-[#bef264] placeholder-[#86efac]/30 text-glow transition-all duration-300"
                autoComplete="off"
              />
            ))}
          </div>

          <button 
            onClick={startProtocol}
            className="px-6 sm:px-8 py-2 sm:py-3 border-2 border-[#86efac] text-[#86efac] text-lg sm:text-xl md:text-2xl tracking-widest hover:bg-[#86efac] hover:text-black hover:shadow-[0_0_20px_#86efac] transition-all duration-300 active:scale-95 text-glow animate-text-flicker"
          >
            INITIALIZE
          </button>
        </div>

        {/* RESULT VIEW */}
        <div 
          className={`
            absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-500
            ${showResultContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          {/* Image: Using pointer-events-auto to ensure long-press works on mobile */}
          {result.imgUrl && (
            <img 
              src={result.imgUrl} 
              alt="Generated Memory" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-auto filter sepia-[0.3] contrast-[1.1] brightness-[0.85] saturate-[0.8]"
            />
          )}

          {/* Text Overlay */}
          <div className="relative z-20 mt-auto mb-8 sm:mb-16 px-4 sm:px-8 text-center w-full">
            <p className="text-xl sm:text-2xl md:text-3xl text-[#86efac] animate-float drop-shadow-[2px_2px_0px_#000] shadow-black font-bold leading-relaxed text-strong-glow">
              {result.text}
            </p>
          </div>

          <button 
            onClick={resetProtocol}
            className="relative z-20 mb-4 sm:mb-8 bg-black/60 border border-[#86efac] text-[#86efac] px-4 py-1 text-sm sm:text-base hover:bg-[#86efac] hover:text-black transition-colors backdrop-blur-sm text-glow"
          >
            [ WAKE UP ]
          </button>
        </div>
      </TVSet>
    </div>
  );
};

export default App;
