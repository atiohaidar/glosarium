import React from 'react';
import { Category, Term } from '../../types';
import {
    SearchIcon, SunIcon, MoonIcon,
    ChevronDoubleLeftIcon, Bars3Icon,
    BarsArrowUpIcon, BarsArrowDownIcon, GraphIcon
} from './icons';

interface HeaderProps {
    isSidebarOpen: boolean;
    onSidebarToggle: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    viewMode: 'list' | 'graph';
    onViewModeChange: () => void;
    sortMode: 'dependency' | 'alphabetical';
    onSortModeChange: () => void;
    sortDirection: 'asc' | 'desc';
    onSortDirectionChange: () => void;
    theme: string;
    onThemeToggle: () => void;
}

const ThemeToggle: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
        aria-label="Toggle theme"
    >
        {theme === 'dark' ? <SunIcon className="w-5 h-5 pointer-events-none" /> : <MoonIcon className="w-5 h-5 pointer-events-none" />}
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

export const Header: React.FC<HeaderProps> = ({
    isSidebarOpen,
    onSidebarToggle,
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
    sortMode,
    onSortModeChange,
    sortDirection,
    onSortDirectionChange,
    theme,
    onThemeToggle
}) => {
    return (
        <header className="p-4 md:p-6 border-b border-[var(--border-primary)]/30 flex items-center gap-2 md:gap-4 flex-wrap">
            {!isSidebarOpen && (
                <button
                    onClick={onSidebarToggle}
                    className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                    aria-label="Open sidebar"
                >
                    <Bars3Icon className="w-5 h-5 pointer-events-none" />
                </button>
            )}
            <div className="flex-1 min-w-[200px]">
                <SearchInput value={searchTerm} onChange={onSearchChange} />
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onViewModeChange}
                    className="p-2 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                    aria-label={`Tampilan ${viewMode === 'list' ? 'Grafik' : 'Daftar'}`}
                    title={`Beralih ke tampilan ${viewMode === 'list' ? 'Grafik' : 'Daftar'}`}
                >
                                            <GraphIcon className="w-5 h-5 pointer-events-none" />
                </button>
                <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] rounded-full p-1 border border-[var(--border-primary)]/80">
                    <button
                        onClick={onSortModeChange}
                        className={`px-3 py-1 rounded-full transition-all text-xs font-semibold whitespace-nowrap ${sortMode === 'dependency' ? 'bg-sky-600 text-white shadow-sm' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                        aria-label="Toggle sort mode"
                        title={`Urutkan berdasarkan ${sortMode === 'dependency' ? 'Abjad' : 'Dependensi'}`}
                    >
                        {sortMode === 'dependency' ? 'Dependensi' : 'Abjad'}
                    </button>
                    <button
                        onClick={onSortDirectionChange}
                        className="p-1.5 rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                        aria-label="Toggle sort direction"
                        title={`Arah urutan ${sortDirection === 'asc' ? 'Menurun' : 'Menaik'}`}
                    >
                        {sortDirection === 'asc' ? <BarsArrowUpIcon className="w-5 h-5" /> : <BarsArrowDownIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <ThemeToggle theme={theme} toggleTheme={onThemeToggle} />
            </div>
        </header>
    );
};