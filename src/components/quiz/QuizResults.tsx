import React from 'react';
import { UserAnswer } from '../../types';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../ui/icons';
import { formatDuration } from '../../utils/quizUtils';
import { ScoreRing } from './ScoreRing';

interface QuizResultsProps {
  results: UserAnswer[];
  durationMs: number;
  onRestart: () => void;
  onExit: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ results, durationMs, onRestart, onExit }) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0;
    const incorrectAnswers = results.filter(r => !r.isCorrect);

    return (
        <div className="w-full max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-2">Kuis Selesai!</h1>
            <p className="text-center text-[var(--text-secondary)] mb-8">Berikut adalah hasil Anda:</p>

            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg text-center mb-8 flex flex-col md:flex-row justify-around items-center gap-6 md:gap-4">
                <div className="flex flex-col items-center justify-center">
                   <ScoreRing score={score} />
                   <p className="mt-4 text-[var(--text-primary)]">{correctAnswers} dari {results.length} jawaban benar</p>
                </div>
                <div className="border-t md:border-l border-[var(--border-primary)]/50 h-px w-full md:h-32 md:w-px"></div>
                <div className="text-center">
                    <p className="text-lg text-[var(--text-secondary)] mb-2">Waktu Mengerjakan</p>
                    <p className="text-5xl md:text-6xl font-bold text-sky-400 my-2 flex items-center justify-center gap-2">
                        <ClockIcon className="w-10 h-10" />
                        {formatDuration(durationMs)}
                    </p>
                    <p className="text-[var(--text-primary)]">Menit:Detik</p>
                </div>
            </div>

            {incorrectAnswers.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Perlu Dipelajari Lagi</h2>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {incorrectAnswers.map(({ question, userAnswer }, index) => (
                            <div key={index} className="bg-[var(--bg-secondary)]/70 p-4 rounded-lg">
                                <p className="text-sm text-[var(--text-secondary)] mb-2" dangerouslySetInnerHTML={{ __html: question.questionText }} />
                                <div className="flex items-center gap-2 text-red-400/90">
                                    <XCircleIcon className="w-5 h-5 flex-shrink-0" />
                                    <p><span className="font-semibold">Jawabanmu:</span> {userAnswer}</p>
                                </div>
                                <div className="flex items-center gap-2 text-green-400/90 mt-1">
                                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                                    <p><span className="font-semibold">Jawaban Benar:</span> {question.correctAnswer}</p>
                                </div>
                                 <a href={`#term-${question.term.id}`} onClick={onExit} className="text-sky-400 text-sm mt-2 inline-block hover:underline">
                                    Pelajari istilah &rarr;
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-4 pt-4">
                <button onClick={onExit} className="w-full py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold hover:bg-[var(--border-primary)] transition-colors">Kembali ke Glosarium</button>
                <button onClick={onRestart} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors">
                    <ArrowPathIcon className="w-5 h-5" />
                    Coba Lagi
                </button>
            </div>
        </div>
    );
};