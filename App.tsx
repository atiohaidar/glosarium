import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Category, Term, GlossaryData } from './types';
import { useGlossary } from './hooks/useGlossary';
import { TermCard } from './components/TermCard';
import { QuizFlow } from './components/QuizFlow';
import { DependencyGraph } from './components/DependencyGraph';
import { Modal } from './components/Modal';
import { 
    SearchIcon, SunIcon, MoonIcon, CodeBracketIcon, 
    ChevronDoubleLeftIcon, Bars3Icon, QuestionMarkCircleIcon, 
    ArrowUpTrayIcon, BarsArrowUpIcon, BarsArrowDownIcon, GraphIcon
} from './components/icons';

// --- Helper Components defined outside App to prevent re-creation on render ---

const ThemeToggle: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full bg-[#525252] hover:bg-[#656565] text-[#AAAAAA] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
  </button>
);

const SearchInput: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ value, onChange }) => (
    <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-[#AAAAAA]" />
        </div>
        <input
            type="text"
            placeholder="Cari istilah..."
            value={value}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 bg-[#2d2d2d] border border-[#656565] rounded-lg text-[#AAAAAA] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        />
    </div>
);

const Sidebar: React.FC<{ 
    categories: Category[]; 
    selectedCategoryId: string | null; 
    onSelectCategory: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onUploadGlossary: (data: GlossaryData) => void;
}> = ({ categories, selectedCategoryId, onSelectCategory, isOpen, onClose, onUploadGlossary }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Could not read file content.");
                }
                const jsonData = JSON.parse(text);
                // Basic validation
                if (jsonData && Array.isArray(jsonData.categories)) {
                    onUploadGlossary(jsonData);
                    alert("Glosarium berhasil dimuat!");
                } else {
                    throw new Error("Invalid JSON format: 'categories' array not found.");
                }
            } catch (error) {
                console.error("Failed to load or parse glossary file:", error);
                alert("Gagal memuat glosarium. Pastikan format file JSON sudah benar.");
            }
        };
        reader.onerror = () => {
             alert("Gagal membaca file.");
        }
        reader.readAsText(file);
        
        // Reset input value to allow re-uploading the same file
        if(event.target) event.target.value = '';
    };

    return (
        <aside className={`
            flex-shrink-0 bg-[#2d2d2d] md:bg-transparent
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-full md:w-64 lg:w-72 p-4 md:p-6' : 'w-0 p-0'}
            overflow-hidden
        `}>
            <div className="flex flex-col h-full min-w-[230px] md:min-w-0">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <CodeBracketIcon className="w-8 h-8 text-sky-400"/>
                        <h1 className="text-xl font-bold text-white">Glosarium</h1>
                    </div>
                     <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-[#525252] text-[#AAAAAA] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
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
                            className={`px-4 py-2 text-left rounded-md w-full whitespace-nowrap transition-all duration-200 text-sm md:text-base ${
                                selectedCategoryId === cat.id
                                    ? 'bg-sky-500/80 text-white font-semibold shadow-md shadow-sky-500/30'
                                    : 'text-[#AAAAAA] hover:bg-[#525252] hover:text-white'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </nav>
                 <div className="mt-4 pt-4 border-t border-[#656565]/30">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <button
                        onClick={handleUploadClick}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-left rounded-md transition-all duration-200 text-sm md:text-base bg-[#525252] text-[#AAAAAA] hover:bg-[#656565] hover:text-white"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5"/>
                        Unggah Glosarium
                    </button>
                </div>
            </div>
        </aside>
    );
};

const TermList: React.FC<{ terms: Term[]; allTerms: Term[] }> = ({ terms, allTerms }) => (
    <main className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto h-full">
        {terms.length > 0 ? (
            terms.map((term, index) => (
                <div key={term.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>
                    <TermCard term={term} allTerms={allTerms} />
                </div>
            ))
        ) : (
            <div className="text-center py-10">
                <p className="text-[#AAAAAA]">Tidak ada istilah yang cocok dengan pencarian Anda.</p>
            </div>
        )}
    </main>
);

// --- Main App Component ---

const App: React.FC = () => {
  const { categories, loading, error, sortedTermsByCategory, loadCustomGlossary, graphDataByCategory } = useGlossary();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [sortMode, setSortMode] = useState<'dependency' | 'alphabetical'>('dependency');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [selectedTermForModal, setSelectedTermForModal] = useState<Term | null>(null);

  useEffect(() => {
    // Set or reset initial category when data loads or changes
    if (categories.length > 0 && !categories.some(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
    } else if (categories.length === 0) {
      setSelectedCategoryId(null);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    // Apply theme to HTML element for Tailwind dark mode
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    root.style.backgroundColor = theme === 'dark' ? '#222222' : '#f3f4f6';
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
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const currentTerms = useMemo(() => {
    return selectedCategoryId ? sortedTermsByCategory.get(selectedCategoryId) || [] : [];
  }, [selectedCategoryId, sortedTermsByCategory]);

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
    return <div className="flex justify-center items-center h-screen bg-[#222222] text-[#AAAAAA]">Loading Glossary...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen bg-[#222222] text-red-500">{error}</div>;
  }
  
  if (isQuizMode) {
    return <QuizFlow categories={categories} sortedTermsByCategory={sortedTermsByCategory} onExit={() => setIsQuizMode(false)} />;
  }

  return (
    <div className="bg-[#222222] dark:bg-[#222222] text-[#AAAAAA] dark:text-[#AAAAAA] min-h-screen flex flex-col md:flex-row transition-colors">
        <Sidebar 
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onUploadGlossary={loadCustomGlossary}
        />
        <div className="flex-1 flex flex-col bg-[#222222] dark:bg-[#2d2d2d]/30 md:border-l border-[#656565]/30 overflow-hidden">
            <header className="p-4 md:p-6 border-b border-[#656565]/30 flex items-center gap-2 md:gap-4 flex-wrap">
                {!isSidebarOpen && (
                     <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-full bg-[#525252] hover:bg-[#656565] text-[#AAAAAA] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
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
                        className="p-2 rounded-full bg-[#525252] hover:bg-[#656565] text-[#AAAAAA] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                        aria-label={`Tampilan ${viewMode === 'list' ? 'Grafik' : 'Daftar'}`}
                        title={`Beralih ke tampilan ${viewMode === 'list' ? 'Grafik' : 'Daftar'}`}
                    >
                        <GraphIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-0.5 bg-[#2d2d2d] rounded-full p-1 border border-[#656565]/80">
                        <button
                            onClick={() => setSortMode(prev => prev === 'dependency' ? 'alphabetical' : 'dependency')}
                            className={`px-3 py-1 rounded-full transition-all text-xs font-semibold whitespace-nowrap ${sortMode === 'dependency' ? 'bg-sky-600 text-white shadow-sm' : 'text-[#AAAAAA] hover:bg-[#525252]'}`}
                            aria-label="Toggle sort mode"
                            title={`Urutkan berdasarkan ${sortMode === 'dependency' ? 'Abjad' : 'Dependensi'}`}
                        >
                            {sortMode === 'dependency' ? 'Dependensi' : 'Abjad'}
                        </button>
                        <button
                            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-1.5 rounded-full text-[#AAAAAA] hover:bg-[#525252] transition-all"
                            aria-label="Toggle sort direction"
                            title={`Arah urutan ${sortDirection === 'asc' ? 'Menurun' : 'Menaik'}`}
                        >
                            {sortDirection === 'asc' ? <BarsArrowUpIcon className="w-5 h-5" /> : <BarsArrowDownIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    <button
                        onClick={() => setIsQuizMode(true)}
                        className="p-2 rounded-full bg-[#525252] hover:bg-[#656565] text-[#AAAAAA] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                        aria-label="Start Quiz"
                    >
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                    </button>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </header>
            <div className="flex-1 relative overflow-hidden">
                <div className={viewMode === 'list' ? 'block h-full' : 'hidden'} key={selectedCategoryId + '-' + searchTerm}>
                  <TermList terms={displayTerms} allTerms={currentTerms} />
                </div>
                <div className={viewMode === 'graph' ? 'block h-full' : 'hidden'}>
                    {selectedCategoryId && (
                        <DependencyGraph 
                            graphData={graphDataByCategory.get(selectedCategoryId) || { nodes: [], links: [] }}
                            terms={currentTerms}
                            onNodeClick={setSelectedTermForModal}
                            theme={theme as 'dark' | 'light'}
                            searchTerm={searchTerm}
                        />
                    )}
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
    </div>
  );
};

export default App;