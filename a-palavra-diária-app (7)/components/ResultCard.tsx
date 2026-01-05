
import React, { useState, useEffect } from 'react';
import { VerseResult } from '../types';
import { shareVerse } from '../services/shareService';

interface ResultCardProps {
  result: VerseResult;
  onClose?: () => void;
  onDelete?: (id: string) => void;
  onRegenerateImage?: (result: VerseResult) => Promise<void>;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClose, onDelete, onRegenerateImage }) => {
  const { verseText, verseReference, explanation, imageUrl, id } = result;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [imageUrl]);
  
  const handleShare = () => {
    if (!imageUrl) return;
    shareVerse(result, setIsSharing);
  };

  const handleRegenerate = async () => {
    if (onRegenerateImage) {
      setIsRegenerating(true);
      try {
        await onRegenerateImage(result);
      } finally {
        setIsRegenerating(false);
      }
    }
  };
  
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-w-md mx-auto relative group">
      {onDelete && (
          <button 
            onClick={() => onDelete(id)} 
            className="absolute top-2 left-2 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-red-700/80 transition-colors"
            aria-label="Excluir da Galeria"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
      )}
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Container da Imagem + Texto Sobreposto */}
      <div className="relative aspect-[9/16] bg-gray-800">
        {(imageUrl && !isRegenerating) ? (
          <>
            <img 
              src={imageUrl} 
              alt="AI generated illustration" 
              className="w-full h-full object-cover" 
              onLoad={() => setIsImageLoaded(true)}
            />
            {/* Overlay Escuro para Legibilidade */}
            <div className={`absolute inset-0 bg-black/30 transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* Texto Sobreposto */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
               <blockquote className="font-dancing-script text-3xl sm:text-4xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-relaxed mb-4">
                "{verseText}"
              </blockquote>
              <cite className="text-white/90 text-sm sm:text-base font-bold uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] not-italic">
                — {verseReference} —
              </cite>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="border-gray-500 h-8 w-8 animate-spin rounded-full border-4 border-t-teal-400" />
            <p className="text-gray-400 mt-3">{isRegenerating ? 'Trocando imagem...' : 'Gerando imagem...'}</p>
          </div>
        )}
      </div>

      {/* Área de Explicação e Ações (Abaixo da imagem) */}
      <div className="p-6 bg-gray-900 border-t border-gray-800">
        <p className="text-gray-300 mb-6 text-sm leading-relaxed text-justify border-l-2 border-teal-500 pl-4">
          {explanation}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleRegenerate}
            disabled={!isImageLoaded || isSharing || isRegenerating || !onRegenerateImage}
            className="bg-gray-800 text-teal-400 font-bold py-3 px-2 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed border border-teal-900/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm">Trocar Imagem</span>
          </button>

          <button 
            onClick={handleShare}
            disabled={!isImageLoaded || isSharing || isRegenerating}
            className="bg-white text-black font-bold py-3 px-2 rounded-full shadow-lg hover:bg-teal-400 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
          >
            {isSharing ? (
                <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm">Criando...</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    <span className="text-xs sm:text-sm">Compartilhar</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
