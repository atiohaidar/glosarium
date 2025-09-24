import React from 'react';
import { Term } from '../../types';

// This component parses text and wraps found glossary terms in links.
export const LinkifiedText: React.FC<{ text: string; allTerms: Term[]; currentTermId: string }> = ({ text, allTerms, currentTermId }) => {
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