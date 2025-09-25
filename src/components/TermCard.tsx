import React, { useState, useRef } from 'react';
import { Term } from '../types';

interface TermCardProps {
  term: Term;
  allTerms: Term[];
  onEdit?: (term: Term) => void;
  onDelete?: (termId: string) => void;
  onToggleUnderstood?: (termId: string) => void;
}

// This component parses text and wraps found glossary terms in links.
const LinkifiedText: React.FC<{ text: string; allTerms: Term[]; currentTermId: string }> = ({ text, allTerms, currentTermId }) => {
  if (!text || text === "-" || typeof text !== 'string') return <span className="text-gray-500 dark:text-gray-400">-</span>;

  const termMap = new Map(allTerms.map(t => [t.title.toLowerCase(), t.id]));
  const regex = new RegExp(`\\b(${allTerms.map(t => t.title).join('|')})\\b`, 'gi');
  
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (part === undefined || part === null) return <React.Fragment key={i}></React.Fragment>;
        const termId = termMap.get(part.toLowerCase());
        if (termId && termId !== currentTermId) {
          return <a key={i} href={`#term-${termId}`} className="text-sky-400 dark:text-sky-300 hover:underline transition-all hover:drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]">{part}</a>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

// This function takes an HTML string, linkifies terms, and returns a new HTML string.
const linkifyHtmlString = (html: string, allTerms: Term[], currentTermId: string): string => {
    if (!html || html === "-") return "-";
    
    let processedHtml = html;
    allTerms.forEach(term => {
        if(term.id !== currentTermId) {
            const regex = new RegExp(`\\b(${term.title})\\b`, 'gi');
            processedHtml = processedHtml.replace(regex, `<a href="#term-${term.id}" class="text-sky-400 dark:text-sky-300 hover:underline transition-all hover:drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]">${term.title}</a>`);
        }
    });
    return processedHtml;
}


export const TermCard: React.FC<TermCardProps> = ({ term, allTerms, onEdit, onDelete, onToggleUnderstood }) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    setSwipeOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    const deltaX = currentX.current - startX.current;
    const threshold = 100; // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      // Swipe right or left to toggle understood
      if (onToggleUnderstood) {
        onToggleUnderstood(term.id);
        setIsDisappearing(true);
        setTimeout(() => setIsDisappearing(false), 300); // Reset after animation
      }
    }

    setIsSwiping(false);
    setSwipeOffset(0);
  };

  const definitionEntries = Object.entries(term.definitions);
  const labelMap: { [key: string]: string } = {
    bahasa: 'Bahasa',
    istilah: 'Istilah',
    kenapaAda: 'Kenapa Ada',
    contoh: 'Contoh',
    referensi: 'Referensi'
  };

  // Function to extract domain from URL
  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.slice(4) : domain;
    } catch {
      return url; // Fallback if invalid URL
    }
  };

  return (
    <div 
      ref={cardRef}
      id={`term-${term.id}`} 
      className={`bg-[var(--bg-tertiary)] p-6 rounded-xl border transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/20 hover:bg-[var(--bg-secondary)] hover:scale-[1.02] relative ${isDisappearing ? 'opacity-0 scale-95' : 'opacity-100'} touch-pan-y ${
        term.isUnderstood 
          ? 'border-green-400/50 bg-green-50/10 dark:bg-green-950/20' 
          : 'border-[var(--border-primary)]/30'
      }`}
      style={{ transform: `translateX(${swipeOffset}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Edit and Delete buttons */}
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(term)}
              className="p-2 text-[var(--text-primary)] hover:text-white hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              title="Edit istilah"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(term.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              title="Hapus istilah"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}

      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 font-['Poppins'] pr-20">{term.title}</h3>
      
      {/* Sudah paham checkbox */}
      {onToggleUnderstood && (
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={term.isUnderstood || false}
              onChange={() => onToggleUnderstood(term.id)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-[var(--text-primary)]">Sudah paham</span>
          </label>
        </div>
      )}

      <div className="space-y-4">
        {definitionEntries.map(([key, value]) => {
          if (!value || value === '-' || typeof value !== 'string') return null;
          
          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-x-4 gap-y-1">
              <dt className="font-semibold text-sm text-[var(--text-secondary)]">{labelMap[key]}:</dt>
              <dd className={`text-[var(--text-primary)] ${key === 'istilah' ? 'text-lg font-semibold text-[var(--text-primary)]' : ''}`}>
                {key === 'contoh' ? (
                  <div 
                    className="prose prose-sm prose-invert max-w-none 
                               [&_pre]:bg-black/40 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:border [&_pre]:border-gray-700
                               [&_code]:bg-gray-700/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded 
                               [&_pre>code]:bg-transparent [&_pre>code]:p-0"
                    dangerouslySetInnerHTML={{ __html: linkifyHtmlString((value as string).replace(/\\n/g, '\n'), allTerms, term.id) }} 
                  />
                ) : (
                  <LinkifiedText text={value as string} allTerms={allTerms} currentTermId={term.id} />
                )}
              </dd>
            </div>
          );
        })}

        {/* References */}
        {term.definitions.referensi && term.definitions.referensi.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-x-4 gap-y-1">
            <dt className="font-semibold text-sm text-[var(--text-secondary)]">Referensi:</dt>
            <dd className="flex flex-wrap gap-2">
              {term.definitions.referensi.map((source, index) => (
                <button
                  key={index}
                  onClick={() => window.open(source, '_blank')}
                  className="inline-flex items-center px-3 py-1 text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] text-[var(--text-secondary)] rounded-full transition-colors cursor-pointer border border-[var(--border-primary)]/30"
                  title={source} // Show full URL on hover
                >
                  {extractDomain(source)}
                </button>
              ))}
            </dd>
          </div>
        )}
      </div>
    </div>
  );
};