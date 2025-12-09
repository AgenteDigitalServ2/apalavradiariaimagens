
import React, { useState, useEffect } from 'react';
import { VerseResult } from '../types';
import { shareVerse } from '../services/shareService';
import { getFallbackImage } from '../services/geminiService';

interface ResultCardProps {
  result: VerseResult;
  onClose?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClose, onToggleFavorite, onDelete }) => {
  const { verseText, verseReference, explanation, imageUrl, isFavorite } = result;
  
  const [visualState, setVisualState] = useState<'loading' | 'loaded' | 'fallback' | 'gradient'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setVisualState('loading');
    
    if (imageUrl) {
        setCurrentSrc(imageUrl);
    } else {
        setCurrentSrc(getFallbackImage());
        setVisualState('fallback'); 
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setVisualState('loaded');
  };

  const handleImageError = () => {
    console.warn("Image failed to load in ResultCard.");
    
    if (visualState === 'loading' || visualState === 'loaded') {
        console.log("Switching to fallback image.");
        setCurrentSrc(getFallbackImage());
        setVisualState('fallback');
    } else if (visualState === 'fallback') {
        console.warn("Fallback image also failed. Switching to gradient.");
        setVisualState('gradient');
    }
  };
  
  const handleShare = () => {
    const itemToShare = visualState === 'gradient' 
        ? { ...result, imageUrl: getFallbackImage() } 
        : { ...result, imageUrl: currentSrc || '' };
        
    shareVerse(itemToShare, setIsSharing);
  };
  
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-w-md mx-auto relative group">
      
      {/* Top Actions Bar */}
      <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
             {onToggleFavorite && (
                  <button
                      onClick={onToggleFavorite}
                      className="p-2 bg-black/40 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-md border border-white/10"
                      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                      {isFavorite ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 fill-current" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                      )}
                  </button>
             )}
          </div>

          <div className="flex gap-2 pointer-events-auto">
              {onDelete && (
                  <button
                      onClick={onDelete}
                      className="p-2 bg-black/40 rounded-full text-red-400 hover:bg-red-900/80 hover:text-red-200 transition-colors backdrop-blur-md border border-white/10"
                      aria-label="Excluir da galeria"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                  </button>
              )}
              
              {onClose && (
                <button 
                  onClick={onClose} 
                  className="p-2 bg-black/40 rounded-full text-white hover:bg-black/70 transition-colors backdrop-blur-md border border-white/10"
                  aria-label="Fechar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
          </div>
      </div>
      
      <div className="aspect-[9/16] bg-gray-800 relative w-full group">
        {visualState === 'gradient' ? (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-black to-purple-900 flex items-center justify-center p-6">
                 <div className="text-center mb-20">
                    <div className="mb-4 inline-block p-4 rounded-full bg-white/10 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-200 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                    </div>
                    <p className="text-teal-100/50 text-sm font-medium tracking-widest uppercase">Inspiração Divina</p>
                 </div>
            </div>
        ) : (
             currentSrc && (
                <img 
                    src={currentSrc} 
                    alt="Ilustração inspiradora" 
                    className={`w-full h-full object-cover transition-opacity duration-700 ${visualState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            )
        )}
        
        {visualState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gray-900 z-10">
            <div className="border-gray-600 h-10 w-10 animate-spin rounded-full border-4 border-t-teal-400 mb-3" />
            <p className="text-gray-400 text-sm tracking-wide animate-pulse">
                Criando arte sacra...
            </p>
          </div>
        )}

        {/* Text Overlay - Visible on top of image */}
        <div className="absolute inset-x-0 bottom-0 p-6 pb-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-32 flex flex-col justify-end text-center z-10">
            <blockquote className="text-xl lg:text-2xl font-medium italic text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-relaxed font-serif">
                "{verseText}"
            </blockquote>
            <cite className="text-teal-300 font-bold not-italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-lg">
                - {verseReference}
            </cite>
        </div>
      </div>

      <div className="p-6 relative bg-gray-900">
        <p className="text-gray-300 mb-6 leading-relaxed text-sm sm:text-base border-l-2 border-teal-500/30 pl-4 italic">
            {explanation}
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={handleShare}
            disabled={visualState === 'loading' || isSharing}
            className="group relative bg-white text-black font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(94,234,212,0.4)] hover:bg-teal-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <div className="flex items-center gap-2 relative z-10">
                {isSharing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Preparando...</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 group-hover:text-teal-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span>Compartilhar Benção</span>
                    </>
                )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
