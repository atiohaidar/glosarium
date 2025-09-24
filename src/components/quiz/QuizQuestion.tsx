import React, { useState } from 'react';
import type { QuizQuestion as QuizQuestionType } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '../ui/icons';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  userAnswer?: string;
  showResult?: boolean;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onAnswer, isAnswered, userAnswer, showResult }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');

    const handleAnswerSelect = (answer: string) => {
        if (!isAnswered) {
            setSelectedAnswer(answer);
            onAnswer(answer);
        }
    };

    const getAnswerClass = (answer: string) => {
        if (!showResult) {
            return selectedAnswer === answer ? 'bg-sky-600 text-white' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]';
        }

        if (answer === question.correctAnswer) {
            return 'bg-green-600 text-white';
        }
        if (answer === userAnswer && answer !== question.correctAnswer) {
            return 'bg-red-600 text-white';
        }
        return 'bg-[var(--bg-secondary)] opacity-50';
    };

    const getAnswerIcon = (answer: string) => {
        if (!showResult) return null;

        if (answer === question.correctAnswer) {
            return <CheckCircleIcon className="w-5 h-5" />;
        }
        if (answer === userAnswer && answer !== question.correctAnswer) {
            return <XCircleIcon className="w-5 h-5" />;
        }
        return null;
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Pertanyaan</h2>
                <div className="text-lg text-[var(--text-primary)]" dangerouslySetInnerHTML={{ __html: question.questionText }} />
            </div>

            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`w-full p-4 rounded-lg text-left transition-colors flex items-center justify-between ${getAnswerClass(option)}`}
                    >
                        <span className="flex-1">{option}</span>
                        {getAnswerIcon(option)}
                    </button>
                ))}
            </div>

            {showResult && userAnswer && (
                <div className="mt-6 p-4 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[var(--text-secondary)]">
                        Jawaban Anda: <span className="font-semibold text-[var(--text-primary)]">{userAnswer}</span>
                    </p>
                    {userAnswer !== question.correctAnswer && (
                        <p className="text-[var(--text-secondary)] mt-2">
                            Jawaban Benar: <span className="font-semibold text-green-400">{question.correctAnswer}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};