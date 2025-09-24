import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types';
import { ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';
import { formatDuration } from '../../utils/quizUtils';

interface QuizActiveProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  startTime: number | null;
  currentAnswer: string | null;
  onAnswer: (answer: string) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

export const QuizActive: React.FC<QuizActiveProps> = ({ question, questionNumber, totalQuestions, startTime, currentAnswer, onAnswer, onNavigate, canNavigatePrev, canNavigateNext }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(currentAnswer);
    const [isAnswered, setIsAnswered] = useState(!!currentAnswer);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        setSelectedAnswer(currentAnswer);
        setIsAnswered(!!currentAnswer);
    }, [question, currentAnswer]);

    useEffect(() => {
        if (startTime === null) return;
        const timer = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime]);

    const handleAnswerClick = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        onAnswer(option);
    };

    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return "bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)]";
        }
        if (option === question.correctAnswer) {
            return "bg-green-600/80 ring-2 ring-green-400 transform scale-105";
        }
        if (option === selectedAnswer) {
            return "bg-red-600/80 opacity-70";
        }
        return "bg-[var(--bg-tertiary)] opacity-50";
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-[var(--text-secondary)]">Soal {questionNumber} dari {totalQuestions}</p>
                    <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDuration(elapsedTime)}</span>
                    </div>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2.5">
                    <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((questionNumber-1) / totalQuestions) * 100}%` }}></div>
                </div>
            </div>



            <div className="text-lg text-[var(--text-primary)] mb-8 min-h-[6rem] flex items-center justify-center text-center">
              <p dangerouslySetInnerHTML={{ __html: question.questionText }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerClick(option)}
                        disabled={isAnswered}
                        className={`p-4 rounded-lg text-[var(--text-primary)] text-left transition-all duration-300 ${getButtonClass(option)} disabled:cursor-not-allowed`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => onNavigate('prev')}
                    disabled={!canNavigatePrev}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Sebelumnya
                </button>

                <div className="flex items-center gap-2">
                    {Array.from({ length: totalQuestions }, (_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                i < questionNumber - 1 ? 'bg-green-500' :
                                i === questionNumber - 1 ? 'bg-sky-500' :
                                'bg-[var(--bg-tertiary)]'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => onNavigate('next')}
                    disabled={!canNavigateNext}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed transition-colors"
                >
                    Selanjutnya
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};