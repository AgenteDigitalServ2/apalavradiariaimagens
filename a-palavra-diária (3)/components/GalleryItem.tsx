
import React, { useState, useRef, useEffect } from 'react';
import { VerseResult } from '../types';
import { shareVerse } from '../services/shareService';

const ShareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);

const SharingSpinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);


interface GalleryItemProps {
    item: VerseResult;
    onClick: () => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onClick }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let observer: IntersectionObserver;
        const currentRef = itemRef.current;

        if (currentRef) {
            observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setImageSrc(item.imageUrl);
                        if (currentRef) {
                            observer.unobserve(currentRef);
                        }
                    }
                },
                {
                    rootMargin: '0px 0px 200px 0px', // Start loading when 200px away
                }
            );
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef && observer) {
                observer.unobserve(currentRef);
            }
        };
    }, [item.imageUrl]);

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the modal
        shareVerse(item, setIsSharing);
    };

    return (
        <div 
            ref={itemRef}
            className="relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden cursor-pointer group shadow-lg"
            onClick={onClick}
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
            aria-label={`Ver detalhe de ${item.verseReference}`}
        >
            {imageSrc && <img src={imageSrc} alt={`Ilustração para ${item.verseReference}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Favorite Indicator */}
            {item.isFavorite && (
                <div className="absolute top-2 left-2">
                    <div className="p-1.5 bg-red-500/80 rounded-full text-white shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}

            <div className="absolute top-2 right-2">
                <button
                    onClick={handleShareClick}
                    disabled={isSharing}
                    className="p-2 bg-black/40 rounded-full text-white hover:bg-black/70 transition-colors flex items-center justify-center w-9 h-9"
                    aria-label="Compartilhar"
                >
                    {isSharing ? <SharingSpinner /> : <ShareIcon className="w-5 h-5" />}
                </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="font-bold text-sm truncate">{item.verseReference}</p>
                <p className="text-xs text-gray-300 truncate">"{item.verseText}"</p>
            </div>
        </div>
    );
};

export default GalleryItem;
