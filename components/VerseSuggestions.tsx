import React from 'react';
import { VerseSuggestion } from '../types';

interface VerseSuggestionsProps {
  suggestions: VerseSuggestion[];
  onSelect: (verse: VerseSuggestion) => void;
  theme: string;
}

const VerseSuggestions: React.FC<VerseSuggestionsProps> = ({ suggestions, onSelect, theme }) => {
  return (
    <div className="w-full bg-gray-900/50 p-6 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in max-h-[600px] flex flex-col">
      <h3 className="text-xl font-bold text-center mb-1 flex-shrink-0">
        {theme.includes('Livro') || !isNaN(Number(theme)) ? 'Selecione um Versículo' : `Sugestões para "${theme}"`}
      </h3>
      <p className="text-gray-400 text-center mb-4 flex-shrink-0">Escolha um versículo para gerar sua imagem e explicação.</p>
      
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {suggestions.map((verse, index) => (
          <div
            key={index}
            onClick={() => onSelect(verse)}
            className="p-4 bg-gray-800/60 border border-gray-700 rounded-lg cursor-pointer hover:bg-teal-900/50 hover:border-teal-500 transition-all duration-200"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(verse)}
            role="button"
            aria-label={`Selecionar versículo: ${verse.verseReference}`}
          >
            <p className="italic text-white">"{verse.verseText}"</p>
            <p className="text-right font-semibold text-teal-400 mt-1">- {verse.verseReference}</p>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2dd4bf; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #14b8a6; 
        }
      `}</style>
    </div>
  );
};

export default VerseSuggestions;