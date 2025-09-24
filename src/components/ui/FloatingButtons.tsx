import React from 'react';
import { Category } from '../../types';

interface FloatingButtonsProps {
    onStartQuiz: () => void;
    onAddTerm: () => void;
    selectedCategoryId: string | null;
    categories: Category[];
}

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({
    onStartQuiz,
    onAddTerm,
    selectedCategoryId,
    categories
}) => {
    return (
        <>
            {/* Floating Quiz Button */}
            <button
                onClick={onStartQuiz}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.6)] hover:scale-110 z-50 group"
                aria-label="Mulai Quiz"
                title="Mulai Quiz - Uji pengetahuan Anda tentang istilah teknis"
            >
                <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Mulai Quiz
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            </button>

            {/* Floating Add Term Button */}
            <button
                onClick={onAddTerm}
                disabled={!selectedCategoryId && categories.length === 0}
                className="fixed bottom-24 left-6 p-4 rounded-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:scale-110 z-50 group"
                aria-label="Tambah Istilah"
                title="Tambah Istilah Baru"
            >
                <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Tambah Istilah
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            </button>
        </>
    );
};