import { Term } from '../types';

// Function to extract domain from URL
export const extractDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.startsWith('www.') ? domain.slice(4) : domain;
  } catch {
    return url; // Fallback if invalid URL
  }
};

// This function takes an HTML string, linkifies terms, and returns a new HTML string.
export const linkifyHtmlString = (html: string, allTerms: Term[], currentTermId: string): string => {
  if (!html || html === "-") return "-";

  let processedHtml = html;
  allTerms.forEach(term => {
    if(term.id !== currentTermId) {
      const regex = new RegExp(`\\b(${term.title})\\b`, 'gi');
      processedHtml = processedHtml.replace(regex, `<a href="#term-${term.id}" class="text-sky-400 dark:text-sky-300 hover:underline transition-all hover:drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]">${term.title}</a>`);
    }
  });
  return processedHtml;
};