
import React, { useState, useCallback, useEffect } from 'react';
import { VerseResult, VerseSuggestion } from '../types';
import { 
  generateVerseSuggestions, 
  generateExplanationForVerse, 
  generateImage, 
  generateRandomVerseSuggestion, 
  getRandomFallbackVerse, 
  getFallbackImage,
  getDynamicFallbackImage 
} from '../services/geminiService';
import Logo from './Logo';
import ResultCard from './ResultCard';
import Spinner from './Spinner';
import BottomNav from './BottomNav';
import GalleryScreen from './GalleryScreen';
import VerseSuggestionsComponent from './VerseSuggestions';

const predefinedThemes = ['Fé', 'Esperança', 'Amor', 'Gratidão', 'Paz', 'Força'];

type GenerationStep = 'idle' | 'suggesting' | 'generating';

// Simple UUID generator for browser environments
const generateUUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const MainScreen: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerseResult | null>(null);
  const [galleryItems, setGalleryItems] = useState<VerseResult[]>([]);
  const [activeView, setActiveView] = useState<'main' | 'gallery'>('main');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<VerseResult | null>(null);
  const [verseSuggestions, setVerseSuggestions] = useState<VerseSuggestion[] | null>(null);

  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseResult | null>(null);
  const [isVerseOfTheDayLoading, setIsVerseOfTheDayLoading] = useState<boolean>(true);


  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('galleryItems');
      if (storedItems) {
        const parsed = JSON.parse(storedItems);
        // Migration: Add ID and Date if missing for old items
        const migrated = parsed.map((item: any) => ({
            ...item,
            id: item.id || generateUUID(),
            createdAt: item.createdAt || Date.now(),
            isFavorite: item.isFavorite || false
        }));
        setGalleryItems(migrated);
      }
    } catch (error) {
      console.error("Failed to load gallery items from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    } catch (error) {
      console.error("Failed to save gallery items to localStorage", error);
    }
  }, [galleryItems]);

  // Handle Favoriting
  const toggleFavorite = useCallback((id: string) => {
    setGalleryItems(prev => prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
    
    // Also update current views if applicable
    if (result && result.id === id) {
        setResult(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    if (verseOfTheDay && verseOfTheDay.id === id) {
        setVerseOfTheDay(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    if (selectedGalleryItem && selectedGalleryItem.id === id) {
        setSelectedGalleryItem(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  }, [result, verseOfTheDay, selectedGalleryItem]);

  // Handle Deletion
  const deleteItem = useCallback((id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este versículo da sua galeria?")) {
        setGalleryItems(prev => prev.filter(item => item.id !== id));
        
        if (selectedGalleryItem && selectedGalleryItem.id === id) {
            setSelectedGalleryItem(null);
        }
        if (result && result.id === id) {
            // If deleting the one currently just generated, maybe just clear it or leave it visually but removed from storage?
            // Let's clear it to indicate deletion.
            setResult(null);
        }
    }
  }, [selectedGalleryItem, result]);

  const fetchVerseOfTheDay = useCallback(async () => {
    setIsVerseOfTheDayLoading(true);
    
    const today = new Date().toISOString().split('T')[0];

    try {
      const verseSuggestion = await generateRandomVerseSuggestion();
      const explanationPromise = generateExplanationForVerse(verseSuggestion.verseText, verseSuggestion.verseReference);
      
      const safeImagePrompt = `Paisagem natural serena para versículo bíblico.`;
      
      const imagePromise = generateImage(safeImagePrompt)
        .catch(async e => {
          console.warn("Verse of the Day image generation failed, using dynamic fallback.", e);
          // Use Pexels for high quality fallback
          return await getDynamicFallbackImage("peaceful nature landscape");
        });

      const [explanation, imageUrl] = await Promise.all([explanationPromise, imagePromise]);
      const finalResult: VerseResult = { 
          id: generateUUID(),
          ...verseSuggestion, 
          explanation, 
          imageUrl, 
          isFavorite: false, 
          createdAt: Date.now() 
      };
      
      setVerseOfTheDay(finalResult);
      localStorage.setItem('verseOfTheDay', JSON.stringify({ verse: finalResult, date: today }));

    } catch (err) {
      console.error("Failed to generate Verse of the Day via AI, using robust fallback.", err);
      const fallbackResult = getRandomFallbackVerse();
      
      // Attempt to get a fresh dynamic image even for the fallback verse content
      try {
         fallbackResult.imageUrl = await getDynamicFallbackImage("nature");
      } catch(e) {
         console.warn("Dynamic fallback failed, using static.", e);
         // imageUrl is already set in getRandomFallbackVerse as a static Unsplash link, so we are good
      }
      
      // Assign new ID for this session
      fallbackResult.id = generateUUID();
      
      setVerseOfTheDay(fallbackResult);
      localStorage.setItem('verseOfTheDay', JSON.stringify({ verse: fallbackResult, date: today }));
    } finally {
      setIsVerseOfTheDayLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadVerseOfTheDay = () => {
        try {
            const storedData = localStorage.getItem('verseOfTheDay');
            if (storedData) {
                const { verse, date } = JSON.parse(storedData);
                const today = new Date().toISOString().split('T')[0];
                if (date === today && verse.imageUrl) {
                    setVerseOfTheDay(verse);
                    setIsVerseOfTheDayLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to load verse of the day from localStorage", error);
        }
        fetchVerseOfTheDay();
    };
    loadVerseOfTheDay();
  }, [fetchVerseOfTheDay]);

  const runSuggestionGeneration = useCallback(async (themeToGenerate: string) => {
    if (!themeToGenerate.trim()) {
      setError('Por favor, insira um tema.');
      return;
    }
    setCurrentStep('suggesting');
    setError(null);
    setResult(null);
    setVerseSuggestions(null);
    setActiveView('main');

    try {
      const suggestions = await generateVerseSuggestions(themeToGenerate);
      if (suggestions && suggestions.length > 0) {
        setVerseSuggestions(suggestions);
      } else {
        throw new Error('Não foram encontradas sugestões.');
      }
    } catch (err) {
      console.error(err);
      let errorMessage = 'Ocorreu um erro ao buscar sugestões.';
      if (err instanceof Error) {
        const lowerCaseError = err.message.toLowerCase();
        if (lowerCaseError.includes('permission denied') || lowerCaseError.includes('api key')) {
          errorMessage = 'Verifique sua chave de API.';
        }
      }
      setError(errorMessage);
    } finally {
      setCurrentStep('idle');
    }
  }, []);

  const runFinalGeneration = useCallback(async (verse: VerseSuggestion) => {
    setCurrentStep('generating');
    setError(null);
    setVerseSuggestions(null);
    setResult(null); 

    try {
      const explanationPromise = generateExplanationForVerse(verse.verseText, verse.verseReference);
      
      // DYNAMIC PROMPT: Inject the verse text to ensure variety in generated images.
      const shortVerseText = verse.verseText.length > 100 ? verse.verseText.substring(0, 100) + "..." : verse.verseText;
      const imagePrompt = `Inspirado em: "${shortVerseText}".`;
      
      const imagePromise = generateImage(imagePrompt)
        .catch(async e => {
            console.warn("Image generation failed, using dynamic fallback.", e);
            // Extract simple keywords for Pexels or use generic nature
            return await getDynamicFallbackImage(verse.verseText.length > 30 ? "spiritual nature" : verse.verseText);
        });

      const [explanation, imageUrl] = await Promise.all([explanationPromise, imagePromise]);
      
      const finalResult: VerseResult = { 
          id: generateUUID(),
          ...verse, 
          explanation, 
          imageUrl,
          isFavorite: false,
          createdAt: Date.now()
      };
      
      setResult(finalResult);
      // Add to gallery immediately
      setGalleryItems(prev => [finalResult, ...prev]);
      
    } catch (err) {
      console.error(err);
      let errorMessage = 'Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.';
      setError(errorMessage);
      setResult(null);
    } finally {
      setCurrentStep('idle');
    }
  }, []);

  const handleGenerate = () => {
    runSuggestionGeneration(theme);
  };

  const handleThemeClick = (selectedTheme: string) => {
    setTheme(selectedTheme);
    runSuggestionGeneration(selectedTheme);
  };
  
  const handleReset = () => {
    setResult(null);
    setVerseSuggestions(null);
    setError(null);
    setTheme('');
    setCurrentStep('idle');
  };

  const renderMainContent = () => (
    <>
      <div className="w-full mb-8">
        {isVerseOfTheDayLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 rounded-2xl border border-gray-700 min-h-[300px]">
            <Spinner />
            <p className="mt-4 text-gray-300">Buscando inspiração do dia...</p>
          </div>
        )}
        
        {!isVerseOfTheDayLoading && verseOfTheDay && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-4 font-dancing-script">Versículo do Dia</h2>
            <ResultCard 
                result={verseOfTheDay} 
                onToggleFavorite={() => toggleFavorite(verseOfTheDay.id)}
                // Verse of the day generally isn't deleted from the main view, but we can allow favoriting
            />
          </div>
        )}
      </div>

      <div className="w-full bg-gray-900/50 p-6 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-center sm:text-left">Busque Inspiração Divina</h2>
            {(result || verseSuggestions) && (
                <button onClick={handleReset} className="text-sm text-teal-300 hover:text-teal-100 transition-colors whitespace-nowrap ml-4">
                  Nova Busca
                </button>
            )}
        </div>
        
        <p className="text-gray-400 text-center mb-4">Digite um tema como "fé", "esperança" ou "amor" para começar.</p>
        
        <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-3">Ou escolha um tema:</p>
            <div className="flex flex-wrap justify-center gap-2">
                {predefinedThemes.map((pTheme) => (
                    <button
                        key={pTheme}
                        onClick={() => handleThemeClick(pTheme)}
                        disabled={currentStep !== 'idle'}
                        className="bg-gray-700/50 text-gray-300 hover:bg-teal-500 hover:text-black font-medium py-1 px-4 rounded-full text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pTheme}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Digite um tema..."
            className="flex-grow bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
            disabled={currentStep !== 'idle'}
            onKeyUp={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={currentStep !== 'idle'}
            className="bg-gradient-to-r from-teal-400 to-yellow-300 text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {currentStep === 'suggesting' ? <Spinner /> : 'Buscar Versículos'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4 text-center bg-red-900/20 p-3 rounded-lg border border-red-900">{error}</p>}
      
      <div className="w-full mt-8 pb-8">
          {currentStep === 'suggesting' && (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 rounded-2xl border border-gray-700">
                  <Spinner />
                  <p className="mt-4 text-gray-300">Buscando sugestões de versículos...</p>
              </div>
          )}

          {currentStep === 'generating' && (
             <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-900/50 rounded-2xl border border-gray-700">
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 animate-pulse"></div>
                    <Spinner />
                  </div>
                  <p className="mt-6 text-xl font-dancing-script text-teal-200">Criando sua imagem sagrada...</p>
                  <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos.</p>
              </div>
          )}
          
          {verseSuggestions && currentStep === 'idle' && (
              <VerseSuggestionsComponent suggestions={verseSuggestions} onSelect={runFinalGeneration} theme={theme} />
          )}

          {result && currentStep === 'idle' && (
              <ResultCard 
                result={result} 
                onToggleFavorite={() => toggleFavorite(result.id)}
                onDelete={() => deleteItem(result.id)}
              />
          )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 sm:p-6 lg:p-8 pb-24">
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <Logo className="w-12 h-12" />
          <h1 className="text-2xl font-dancing-script">A Palavra Diária</h1>
        </div>
      </header>
      
      <main className="w-full max-w-xl flex-grow flex flex-col items-center">
        {activeView === 'main' ? renderMainContent() : <GalleryScreen items={galleryItems} onSelectItem={setSelectedGalleryItem} />}
      </main>

      {selectedGalleryItem && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setSelectedGalleryItem(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <ResultCard 
                result={selectedGalleryItem} 
                onClose={() => setSelectedGalleryItem(null)}
                onToggleFavorite={() => toggleFavorite(selectedGalleryItem.id)}
                onDelete={() => deleteItem(selectedGalleryItem.id)}
            />
          </div>
        </div>
      )}

      <BottomNav activeView={activeView} setActiveView={setActiveView} galleryItemCount={galleryItems.length} />
    </div>
  );
};

export default MainScreen;
