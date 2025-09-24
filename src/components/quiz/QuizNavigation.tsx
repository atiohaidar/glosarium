import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({
    currentQuestion,
    totalQuestions,
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext
}) => {
    return (
        <div className="flex justify-between items-center mt-8">
            <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    canGoPrevious
                        ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] cursor-not-allowed'
                }`}
            >
                <ChevronLeftIcon className="w-5 h-5" />
                Sebelumnya
            </button>

            <span className="text-[var(--text-secondary)]">
                {currentQuestion + 1} dari {totalQuestions}
            </span>

            <button
                onClick={onNext}
                disabled={!canGoNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    canGoNext
                        ? 'bg-sky-600 text-white hover:bg-sky-500'
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] cursor-not-allowed'
                }`}
            >
                {currentQuestion === totalQuestions - 1 ? 'Selesai' : 'Selanjutnya'}
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
    );
};