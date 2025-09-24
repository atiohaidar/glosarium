import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, Term } from './types';
import { useGlossary } from './hooks/useGlossary';
import { Sidebar, Header, MainContent, ModalsContainer, FloatingButtons, Modal, TermCard, AddTermForm, DependencyGraph, Bars3Icon, GraphIcon, BarsArrowUpIcon, BarsArrowDownIcon, SunIcon, MoonIcon, SearchIcon, ChevronDoubleLeftIcon } from './components/ui';
import { DataManagement } from './components/data';
import { QuizFlow } from './components/quiz';

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

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen flex flex-col md:flex-row transition-colors">
        <Sidebar 
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onImportData={importData}
        />
        <div className="flex-1 flex flex-col bg-[var(--bg-primary)] md:border-l border-[var(--border-primary)]/30 overflow-hidden">
            <Header
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortMode={sortMode}
                onSortModeChange={setSortMode}
                sortDirection={sortDirection}
                onSortDirectionChange={setSortDirection}
                theme={theme}
                onThemeToggle={toggleTheme}
                isSidebarOpen={isSidebarOpen}
                onSidebarToggle={() => setIsSidebarOpen(true)}
            />
            <MainContent
                viewMode={viewMode}
                displayTerms={displayTerms}
                currentTerms={currentTerms}
                currentGraphData={currentGraphData}
                searchTerm={searchTerm}
                theme={theme as 'dark' | 'light'}
                onEditTerm={handleEditTerm}
                onDeleteTerm={handleDeleteTerm}
                onNodeClick={setSelectedTermForModal}
            />
        </div>
        <ModalsContainer
            selectedTermForModal={selectedTermForModal}
            onCloseTermModal={() => setSelectedTermForModal(null)}
            currentTerms={currentTerms}
            isQuizMode={isQuizMode}
            onCloseQuiz={() => setIsQuizMode(false)}
            categories={categories}
            sortedTermsByCategory={sortedTermsByCategory}
            selectedCategoryId={selectedCategoryId}
            editingTerm={editingTerm}
            onCloseEditModal={() => setEditingTerm(null)}
            onUpdateTerm={(categoryId, termId, updates) => {
                updateTerm(categoryId, termId, updates);
                setEditingTerm(null);
            }}
            isAddTermMode={isAddTermMode}
            onCloseAddModal={() => setIsAddTermMode(false)}
            onSaveTerm={(categoryId, term) => {
                addTerm(categoryId, term);
                setIsAddTermMode(false);
            }}
        />
        <FloatingButtons
            onStartQuiz={() => setIsQuizMode(true)}
            onAddTerm={() => setIsAddTermMode(true)}
            selectedCategoryId={selectedCategoryId}
            categories={categories}
        />
        <DataManagement
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onAddTerm={addTerm}
            onUpdateTerm={updateTerm}
            onDeleteTerm={deleteTerm}
            onBulkAddTerms={bulkAddTerms}
            onExportData={exportData}
            onImportData={importData}
            onResetToDefault={resetToDefault}
            onClearLocalData={clearLocalData}
        />
    </div>
  );
};

export default App;