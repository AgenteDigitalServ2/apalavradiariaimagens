
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const DownloadScreen: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 animate-fade-in flex flex-col items-center">
      <Logo className="w-24 h-24 mb-6" />
      <h2 className="text-3xl font-bold text-center mb-2 font-dancing-script">Tenha a Palavra com você</h2>
      <p className="text-gray-400 text-center mb-8">Transforme este site em um aplicativo no seu celular para acesso rápido e offline.</p>

      {/* Botão de Instalação Automática (se suportado pelo navegador) */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="w-full mb-8 bg-gradient-to-r from-teal-400 to-yellow-300 text-black font-bold py-4 px-6 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Instalar Agora no Android
        </button>
      )}

      {/* Seção PWA - Instalação Direta/Manual */}
      <div className="w-full bg-gray-900/50 border border-gray-700 rounded-3xl p-6 mb-12 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Como Instalar Manualmente
        </h3>

        <div className="space-y-8">
          {/* iOS */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-teal-300 font-bold border border-teal-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414zm.707 8.536l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
               </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1 text-lg">No iPhone (Safari)</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Toque no ícone de <span className="text-teal-300 font-bold">Compartilhar</span> (o quadrado com uma seta para cima na barra inferior) e selecione <span className="text-teal-300 font-bold">"Adicionar à Tela de Início"</span>.
              </p>
            </div>
          </div>

          {/* Android */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-teal-300 font-bold border border-teal-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
               </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1 text-lg">No Android (Chrome)</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Toque nos <span className="text-teal-300 font-bold">três pontinhos</span> no canto superior direito e selecione <span className="text-teal-300 font-bold">"Instalar Aplicativo"</span> ou <span className="text-teal-300 font-bold">"Adicionar à Tela Inicial"</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center bg-gray-900/30 p-8 rounded-3xl border border-gray-800">
        <div className="bg-white p-4 rounded-2xl mb-4 shadow-2xl">
           <svg width="140" height="140" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="120" height="120" fill="white"/>
              <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z" fill="black"/>
              <path d="M22 22H28V28H22V22Z" fill="black"/>
              <path d="M80 10H110V40H80V10ZM85 15V35H105V15H85Z" fill="black"/>
              <path d="M92 22H98V28H92V22Z" fill="black"/>
              <path d="M10 80H40V110H10V80ZM15 85V105H35V85H15Z" fill="black"/>
              <path d="M22 92H28V98H22V92Z" fill="black"/>
              <rect x="50" y="10" width="10" height="10" fill="black"/>
              <rect x="70" y="20" width="5" height="5" fill="black"/>
              <rect x="55" y="45" width="15" height="15" fill="black"/>
              <rect x="85" y="60" width="20" height="5" fill="black"/>
              <rect x="60" y="80" width="30" height="10" fill="black"/>
              <rect x="95" y="95" width="15" height="15" fill="black"/>
              <rect x="10" y="50" width="25" height="5" fill="black"/>
           </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium text-center">Escaneie com a câmera do celular para <br/> abrir e instalar instantaneamente.</p>
      </div>
    </div>
  );
};

export default DownloadScreen;
