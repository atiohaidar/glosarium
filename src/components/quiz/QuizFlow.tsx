import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Category, Term, Definitions, QuizQuestion, UserAnswer } from '../../types';
import { shuffleArray, stripHtml, formatDuration } from '../../utils/quizUtils';
import { QuizSetup } from './QuizSetup';
import { QuizActive } from './QuizActive';
import { QuizResults } from './QuizResults';

interface QuizFlowProps {
    categories: Category[];
    sortedTermsByCategory: Map<string, Term[]>;
    onExit: () => void;
    selectedCategoryId?: string | null;
}

export const QuizFlow: React.FC<QuizFlowProps> = ({ categories, sortedTermsByCategory, onExit, selectedCategoryId }) => {
    const [step, setStep] = useState<'setup' | 'active' | 'results'>('setup');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);

    const generateQuestions = useCallback((categoryId: string, numQuestions: number, questionKey: keyof Definitions | 'random') => {
        const terms = sortedTermsByCategory.get(categoryId) || [];
        const availableQuestions: QuizQuestion[] = [];

        if (questionKey === 'random') {
            // Generate questions from all definition types
            terms.forEach(term => {
                Object.entries(term.definitions).forEach(([key, value]) => {
                    if (value && value !== '-') {
                        const questionText = `Apa ${key === 'istilah' ? 'definisi' : key === 'bahasa' ? 'arti bahasa' : key === 'kenapaAda' ? 'alasan keberadaan' : 'contoh'} dari "<strong>${term.istilah}</strong>"?`;
                        const correctAnswer = stripHtml(value as string);
                        const wrongOptions = terms
                            .filter(t => t.id !== term.id)
                            .map(t => {
                                const def = t.definitions[key as keyof Definitions];
                                return def && def !== '-' ? stripHtml(def) : null;
                            })
                            .filter(Boolean)
                            .slice(0, 3);

                        if (wrongOptions.length >= 2) {
                            availableQuestions.push({
                                term,
                                questionText,
                                correctAnswer,
                                options: shuffleArray([correctAnswer, ...wrongOptions.slice(0, 2)])
                            });
                        }
                    }
                });
            });
        } else {
            // Generate questions from specific definition type
            terms.forEach(term => {
                const value = term.definitions[questionKey];
                if (value && value !== '-') {
                    const questionText = `Apa ${questionKey === 'istilah' ? 'definisi' : questionKey === 'bahasa' ? 'arti bahasa' : questionKey === 'kenapaAda' ? 'alasan keberadaan' : 'contoh'} dari "<strong>${term.istilah}</strong>"?`;
                    const correctAnswer = stripHtml(value);
                    const wrongOptions = terms
                        .filter(t => t.id !== term.id)
                        .map(t => {
                            const def = t.definitions[questionKey];
                            return def && def !== '-' ? stripHtml(def) : null;
                        })
                        .filter(Boolean)
                        .slice(0, 3);

                    if (wrongOptions.length >= 2) {
                        availableQuestions.push({
                            term,
                            questionText,
                            correctAnswer,
                            options: shuffleArray([correctAnswer, ...wrongOptions.slice(0, 2)])
                        });
                    }
                }
            });
        }

        return shuffleArray(availableQuestions).slice(0, numQuestions);
    }, [sortedTermsByCategory]);

    const handleSetupSubmit = useCallback((config: { categoryId: string; numQuestions: number; questionKey: keyof Definitions | 'random' }) => {
        const newQuestions = generateQuestions(config.categoryId, config.numQuestions, config.questionKey);
        setQuestions(newQuestions);
        setUserAnswers(new Array(newQuestions.length).fill(null));
        setCurrentQuestionIndex(0);
        setStartTime(Date.now());
        setEndTime(null);
        setStep('active');
    }, [generateQuestions]);

    const handleAnswer = useCallback((answer: string) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQuestionIndex] = answer;
            return newAnswers;
        });
    }, [currentQuestionIndex]);

    const handleNavigate = useCallback((direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else if (direction === 'next') {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // Jika sudah di pertanyaan terakhir dan semua sudah dijawab, selesai kuis
                const allAnswered = userAnswers.every(answer => answer !== null);
                if (allAnswered) {
                    setEndTime(Date.now());
                    setStep('results');
                }
            }
        }
    }, [currentQuestionIndex, questions.length, userAnswers]);

    const handleRestart = () => {
        setQuestions([]);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setStartTime(null);
        setEndTime(null);
        setStep('setup');
    };

    const renderStep = () => {
        switch (step) {
            case 'setup':
                return <QuizSetup categories={categories} sortedTermsByCategory={sortedTermsByCategory} onSubmit={handleSetupSubmit} onExit={onExit} selectedCategoryId={selectedCategoryId} />;
            case 'active':
                if (questions.length === 0 || !questions[currentQuestionIndex]) {
                    return (
                        <div className="text-center text-[var(--text-primary)]">
                            <p className="mb-4">Tidak ada soal yang bisa dibuat dari pengaturan ini.</p>
                            <button onClick={handleRestart} className="py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 transition-colors">Kembali</button>
                        </div>
                    );
                }
                return (
                    <QuizActive
                        question={questions[currentQuestionIndex]}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        startTime={startTime}
                        currentAnswer={userAnswers[currentQuestionIndex]}
                        onAnswer={handleAnswer}
                        onNavigate={handleNavigate}
                        canNavigatePrev={currentQuestionIndex > 0}
                        canNavigateNext={currentQuestionIndex < questions.length - 1 || userAnswers.every(answer => answer !== null)}
                    />
                );
            case 'results': {
                const results: UserAnswer[] = questions.map((question, index) => ({
                    question,
                    userAnswer: userAnswers[index] || '',
                    isCorrect: (userAnswers[index] || '') === question.correctAnswer,
                }));
                const duration = endTime && startTime ? endTime - startTime : 0;
                return <QuizResults results={results} durationMs={duration} onRestart={handleRestart} onExit={onExit} />;
            }
            default:
                return null;
        }
    };

    return renderStep();
};
