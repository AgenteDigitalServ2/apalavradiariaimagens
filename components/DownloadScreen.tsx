
import React from 'react';
import Logo from './Logo';

const DownloadScreen: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 animate-fade-in flex flex-col items-center">
      <Logo className="w-24 h-24 mb-6" />
      <h2 className="text-3xl font-bold text-center mb-2 font-dancing-script">Tenha a Palavra com você</h2>
      <p className="text-gray-400 text-center mb-10">Instale nosso aplicativo em seu smartphone para acesso rápido e offline.</p>

      {/* Seção de Lojas */}
      <div className="w-full space-y-4 mb-12">
        <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-widest text-center mb-4">Lojas Oficiais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="#" 
            className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-all group"
            onClick={(e) => e.preventDefault()}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
          </a>
          <a 
            href="#" 
            className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 transition-all group"
            onClick={(e) => e.preventDefault()}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store" className="h-10" />
          </a>
        </div>
        <p className="text-[10px] text-gray-500 text-center italic">Links das lojas em fase de aprovação final.</p>
      </div>

      {/* Seção PWA - Instalação Direta */}
      <div className="w-full bg-gray-900/50 border border-gray-700 rounded-3xl p-6 mb-12">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Instalação Instantânea (PWA)
        </h3>

        <div className="space-y-8">
          {/* iOS */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-teal-300 font-bold">1</div>
            <div>
              <p className="text-white font-semibold mb-1">No iPhone (Safari)</p>
              <p className="text-gray-400 text-sm">Toque no ícone de <span className="text-white font-bold">Compartilhar</span> (quadrado com seta) e selecione <span className="text-white font-bold">"Adicionar à Tela de Início"</span>.</p>
            </div>
          </div>

          {/* Android */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-teal-300 font-bold">2</div>
            <div>
              <p className="text-white font-semibold mb-1">No Android (Chrome)</p>
              <p className="text-gray-400 text-sm">Toque nos <span className="text-white font-bold">três pontinhos</span> no canto superior e selecione <span className="text-white font-bold">"Instalar Aplicativo"</span>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Simulado */}
      <div className="flex flex-col items-center">
        <div className="bg-white p-3 rounded-2xl mb-4">
           {/* SVG simulando um QR Code */}
           <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <p className="text-xs text-gray-500 font-medium">Aponte a câmera para abrir no celular</p>
      </div>
    </div>
  );
};

export default DownloadScreen;
