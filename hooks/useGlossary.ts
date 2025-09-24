import { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, Term, GlossaryData, Node, Link, GraphData } from '../types';

// Helper function to sort terms based on dependencies within their definitions
const sortTermsByDependency = (terms: Term[]): Term[] => {
  const termMap = new Map(terms.map(t => [t.title.toLowerCase(), t]));
  const termTitles = terms.map(t => t.title.toLowerCase());

  const dependencyGraph = new Map<string, Set<string>>();

  terms.forEach(term => {
    const termKey = term.title.toLowerCase();
    dependencyGraph.set(termKey, new Set());
    const fullText = Object.values(term.definitions).join(' ').toLowerCase();

    termTitles.forEach(otherTitle => {
      if (termKey !== otherTitle) {
        // Use word boundary regex to avoid partial matches (e.g., 'ai' in 'chain')
        const regex = new RegExp(`\\b${otherTitle}\\b`, 'g');
        if (regex.test(fullText)) {
          dependencyGraph.get(termKey)?.add(otherTitle);
        }
      }
    });
  });

  return [...terms].sort((a, b) => {
    const depsA = dependencyGraph.get(a.title.toLowerCase())?.size || 0;
    const depsB = dependencyGraph.get(b.title.toLowerCase())?.size || 0;
    if (depsA !== depsB) {
      return depsA - depsB;
    }
    return a.title.localeCompare(b.title); // Alphabetical fallback
  });
};

export const useGlossary = () => {
  const [data, setData] = useState<GlossaryData>({ categories: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlossaryData = async () => {
      try {
        const response = await fetch('./data/glossary.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const jsonData = await response.json();
        setData(jsonData as GlossaryData);
      } catch (e) {
        setError('Failed to load glossary data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchGlossaryData();
  }, []);

  const categories = useMemo(() => data.categories, [data]);

  const getCategoryById = useCallback((id: string | null): Category | undefined => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const sortedTermsByCategory = useMemo(() => {
    const sortedMap = new Map<string, Term[]>();
    categories.forEach(category => {
      // FIX: Filter out terms that are missing a title to prevent runtime errors.
      const validTerms = category.terms.filter(term => term && term.title);
      sortedMap.set(category.id, sortTermsByDependency(validTerms));
    });
    return sortedMap;
  }, [categories]);
    
  const graphDataByCategory = useMemo(() => {
    const graphMap = new Map<string, GraphData>();

    categories.forEach(category => {
        const terms = category.terms.filter(term => term && term.title);
        if (terms.length === 0) {
            graphMap.set(category.id, { nodes: [], links: [] });
            return;
        }
        // FIX: Explicitly type termMap to ensure correct type inference for its values.
        const termMap = new Map<string, Term>(terms.map(t => [t.title.toLowerCase(), t]));
        const termTitles = terms.map(t => t.title.toLowerCase());

        const links: Link[] = [];
        const connectionCount = new Map<string, number>();

        terms.forEach(term => {
            connectionCount.set(term.id, 0);
            const fullText = Object.values(term.definitions).join(' ').toLowerCase();

            termTitles.forEach(otherTitle => {
                const otherTerm = termMap.get(otherTitle);
                if (term.id !== otherTerm?.id && otherTerm) {
                    const regex = new RegExp(`\\b${otherTitle}\\b`, 'g');
                    if (regex.test(fullText)) {
                        links.push({ source: term.id, target: otherTerm.id });
                        connectionCount.set(term.id, (connectionCount.get(term.id) || 0) + 1);
                        connectionCount.set(otherTerm.id, (connectionCount.get(otherTerm.id) || 0) + 1);
                    }
                }
            });
        });

        const nodes: Node[] = terms.map(term => ({
            id: term.id,
            title: term.title,
            radius: 8 + (connectionCount.get(term.id) || 0) * 1.5,
        }));

        graphMap.set(category.id, { nodes, links });
    });

    return graphMap;
  }, [categories]);

  const loadCustomGlossary = useCallback((customData: GlossaryData) => {
    if (customData && Array.isArray(customData.categories)) {
        setData(customData);
        setError(null);
    } else {
        setError("Invalid glossary file format.");
        // Optionally, revert to original data or clear it
        setData({ categories: [] });
    }
  }, []);

  return { categories, loading, error, getCategoryById, sortedTermsByCategory, loadCustomGlossary, graphDataByCategory };
};