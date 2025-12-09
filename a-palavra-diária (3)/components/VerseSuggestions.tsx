import React from 'react';
import { VerseSuggestion } from '../types';

interface VerseSuggestionsProps {
  suggestions: VerseSuggestion[];
  onSelect: (verse: VerseSuggestion) => void;
  theme: string;
}

const VerseSuggestions: React.FC<VerseSuggestionsProps> = ({ suggestions, onSelect, theme }) => {
  return (
    <div className="w-full bg-gray-900/50 p-6 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in">
      <h3 className="text-xl font-bold text-center mb-1">Sugestões para "{theme}"</h3>
      <p className="text-gray-400 text-center mb-4">Escolha um versículo para gerar sua imagem e explicação.</p>
      <div className="space-y-3">
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
    </div>
  );
};

export default VerseSuggestions;
