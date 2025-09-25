import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, Term } from './types';
import { useGlossary } from './hooks/useGlossary';
import { TermCard } from './components/TermCard';
import { QuizFlow } from './components/QuizFlow';
import { DependencyGraph } from './components/DependencyGraph';
import { Modal } from './components/Modal';
import { DataManagement } from './components/DataManagement';
import { AddTermForm } from './components/AddTermForm';
import BulkDataEditor from './components/BulkDataEditor';
import {
    SearchIcon, SunIcon, MoonIcon,
    ChevronDoubleLeftIcon, Bars3Icon,
    BarsArrowUpIcon, BarsArrowDownIcon, GraphIcon
} from './components/icons';

// --- Helper Components defined outside App to prevent re-creation on render ---

const ThemeToggle: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
        aria-label="Toggle theme"
    >
        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </button>
);

const SearchInput: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ value, onChange }) => (
    <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        <input
            type="text"
            placeholder="Cari istilah..."
            value={value}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
    </div>
);

interface SidebarProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onSelectCategory: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    _onImportData: (jsonString: string) => boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategoryId, onSelectCategory, isOpen, onClose, _onImportData }) => {

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
                        <img src="./PP-Tio.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
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
                            className={`px-4 py-2 text-left rounded-md w-full whitespace-nowrap transition-all duration-200 text-sm md:text-base ${selectedCategoryId === cat.id
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

const TermList: React.FC<{ terms: Term[]; allTerms: Term[]; onEditTerm?: (term: Term) => void; onDeleteTerm?: (termId: string) => void }> = ({ terms, allTerms, onEditTerm, onDeleteTerm }) => (
    <main className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto h-full">
        {terms.length > 0 ? (
            terms.map((term, index) => (
                <div key={term.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>
                    <TermCard term={term} allTerms={allTerms} onEdit={onEditTerm} onDelete={onDeleteTerm} />
                </div>
            ))
        ) : (
            <div className="text-center py-10">
                <p className="text-[var(--text-secondary)]">Tidak ada istilah yang cocok dengan pencarian Anda.</p>
            </div>
        )}
    </main>
);

// --- Main App Component ---

const App: React.FC = () => {
    const {
        categories,
        loading,
        error,
        sortedTermsByCategory,
        graphDataByCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        addTerm,
        updateTerm,
        deleteTerm,
        bulkAddTerms,
        exportData,
        importData,
        resetToDefault,
        clearLocalData
    } = useGlossary();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [theme, setTheme] = useState(() => {
        // Load theme from localStorage or default to 'dark'
        const savedTheme = localStorage.getItem('glosarium-theme');
        return savedTheme || 'dark';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [isBulkEditorMode, setIsBulkEditorMode] = useState(false);
    const [sortMode, setSortMode] = useState<'dependency' | 'alphabetical'>('dependency');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    const [selectedTermForModal, setSelectedTermForModal] = useState<Term | null>(null);
    const [editingTerm, setEditingTerm] = useState<Term | null>(null);
    const [isAddTermMode, setIsAddTermMode] = useState(false);

    useEffect(() => {
        // Set or reset initial category when data loads or changes
        if (categories.length > 0 && !categories.some(c => c.id === selectedCategoryId)) {
            setSelectedCategoryId(categories[0].id);
        } else if (categories.length === 0) {
            setSelectedCategoryId(null);
        }
    }, [categories, selectedCategoryId]);

    useEffect(() => {
        // Apply theme to HTML element for Tailwind dark mode and CSS variables
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Update CSS variables for custom colors
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#1a1a1a');
            root.style.setProperty('--bg-secondary', '#2a2a2a');
            root.style.setProperty('--bg-tertiary', '#3a3a3a');
            root.style.setProperty('--text-primary', '#e5e5e5');
            root.style.setProperty('--text-secondary', '#a0a0a0');
            root.style.setProperty('--border-primary', '#404040');
            root.style.setProperty('--accent', '#0ea5e9');
        } else {
            root.style.setProperty('--bg-primary', '#f8fafc');
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--bg-tertiary', '#f1f5f9');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--border-primary', '#e2e8f0');
            root.style.setProperty('--accent', '#3b82f6');
        }

        root.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f8fafc';
    }, [theme]);

    // Effect for highlighting term cards on internal link clicks
    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a[href^="#term-"]');
            if (anchor) {
                const href = anchor.getAttribute('href');
                if (href) {
                    const elementId = href.substring(1);
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.classList.remove('animate-highlight');
                        // Trigger reflow to restart animation
                        void element.offsetWidth;
                        element.classList.add('animate-highlight');
                    }
                }
            }
        }

        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('glosarium-theme', newTheme);
            return newTheme;
        });
    };

    const handleEditTerm = useCallback((term: Term) => {
        setEditingTerm(term);
    }, []);

    const handleDeleteTerm = useCallback((termId: string) => {
        // Find the category that contains this term
        const category = categories.find(cat => cat.terms.some(t => t.id === termId));
        if (category && window.confirm('Apakah Anda yakin ingin menghapus istilah ini?')) {
            deleteTerm(category.id, termId);
        }
    }, [categories, deleteTerm]);

    const currentGraphData = useMemo(() => {
        if (selectedCategoryId) {
            return graphDataByCategory.get(selectedCategoryId) || { nodes: [], links: [] };
        }
        // If no category is selected, use the first category's data if available
        if (categories.length > 0) {
            return graphDataByCategory.get(categories[0].id) || { nodes: [], links: [] };
        }
        return { nodes: [], links: [] };
    }, [selectedCategoryId, categories, graphDataByCategory]);

    const currentTerms = useMemo(() => {
        if (selectedCategoryId) {
            return sortedTermsByCategory.get(selectedCategoryId) || [];
        }
        // If no category is selected, use the first category's terms if available
        if (categories.length > 0) {
            return sortedTermsByCategory.get(categories[0].id) || [];
        }
        return [];
    }, [selectedCategoryId, categories, sortedTermsByCategory]);

    const displayTerms = useMemo(() => {
        let sortedTerms = [...currentTerms]; // Make a copy

        // 1. Apply sorting based on mode
        if (sortMode === 'alphabetical') {
            sortedTerms.sort((a, b) => a.title.localeCompare(b.title));
        }
        // If sortMode is 'dependency', it's already sorted that way from useGlossary hook.

        // 2. Apply direction
        if (sortDirection === 'desc') {
            sortedTerms.reverse();
        }

        // 3. Apply search filter
        if (!searchTerm) {
            return sortedTerms;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return sortedTerms.filter(term =>
            term.title.toLowerCase().includes(lowercasedFilter) ||
            Object.values(term.definitions).some(def => typeof def === 'string' && def.toLowerCase().includes(lowercasedFilter))
        );
    }, [currentTerms, sortMode, sortDirection, searchTerm]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">Loading Glossary...</div>;
    }
    if (error) {
        return <div className="flex justify-center items-center h-screen bg-[var(--bg-primary)] text-red-500">{error}</div>;
    }

    if (isBulkEditorMode) {
        return <BulkDataEditor onBack={() => setIsBulkEditorMode(false)} onImportData={importData} existingData={exportData()} />;
    }

    return (
        <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col md:flex-row transition-colors">
            <Sidebar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                _onImportData={importData}
            />
            <div className="flex-1 flex flex-col bg-[var(--bg-primary)] md:border-l border-[var(--border-primary)]/30 overflow-hidden">
                <header className="p-4 md:p-6 border-b border-[var(--border-primary)]/30 flex items-center gap-2 md:gap-4 flex-wrap">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                            aria-label="Open sidebar"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex-1 min-w-[200px]">
                        <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(prev => prev === 'list' ? 'graph' : 'list')}
                            className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                            aria-label={`Tampilan ${viewMode === 'list' ? 'Grafik' : 'Daftar'}`}
                            title={`Beralih ke tampilan ${viewMode === 'list' ? 'Grafik' : 'Daftar'}`}
                        >
                            <GraphIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] rounded-full p-1 border border-[var(--border-primary)]/80">
                            <button
                                onClick={() => setSortMode(prev => prev === 'dependency' ? 'alphabetical' : 'dependency')}
                                className={`px-3 py-1 rounded-full transition-all text-xs font-semibold whitespace-nowrap ${sortMode === 'dependency' ? 'bg-sky-600 text-white shadow-sm' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                                aria-label="Toggle sort mode"
                                title={`Urutkan berdasarkan ${sortMode === 'dependency' ? 'Abjad' : 'Dependensi'}`}
                            >
                                {sortMode === 'dependency' ? 'Dependensi' : 'Abjad'}
                            </button>
                            <button
                                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-1.5 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                                aria-label="Toggle sort direction"
                                title={`Arah urutan ${sortDirection === 'asc' ? 'Menurun' : 'Menaik'}`}
                            >
                                {sortDirection === 'asc' ? <BarsArrowUpIcon className="w-5 h-5" /> : <BarsArrowDownIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </div>
                </header>
                <div className="flex-1 relative overflow-hidden">
                    <div className={viewMode === 'list' ? 'block h-full' : 'hidden'} key={selectedCategoryId + '-' + searchTerm}>
                        <TermList terms={displayTerms} allTerms={currentTerms} onEditTerm={handleEditTerm} onDeleteTerm={handleDeleteTerm} />
                    </div>
                    <div className={viewMode === 'graph' ? 'block h-full' : 'hidden'}>
                        <DependencyGraph
                            graphData={currentGraphData}
                            terms={currentTerms}
                            onNodeClick={setSelectedTermForModal}
                            theme={theme as 'dark' | 'light'}
                            searchTerm={searchTerm}
                        />
                    </div>
                </div>
            </div>
            {selectedTermForModal && (
                <Modal onClose={() => setSelectedTermForModal(null)}>
                    <div className="p-1">
                        <TermCard term={selectedTermForModal} allTerms={currentTerms} />
                    </div>
                </Modal>
            )}

            {/* Floating Quiz Button */}
            <button
                onClick={() => setIsQuizMode(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.6)] hover:scale-110 z-50 group"
                aria-label="Mulai Quiz"
                title="Mulai Quiz - Uji pengetahuan Anda tentang istilah teknis"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Mulai Quiz
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            </button>

            {/* Floating Bulk Editor Button */}
            <button
                onClick={() => setIsBulkEditorMode(true)}
                className="fixed bottom-24 right-6 p-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:scale-110 z-50 group"
                aria-label="Bulk Data Editor"
                title="Bulk Data Editor - Isi data secara massal"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Bulk Editor
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            </button>

            {/* Quiz Modal */}
            {isQuizMode && (
                <Modal onClose={() => setIsQuizMode(false)}>
                    <div className="p-6 pt-12">
                        <QuizFlow categories={categories} sortedTermsByCategory={sortedTermsByCategory} onExit={() => setIsQuizMode(false)} selectedCategoryId={selectedCategoryId} />
                    </div>
                </Modal>
            )}

            {/* Edit Term Modal */}
            {editingTerm && (
                <Modal onClose={() => setEditingTerm(null)}>
                    <div className="w-full max-w-2xl p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Edit Istilah</h2>
                        <AddTermForm
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            editingTerm={editingTerm}
                            onSave={(categoryId, term) => {
                                // If editingTerm exists, update the term
                                if (editingTerm) {
                                    updateTerm(categoryId, editingTerm.id, term);
                                }
                                setEditingTerm(null);
                            }}
                            onUpdate={(categoryId, termId, updates) => {
                                updateTerm(categoryId, termId, updates);
                                setEditingTerm(null);
                            }}
                            onCancel={() => setEditingTerm(null)}
                        />
                    </div>
                </Modal>
            )}

            {/* Floating Add Term Button */}
            <button
                onClick={() => setIsAddTermMode(true)}
                disabled={!selectedCategoryId && categories.length === 0}
                className="fixed bottom-24 left-6 p-4 rounded-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:scale-110 z-50 group"
                aria-label="Tambah Istilah"
                title="Tambah Istilah Baru"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Tambah Istilah
                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
            </button>

            {/* Add Term Modal */}
            {isAddTermMode && (
                <Modal onClose={() => setIsAddTermMode(false)}>
                    <div className="w-full max-w-2xl p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                            Tambah Istilah Baru {selectedCategoryId && categories.find(c => c.id === selectedCategoryId) ? `di "${categories.find(c => c.id === selectedCategoryId)?.name}"` : ''}
                        </h2>
                        <AddTermForm
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            onSave={(categoryId, term) => {
                                addTerm(categoryId, term);
                                setIsAddTermMode(false);
                            }}
                            onCancel={() => setIsAddTermMode(false)}
                        />
                    </div>
                </Modal>
            )}

            {/* Data Management */}
            <DataManagement
                categories={categories}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                onUpdateTerm={updateTerm}
                onDeleteTerm={deleteTerm}
                onExportData={exportData}
                onImportData={importData}
                onResetToDefault={resetToDefault}
            />
        </div>
    );
};

export default App;