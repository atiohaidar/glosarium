import React from 'react';
import { Category, Term } from '../../types';
import { TermCard } from './TermCard';
import { DependencyGraph } from './DependencyGraph';

interface MainContentProps {
    viewMode: 'list' | 'graph';
    displayTerms: Term[];
    currentTerms: Term[];
    currentGraphData: { nodes: any[]; links: any[] };
    searchTerm: string;
    selectedCategoryId: string | null;
    theme: string;
    onEditTerm?: (term: Term) => void;
    onDeleteTerm?: (termId: string) => void;
    onNodeClick: (term: Term) => void;
}

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

export const MainContent: React.FC<MainContentProps> = ({
    viewMode,
    displayTerms,
    currentTerms,
    currentGraphData,
    searchTerm,
    selectedCategoryId,
    theme,
    onEditTerm,
    onDeleteTerm,
    onNodeClick
}) => {
    return (
        <div className="flex-1 relative overflow-hidden">
            <div className={viewMode === 'list' ? 'block h-full' : 'hidden'} key={selectedCategoryId + '-' + searchTerm}>
                <TermList terms={displayTerms} allTerms={currentTerms} onEditTerm={onEditTerm} onDeleteTerm={onDeleteTerm} />
            </div>
            <div className={viewMode === 'graph' ? 'block h-full' : 'hidden'}>
                <DependencyGraph
                    graphData={currentGraphData}
                    terms={currentTerms}
                    onNodeClick={onNodeClick}
                    theme={theme as 'dark' | 'light'}
                    searchTerm={searchTerm}
                />
            </div>
        </div>
    );
};