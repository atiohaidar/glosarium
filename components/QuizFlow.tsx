import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Category, Term, Definitions, QuizQuestion, UserAnswer } from '../types';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, ClockIcon } from './icons';

// --- Utility Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const stripHtml = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
};

const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

// --- Quiz Sub-Components ---

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const radius = 60;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    useEffect(() => {
        const animation = requestAnimationFrame(() => setDisplayScore(score));
        return () => cancelAnimationFrame(animation);
    }, [score]);

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    stroke="#373737"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#0ea5e9" // sky-500
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, strokeLinecap: 'round' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-4xl font-bold text-sky-400">{score}%</p>
                <p className="text-sm text-[#AAAAAA]">Skor</p>
            </div>
        </div>
    );
};


interface QuizSetupProps {
  categories: Category[];
  sortedTermsByCategory: Map<string, Term[]>;
  onSubmit: (config: { categoryId: string; numQuestions: number; questionKey: keyof Definitions | 'random' }) => void;
  onExit: () => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ categories, sortedTermsByCategory, onSubmit, onExit }) => {
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [numQuestions, setNumQuestions] = useState(5);
    const [questionKey, setQuestionKey] = useState<keyof Definitions | 'random'>('istilah');

    const questionTypes: { key: keyof Definitions | 'random'; label: string }[] = [
        { key: 'istilah', label: 'Definisi (Istilah)' },
        { key: 'bahasa', label: 'Arti Bahasa' },
        { key: 'kenapaAda', label: 'Alasan Keberadaan' },
        { key: 'contoh', label: 'Contoh' },
        { key: 'random', label: 'Acak (Semua Tipe)' },
    ];

    const maxQuestions = useMemo(() => {
        if (!categoryId) return 0;
        const terms = sortedTermsByCategory.get(categoryId) || [];
        if (questionKey === 'random') {
            return terms.reduce((count, term) => {
                return count + Object.values(term.definitions).filter(def => def && def !== '-').length;
            }, 0);
        }
        return terms.filter(term => {
            const value = term.definitions[questionKey as keyof Definitions];
            return value && value !== '-';
        }).length;
    }, [categoryId, questionKey, sortedTermsByCategory]);

    useEffect(() => {
        if (numQuestions > maxQuestions) {
            setNumQuestions(maxQuestions);
        } else if (numQuestions === 0 && maxQuestions > 0) {
            setNumQuestions(Math.min(5, maxQuestions));
        } else if (numQuestions < 1 && maxQuestions > 0) {
            setNumQuestions(1);
        }
    }, [maxQuestions, numQuestions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryId && numQuestions > 0) {
            onSubmit({ categoryId, numQuestions, questionKey });
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto p-8 bg-[#494949] rounded-xl border border-[#656565]/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
                <QuestionMarkCircleIcon className="w-8 h-8 text-sky-400" />
                <h1 className="text-2xl font-bold text-white">Pengaturan Kuis</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[#AAAAAA] mb-2">Kategori</label>
                    <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500" title="Pilih kategori istilah yang akan diujikan.">
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="questionType" className="block text-sm font-medium text-[#AAAAAA] mb-2">Tanyakan tentang...</label>
                    <select id="questionType" value={questionKey} onChange={(e) => setQuestionKey(e.target.value as keyof Definitions | 'random')} className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500" title="Pilih jenis informasi yang akan ditanyakan (definisi, arti, dll).">
                        {questionTypes.map(type => <option key={type.key} value={type.key}>{type.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-[#AAAAAA] mb-2">
                        Jumlah Soal <span className="text-xs opacity-70">(Maks: {maxQuestions})</span>
                    </label>
                    <input
                        id="numQuestions"
                        type="number"
                        value={numQuestions}
                        onChange={(e) => {
                            const val = Math.max(1, Math.min(maxQuestions, Number(e.target.value) || 1));
                            setNumQuestions(val);
                        }}
                        min="1"
                        max={maxQuestions}
                        disabled={maxQuestions === 0}
                        className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Masukkan jumlah soal yang Anda inginkan untuk kuis ini."
                    />
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onExit} className="w-full py-3 px-4 rounded-lg bg-[#525252] text-white font-semibold hover:bg-[#656565] transition-colors">Kembali</button>
                    <button type="submit" disabled={numQuestions === 0 || !categoryId} className="w-full py-3 px-4 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">Mulai Kuis</button>
                </div>
            </form>
        </div>
    );
};

interface QuizActiveProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  startTime: number | null;
  onAnswer: (answer: string) => void;
}

const QuizActive: React.FC<QuizActiveProps> = ({ question, questionNumber, totalQuestions, startTime, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    
    useEffect(() => {
        setSelectedAnswer(null);
        setIsAnswered(false);
    }, [question]);

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
        setTimeout(() => {
            onAnswer(option);
        }, 1200);
    };

    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return "bg-[#525252] hover:bg-[#656565]";
        }
        if (option === question.correctAnswer) {
            return "bg-green-600/80 ring-2 ring-green-400 transform scale-105";
        }
        if (option === selectedAnswer) {
            return "bg-red-600/80 opacity-70";
        }
        return "bg-[#525252] opacity-50";
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-[#494949] rounded-xl border border-[#656565]/50 shadow-2xl">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-[#AAAAAA]">Soal {questionNumber} dari {totalQuestions}</p>
                    <div className="flex items-center gap-1 text-sm text-[#AAAAAA]">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDuration(elapsedTime)}</span>
                    </div>
                </div>
                <div className="w-full bg-[#2d2d2d] rounded-full h-2.5">
                    <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}></div>
                </div>
            </div>
            <div className="text-lg text-white mb-8 min-h-[6rem] flex items-center justify-center text-center">
              <p dangerouslySetInnerHTML={{ __html: question.questionText }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerClick(option)}
                        disabled={isAnswered}
                        className={`p-4 rounded-lg text-white text-left transition-all duration-300 ${getButtonClass(option)} disabled:cursor-not-allowed`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

interface QuizResultsProps {
  results: UserAnswer[];
  durationMs: number;
  onRestart: () => void;
  onExit: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, durationMs, onRestart, onExit }) => {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = results.length > 0 ? Math.round((correctAnswers / results.length) * 100) : 0;
    const incorrectAnswers = results.filter(r => !r.isCorrect);

    return (
        <div className="w-full max-w-3xl mx-auto p-8 bg-[#494949] rounded-xl border border-[#656565]/50 shadow-2xl">
            <h1 className="text-3xl font-bold text-white text-center mb-2">Kuis Selesai!</h1>
            <p className="text-center text-[#AAAAAA] mb-8">Berikut adalah hasil Anda:</p>
            
            <div className="bg-[#2d2d2d] p-6 rounded-lg text-center mb-8 flex flex-col md:flex-row justify-around items-center gap-6 md:gap-4">
                <div className="flex flex-col items-center justify-center">
                   <ScoreRing score={score} />
                   <p className="mt-4 text-white">{correctAnswers} dari {results.length} jawaban benar</p>
                </div>
                <div className="border-t md:border-l border-[#656565]/50 h-px w-full md:h-32 md:w-px"></div>
                <div className="text-center">
                    <p className="text-lg text-[#AAAAAA] mb-2">Waktu Mengerjakan</p>
                    <p className="text-5xl md:text-6xl font-bold text-sky-400 my-2 flex items-center justify-center gap-2">
                        <ClockIcon className="w-10 h-10" />
                        {formatDuration(durationMs)}
                    </p>
                    <p className="text-white">Menit:Detik</p>
                </div>
            </div>

            {incorrectAnswers.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Perlu Dipelajari Lagi</h2>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {incorrectAnswers.map(({ question, userAnswer }, index) => (
                            <div key={index} className="bg-[#2d2d2d]/70 p-4 rounded-lg">
                                <p className="text-sm text-[#AAAAAA] mb-2" dangerouslySetInnerHTML={{ __html: question.questionText }} />
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
                <button onClick={onExit} className="w-full py-3 px-4 rounded-lg bg-[#525252] text-white font-semibold hover:bg-[#656565] transition-colors">Kembali ke Glosarium</button>
                <button onClick={onRestart} className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors">
                    <ArrowPathIcon className="w-5 h-5" />
                    Coba Lagi
                </button>
            </div>
        </div>
    );
};


// --- Main QuizFlow Component ---

interface QuizFlowProps {
    categories: Category[];
    sortedTermsByCategory: Map<string, Term[]>;
    onExit: () => void;
}

export const QuizFlow: React.FC<QuizFlowProps> = ({ categories, sortedTermsByCategory, onExit }) => {
    const [step, setStep] = useState<'setup' | 'active' | 'results'>('setup');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);

    const generateQuestions = useCallback((config: { categoryId: string; numQuestions: number; questionKey: keyof Definitions | 'random' }) => {
        const { categoryId, numQuestions, questionKey: quizType } = config;
        const allTermsInCategory = sortedTermsByCategory.get(categoryId) || [];
        
        let eligibleQuestionPool: { term: Term; questionKey: keyof Definitions }[] = [];

        if (quizType === 'random') {
            allTermsInCategory.forEach(term => {
                (Object.keys(term.definitions) as Array<keyof Definitions>).forEach(key => {
                    const value = term.definitions[key];
                    if (value && value !== '-') {
                        eligibleQuestionPool.push({ term, questionKey: key });
                    }
                });
            });
        } else {
            const eligibleTerms = allTermsInCategory.filter(term => {
                const value = term.definitions[quizType];
                return value && value !== '-';
            });
            eligibleQuestionPool = eligibleTerms.map(term => ({ term, questionKey: quizType }));
        }

        const selectedQuestionsPool = shuffleArray(eligibleQuestionPool).slice(0, numQuestions);

        const newQuestions = selectedQuestionsPool.map(({term, questionKey}) => {
            const correctAnswer = term.title;
            const incorrectOptionsPool = allTermsInCategory
                .map(t => t.title)
                .filter(title => title !== correctAnswer);
            
            const incorrectOptions = shuffleArray(incorrectOptionsPool).slice(0, 3);
            const options = shuffleArray([...incorrectOptions, correctAnswer]);

            const questionTextPrefixMap: Record<keyof Definitions, string> = {
                istilah: 'Istilah untuk definisi:<br/>',
                bahasa: 'Istilah untuk arti bahasa:<br/>',
                kenapaAda: 'Istilah untuk alasan:<br/>',
                contoh: 'Istilah untuk contoh:<br/>',
            };
            
            const prefix = quizType === 'random' ? questionTextPrefixMap[questionKey] : questionTextPrefixMap[quizType];
            const cleanQuestionText = stripHtml(term.definitions[questionKey] as string);

            return {
                term,
                questionText: `${prefix}<em>"${cleanQuestionText}"</em>`,
                options,
                correctAnswer,
            };
        });

        setQuestions(newQuestions);
    }, [sortedTermsByCategory]);

    const handleSetupSubmit = (config: { categoryId: string; numQuestions: number; questionKey: keyof Definitions | 'random' }) => {
        generateQuestions(config);
        setStartTime(Date.now());
        setEndTime(null);
        setStep('active');
    };

    const handleAnswer = (answer: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        setUserAnswers(prev => [
            ...prev,
            {
                question: currentQuestion,
                userAnswer: answer,
                isCorrect: answer === currentQuestion.correctAnswer,
            },
        ]);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setEndTime(Date.now());
            setStep('results');
        }
    };
    
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
                return <QuizSetup categories={categories} sortedTermsByCategory={sortedTermsByCategory} onSubmit={handleSetupSubmit} onExit={onExit} />;
            case 'active':
                if (questions.length === 0 || !questions[currentQuestionIndex]) {
                    return (
                        <div className="text-center text-white bg-[#494949] p-8 rounded-lg">
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
                        onAnswer={handleAnswer}
                    />
                );
            case 'results':
                const duration = endTime && startTime ? endTime - startTime : 0;
                return <QuizResults results={userAnswers} durationMs={duration} onRestart={handleRestart} onExit={onExit} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#222222] flex items-center justify-center p-4">
            {renderStep()}
        </div>
    );
};