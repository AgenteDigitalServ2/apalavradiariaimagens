
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VerseResult, VerseSuggestion } from '../types';
import { generateVerseSuggestions, generateExplanationForVerse, generateImage, generateRandomVerseSuggestion, ImageSource } from '../services/geminiService';
import Logo from './Logo';
import ResultCard from './ResultCard';
import Spinner from './Spinner';
import BottomNav from './BottomNav';
import GalleryScreen from './GalleryScreen';
import DownloadScreen from './DownloadScreen';
import VerseSuggestionsComponent from './VerseSuggestions';

const predefinedThemes = ['Fé', 'Esperança', 'Amor', 'Gratidão', 'Paz', 'Força'];

const imageStyles = [
  {
    id: 'cinematic',
    label: 'Cinematográfico',
    prompt: 'Uma imagem artística cristã cinematográfica, com alto realismo em 8k, etérea e inspiradora. Estilo com iluminação dramática e profundidade de campo. SEM PESSOAS, SEM FIGURAS HUMANAS, SEM ROSTOS. Foque em elementos da natureza, luz divina e paisagens.'
  },
  {
    id: 'minimalist',
    label: 'Minimalista',
    prompt: 'Uma ilustração minimalista e elegante, com design limpo e traços geométricos. Cores suaves, muito espaço negativo. SEM PESSOAS, SEM FIGURAS HUMANAS. Apenas simbolismos abstratos e natureza.'
  },
  {
    id: 'watercolor',
    label: 'Aquarela',
    prompt: 'Uma pintura em aquarela suave e delicada. Estilo artístico com manchas de tinta sutis. SEM PESSOAS, SEM FIGURAS HUMANAS. Paisagens naturais e elementos simbólicos.'
  },
  {
    id: 'photorealism',
    label: 'Fotorrealismo',
    prompt: 'Uma imagem fotorrealista de ultra-alta definição com texturas perfeitas. Iluminação natural impressionante. SEM PESSOAS, SEM FIGURAS HUMANAS, SEM ROSTOS. Apenas natureza pura e cenários magníficos.'
  },
  {
    id: 'photography',
    label: 'Fotografia',
    prompt: 'Uma fotografia profissional premiada, iluminação natural sublime. SEM PESSOAS, SEM NINGUÉM. Paisagens naturais, céus, montanhas ou detalhes da criação.'
  },
  {
    id: 'realistic-digital',
    label: 'Ilustração Realista',
    prompt: 'Uma ilustração digital realista e polida, estilo concept art. Renderização detalhada. SEM PESSOAS, SEM FIGURAS HUMANAS. Foco em arquitetura sagrada, natureza ou simbolismo etéreo.'
  }
];

type GenerationStep = 'idle' | 'suggesting' | 'generating';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

const MainScreen: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [verseNumber, setVerseNumber] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('cinematic');
  const [selectedSource, setSelectedSource] = useState<ImageSource>('auto');
  
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerseResult | null>(null);
  const [galleryItems, setGalleryItems] = useState<VerseResult[]>([]);
  const [activeView, setActiveView] = useState<'main' | 'gallery' | 'download'>('main');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<VerseResult | null>(null);
  const [verseSuggestions, setVerseSuggestions] = useState<VerseSuggestion[] | null>(null);

  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseResult | null>(null);
  const [isVerseOfTheDayLoading, setIsVerseOfTheDayLoading] = useState<boolean>(true);
  const [verseOfTheDayError, setVerseOfTheDayError] = useState<string | null>(null);
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('galleryItems');
      if (storedItems) {
        const parsedItems: VerseResult[] = JSON.parse(storedItems);
        const itemsWithIds = parsedItems.map((item, index) => ({
            ...item,
            id: item.id || `${item.verseReference}-${index}-${Date.now()}`
        }));
        setGalleryItems(itemsWithIds);
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

  const fetchVerseOfTheDay = useCallback(async () => {
    setIsVerseOfTheDayLoading(true);
    setVerseOfTheDayError(null);
    try {
      const verseSuggestion = await generateRandomVerseSuggestion();
      await new Promise(r => setTimeout(r, 1500));
      const explanation = await generateExplanationForVerse(verseSuggestion.verseText, verseSuggestion.verseReference);
      await new Promise(r => setTimeout(r, 1500));
      const imageUrl = await generateImage(
        `${imageStyles[0].prompt} Relacionada ao tema de paz e ao versículo "${verseSuggestion.verseText}". ABSOLUTAMENTE SEM PESSOAS.`,
        'auto' 
      );
      const finalResult: VerseResult = { ...verseSuggestion, explanation, imageUrl, id: 'verse-of-the-day' };
      setVerseOfTheDay(finalResult);
      const today = new Date().toISOString().split('T')[0];
      try {
        localStorage.setItem('verseOfTheDay', JSON.stringify({ verse: finalResult, date: today }));
      } catch (e) {
        console.warn("Could not save verse of the day to localStorage", e);
      }
    } catch (err) {
      console.error("Failed to generate Verse of the Day", err);
      try {
         const storedData = localStorage.getItem('verseOfTheDay');
         if (storedData) {
             const { verse } = JSON.parse(storedData);
             setVerseOfTheDay({ ...verse, id: 'verse-of-the-day-cached' });
         }
      } catch (e) { /* ignore */ }
      let errorMessage = "Não foi possível carregar o versículo do dia.";
      if (err instanceof Error) {
        const lowerCaseError = err.message.toLowerCase();
        if (lowerCaseError.includes('api key') || lowerCaseError.includes('permission') || lowerCaseError.includes('403') || lowerCaseError.includes('chave da api') || lowerCaseError.includes('configurada')) {
            errorMessage = "Erro de Configuração: Chave de API não detectada.";
        } else if (lowerCaseError.includes('quota') || lowerCaseError.includes('429') || lowerCaseError.includes('limit')) {
            errorMessage = "O limite momentâneo da API foi atingido. Por favor, aguarde.";
        }
      }
      setVerseOfTheDayError(errorMessage);
    } finally {
      setIsVerseOfTheDayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const loadVerseOfTheDay = () => {
        try {
            const storedData = localStorage.getItem('verseOfTheDay');
            if (storedData) {
                const { verse, date } = JSON.parse(storedData);
                const today = new Date().toISOString().split('T')[0];
                if (date === today && verse.imageUrl) {
                    setVerseOfTheDay({ ...verse, id: verse.id || 'verse-of-the-day' });
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

  const handleRefreshVerseOfTheDay = () => {
    try {
        localStorage.removeItem('verseOfTheDay');
    } catch (e) {
        console.warn("Could not clear localStorage", e);
    }
    setVerseOfTheDay(null);
    fetchVerseOfTheDay();
  };

  const handleRegenerateImage = useCallback(async (currentResult: VerseResult) => {
    try {
      const selectedStyle = imageStyles.find(s => s.id === selectedStyleId) || imageStyles[0];
      const newImageUrl = await generateImage(
        `${selectedStyle.prompt} Relacionada ao versículo "${currentResult.verseText}". ABSOLUTAMENTE SEM PESSOAS NA IMAGEM.`,
        selectedSource
      );
      
      const updatedResult = { ...currentResult, imageUrl: newImageUrl };

      if (result && result.id === currentResult.id) {
        setResult(updatedResult);
      }
      
      if (verseOfTheDay && (verseOfTheDay.id === currentResult.id || currentResult.id.includes('verse-of-the-day'))) {
        setVerseOfTheDay(updatedResult);
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('verseOfTheDay', JSON.stringify({ verse: updatedResult, date: today }));
      }

      setGalleryItems(prev => prev.map(item => item.id === currentResult.id ? updatedResult : item));
      
      if (selectedGalleryItem && selectedGalleryItem.id === currentResult.id) {
        setSelectedGalleryItem(updatedResult);
      }

    } catch (err) {
      console.error("Failed to regenerate image", err);
      alert("Não foi possível trocar a imagem no momento. Tente novamente mais tarde.");
    }
  }, [selectedStyleId, selectedSource, result, verseOfTheDay, selectedGalleryItem]);

  const runSuggestionGeneration = useCallback(async (themeToGenerate: string, bookToFilter?: string, chapterToFilter?: string, verseToFilter?: string) => {
    if (!themeToGenerate.trim() && !bookToFilter?.trim()) {
      setError('Por favor, insira um tema ou especifique um livro da Bíblia.');
      return;
    }
    setCurrentStep('suggesting');
    setError(null);
    setResult(null);
    setVerseSuggestions(null);
    setActiveView('main');
    try {
      const suggestions = await generateVerseSuggestions(themeToGenerate, bookToFilter, chapterToFilter, verseToFilter);
      if (suggestions && suggestions.length > 0) {
        setVerseSuggestions(suggestions);
      } else {
        throw new Error('Não foram encontradas sugestões para este tema.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao buscar sugestões.');
    } finally {
      setCurrentStep('idle');
    }
  }, []);

  const runFinalGeneration = useCallback(async (verse: VerseSuggestion) => {
    setCurrentStep('generating');
    setError(null);
    setVerseSuggestions(null);
    setResult({ ...verse, explanation: '', imageUrl: '', id: `generating-${Date.now()}` });
    try {
      const explanation = await generateExplanationForVerse(verse.verseText, verse.verseReference);
      const selectedStyle = imageStyles.find(s => s.id === selectedStyleId) || imageStyles[0];
      const imageUrl = await generateImage(
        `${selectedStyle.prompt} Relacionada ao versículo "${verse.verseText}". ABSOLUTAMENTE SEM PESSOAS OU ROSTOS.`,
        selectedSource
      );
      const finalResult: VerseResult = { 
        ...verse, 
        explanation, 
        imageUrl, 
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      setResult(finalResult);
      setGalleryItems(prevItems => [finalResult, ...prevItems]);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o conteúdo.');
      setResult(null);
    } finally {
      setCurrentStep('idle');
    }
  }, [selectedStyleId, selectedSource]);

  const handleGenerate = () => {
    runSuggestionGeneration(theme, book, chapter, verseNumber);
  };

  const handleThemeClick = (selectedTheme: string) => {
    setTheme(selectedTheme);
    runSuggestionGeneration(selectedTheme, book, chapter, verseNumber);
  };
  
  const handleReset = () => {
    setResult(null);
    setVerseSuggestions(null);
    setError(null);
    setTheme('');
    setBook('');
    setChapter('');
    setVerseNumber('');
    setCurrentStep('idle');
  };

  const handleDeleteItem = (idToDelete: string) => {
    if (window.confirm("Tem certeza de que deseja excluir?")) {
        setGalleryItems(prevItems => prevItems.filter(item => item.id !== idToDelete));
        setSelectedGalleryItem(null);
    }
  };

  const renderMainContent = () => (
    <>
      <div className="w-full mb-8">
        {isVerseOfTheDayLoading && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 rounded-2xl border border-gray-700">
            <Spinner />
            <p className="mt-4 text-gray-300">Gerando o versículo do dia...</p>
          </div>
        )}
        {verseOfTheDayError && !isVerseOfTheDayLoading && (
           <div className="text-center p-4 bg-gray-900/50 rounded-2xl border border-red-700/50 flex flex-col items-center gap-2 mb-4">
            <p className="text-red-300 font-medium">{verseOfTheDayError}</p>
            <button 
              onClick={fetchVerseOfTheDay}
              className="mt-1 px-4 py-1 bg-red-800/50 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Tentar Novamente
            </button>
         </div>
        )}
        {verseOfTheDay && !isVerseOfTheDayLoading && (
          <div className="animate-fade-in relative group">
            <div className="flex items-center justify-center gap-2 mb-4">
                <h2 className="text-2xl font-bold font-dancing-script">Versículo do Dia</h2>
                <button onClick={handleRefreshVerseOfTheDay} className="p-1.5 rounded-full text-gray-400 hover:text-teal-300 hover:bg-gray-800 transition-colors">
                    <RefreshIcon />
                </button>
            </div>
            <ResultCard result={verseOfTheDay} onRegenerateImage={handleRegenerateImage} />
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
        
        <p className="text-gray-400 text-center mb-4">Digite um tema ou escolha um versículo específico.</p>
        
        <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-3">Escolha um tema:</p>
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
          />
          <button
            onClick={handleGenerate}
            disabled={currentStep !== 'idle' || (!theme.trim() && !book.trim())}
            className="bg-gradient-to-r from-teal-400 to-yellow-300 text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
          >
            {currentStep === 'suggesting' ? <Spinner /> : (
              <>
                <SearchIcon />
                Buscar
              </>
            )}
          </button>
        </div>

        <div className="mt-4 border-t border-gray-800 pt-4">
          <p className="text-sm text-gray-500 mb-3 font-semibold">Refine seu estilo:</p>
          
          <div className="mb-4 space-y-3">
             <div>
               <p className="text-xs text-gray-500 mb-2">Estilo da Imagem:</p>
               <div className="flex flex-wrap gap-2">
                  {imageStyles.map((style) => (
                     <button
                        key={style.id}
                        onClick={() => setSelectedStyleId(style.id)}
                        disabled={currentStep !== 'idle'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                           selectedStyleId === style.id 
                             ? 'bg-teal-900/50 border-teal-400 text-teal-300' 
                             : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                     >
                        {style.label}
                     </button>
                  ))}
               </div>
             </div>
             <div>
               <p className="text-xs text-gray-500 mb-2">Fonte da Imagem:</p>
               <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'auto', label: 'Automático' },
                    { id: 'pexels', label: 'Pexels' },
                    { id: 'pixabay', label: 'Pixabay' }
                  ].map((source) => (
                     <button
                        key={source.id}
                        onClick={() => setSelectedSource(source.id as ImageSource)}
                        disabled={currentStep !== 'idle'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                           selectedSource === source.id 
                             ? 'bg-purple-900/50 border-purple-400 text-purple-300' 
                             : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                     >
                        {source.label}
                     </button>
                  ))}
               </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={book} onChange={(e) => setBook(e.target.value)} placeholder="Livro" className="flex-[2] bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400" disabled={currentStep !== 'idle'} />
              <input type="number" value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Cap." className="flex-1 min-w-[80px] bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400" disabled={currentStep !== 'idle'} />
              <input type="number" value={verseNumber} onChange={(e) => setVerseNumber(e.target.value)} placeholder="Vers." className="flex-1 min-w-[80px] bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400" disabled={currentStep !== 'idle'} />
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4 text-center font-semibold">{error}</p>}
      
      <div className="w-full mt-8">
          {currentStep === 'suggesting' && (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900/50 rounded-2xl border border-gray-700">
                  <Spinner />
                  <p className="mt-4 text-gray-300">Buscando versículos...</p>
              </div>
          )}
          {verseSuggestions && currentStep === 'idle' && (
              <VerseSuggestionsComponent suggestions={verseSuggestions} onSelect={runFinalGeneration} theme={theme || book} />
          )}
          {result && (
              <ResultCard result={result} onRegenerateImage={handleRegenerateImage} />
          )}
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'gallery':
        return <GalleryScreen items={galleryItems} onSelectItem={setSelectedGalleryItem} />;
      case 'download':
        return <DownloadScreen />;
      default:
        return renderMainContent();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 sm:p-6 lg:p-8 pb-32">
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <Logo className="w-12 h-12" />
          <h1 className="text-2xl font-dancing-script">A Palavra Diária</h1>
        </div>
      </header>
      
      <main className="w-full max-w-xl flex-grow flex flex-col items-center">
        {renderContent()}
      </main>

      {selectedGalleryItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedGalleryItem(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ResultCard result={selectedGalleryItem} onClose={() => setSelectedGalleryItem(null)} onDelete={handleDeleteItem} onRegenerateImage={handleRegenerateImage} />
          </div>
        </div>
      )}

      <BottomNav activeView={activeView} setActiveView={setActiveView} galleryItemCount={galleryItems.length} />
    </div>
  );
};

export default MainScreen;
