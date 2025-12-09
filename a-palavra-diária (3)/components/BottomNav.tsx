import React from 'react';

const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const GalleryIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1-1a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
        <path d="M9 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" />
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM5 14a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

interface BottomNavProps {
    activeView: 'main' | 'gallery';
    setActiveView: (view: 'main' | 'gallery') => void;
    galleryItemCount: number;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    label: string;
    badgeCount?: number;
}> = ({ isActive, onClick, children, label, badgeCount = 0 }) => {
    const activeClasses = 'text-teal-300';
    const inactiveClasses = 'text-gray-400 hover:text-white';
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 relative ${isActive ? activeClasses : inactiveClasses}`}
            aria-label={label}
        >
            {children}
            <span className="text-xs mt-1">{label}</span>
            {badgeCount > 0 && (
                <span className="absolute top-0 right-1/2 -mr-5 px-1.5 py-0.5 text-xs font-bold text-black bg-yellow-300 rounded-full">
                    {badgeCount}
                </span>
            )}
        </button>
    );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, galleryItemCount }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/80 border-t border-gray-700 backdrop-blur-sm z-50">
            <div className="max-w-xl mx-auto h-full flex justify-around">
                <NavButton
                    isActive={activeView === 'main'}
                    onClick={() => setActiveView('main')}
                    label="Gerador"
                >
                    <HomeIcon className="w-6 h-6" />
                </NavButton>
                <NavButton
                    isActive={activeView === 'gallery'}
                    onClick={() => setActiveView('gallery')}
                    label="Galeria"
                    badgeCount={galleryItemCount}
                >
                    <GalleryIcon className="w-6 h-6" />
                </NavButton>
            </div>
        </nav>
    );
};

export default BottomNav;
