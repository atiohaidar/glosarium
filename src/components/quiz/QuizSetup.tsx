import React, { useState, useMemo, useEffect } from 'react';
import { Category, Definitions, Term } from '../../types';
import { QuestionMarkCircleIcon } from '../ui/icons';

interface QuizSetupProps {
  categories: Category[];
  sortedTermsByCategory: Map<string, Term[]>;
  onSubmit: (config: { categoryId: string; numQuestions: number; questionKey: keyof Definitions | 'random' }) => void;
  onExit: () => void;
  selectedCategoryId?: string | null;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({ categories, sortedTermsByCategory, onSubmit, onExit, selectedCategoryId }) => {
    const [categoryId, setCategoryId] = useState(selectedCategoryId || categories[0]?.id || '');
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
        <div className="w-full max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <QuestionMarkCircleIcon className="w-8 h-8 text-sky-400" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pengaturan Kuis</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Kategori</label>
                    <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500" title="Pilih kategori istilah yang akan diujikan.">
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="questionType" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tanyakan tentang...</label>
                    <select id="questionType" value={questionKey} onChange={(e) => setQuestionKey(e.target.value as keyof Definitions | 'random')} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500" title="Pilih jenis informasi yang akan ditanyakan (definisi, arti, dll).">
                        {questionTypes.map(type => <option key={type.key} value={type.key}>{type.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
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
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Masukkan jumlah soal yang Anda inginkan untuk kuis ini."
                    />
                </div>
                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={onExit} className="w-full py-3 px-4 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold hover:bg-[var(--border-primary)] transition-colors">Kembali</button>
                    <button type="submit" disabled={numQuestions === 0 || !categoryId} className="w-full py-3 px-4 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">Mulai Kuis</button>
                </div>
            </form>
        </div>
    );
};