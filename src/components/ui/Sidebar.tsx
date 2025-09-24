import React from 'react';
import { Category } from '../../types';
import { ChevronDoubleLeftIcon } from './icons';

interface SidebarProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onSelectCategory: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onImportData: (jsonString: string) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategoryId, onSelectCategory, isOpen, onClose, onImportData }) => {
    return (
        <aside className={`
            flex-shrink-0 bg-[var(--bg-secondary)] md:bg-transparent
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-full md:w-64 lg:w-72 p-4 md:p-6' : 'w-0 p-0'}
            overflow-hidden
        `}>
            <div className="flex flex-col h-full min-w-[230px] md:min-w-0">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <img src="./PP-Tio.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover"/>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">Glosarium</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                        aria-label="Close sidebar"
                    >
                        <ChevronDoubleLeftIcon className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 flex flex-row md:flex-col gap-2 md:gap-1 overflow-y-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`px-4 py-2 text-left rounded-md w-full whitespace-nowrap transition-all duration-200 text-sm md:text-base ${
                                selectedCategoryId === cat.id
                                    ? 'bg-sky-500/80 text-white font-semibold shadow-md shadow-sky-500/30'
                                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};