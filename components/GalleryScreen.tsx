import React from 'react';
import { VerseResult } from '../types';
import GalleryItem from './GalleryItem';
import Logo from './Logo';

interface GalleryScreenProps {
    items: VerseResult[];
    onSelectItem: (item: VerseResult) => void;
}

const GalleryScreen: React.FC<GalleryScreenProps> = ({ items, onSelectItem }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 font-dancing-script">Minhas Inspirações</h2>
            
            {items.length === 0 ? (
                <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                    <Logo className="w-24 h-24 opacity-30 mb-4" />
                    <p className="text-lg">Sua galeria está vazia.</p>
                    <p>Volte para a tela principal e gere sua primeira mensagem inspiradora!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {items.map((item) => (
                        <GalleryItem 
                            key={item.id} 
                            item={item} 
                            onClick={() => onSelectItem(item)} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryScreen;