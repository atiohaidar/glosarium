import React from 'react';
import { Term } from '../types';

interface TermCardProps {
  term: Term;
  allTerms: Term[];
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


export const TermCard: React.FC<TermCardProps> = ({ term, allTerms }) => {
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
    <div id={`term-${term.id}`} className="bg-[#494949]/30 dark:bg-[#494949]/50 p-6 rounded-xl border border-[#656565]/30 dark:border-[#656565]/50 transition-all duration-300 hover:border-sky-500/70 hover:shadow-lg hover:shadow-sky-500/10">
      <h3 className="text-xl font-bold text-slate-100 dark:text-white mb-4 font-['Poppins']">{term.title}</h3>
      <div className="space-y-4">
        {definitionEntries.map(([key, value]) => {
          if (!value || value === '-' || typeof value !== 'string') return null;
          
          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-x-4 gap-y-1">
              <dt className="font-semibold text-sm text-slate-400 dark:text-slate-300">{labelMap[key]}:</dt>
              <dd className={`text-slate-300 dark:text-[#AAAAAA] ${key === 'istilah' ? 'text-lg font-semibold text-slate-100 dark:text-white' : ''}`}>
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
            <dt className="font-semibold text-sm text-slate-400 dark:text-slate-300">Referensi:</dt>
            <dd className="flex flex-wrap gap-2">
              {term.definitions.referensi.map((source, index) => (
                <button
                  key={index}
                  onClick={() => window.open(source, '_blank')}
                  className="inline-flex items-center px-3 py-1 text-xs bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300 rounded-full transition-colors cursor-pointer border border-[#656565]/30"
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