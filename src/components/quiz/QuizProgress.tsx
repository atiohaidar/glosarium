import React from 'react';

interface QuizProgressProps {
  current: number;
  total: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total }) => {
    const progress = total > 0 ? (current / total) * 100 : 0;

    return (
        <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Progress</span>
                <span className="text-sm text-[var(--text-primary)] font-semibold">{current} dari {total}</span>
            </div>
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                <div
                    className="bg-sky-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};