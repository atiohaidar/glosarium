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

  // Load data from localStorage first, then fallback to default file
  useEffect(() => {
    const loadGlossaryData = async () => {
      try {
        // First, try to load from localStorage
        const localData = localStorage.getItem('glosarium-data');
        if (localData) {
          const parsedData = JSON.parse(localData);
          setData(parsedData);
          setLoading(false);
          return;
        }

        // If no localStorage data, load from default file
        const response = await fetch('./data/glossary.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const jsonData = await response.json();
        setData(jsonData as GlossaryData);
        // Save to localStorage for future use
        localStorage.setItem('glosarium-data', JSON.stringify(jsonData));
      } catch (e) {
        setError('Failed to load glossary data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadGlossaryData();
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
        localStorage.setItem('glosarium-data', JSON.stringify(customData));
        setError(null);
    } else {
        setError("Invalid glossary file format.");
        // Optionally, revert to original data or clear it
        setData({ categories: [] });
    }
  }, []);

  // CRUD Functions
  const addCategory = useCallback((name: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      terms: []
    };
    setData(prev => {
      const newData = { ...prev, categories: [...prev.categories, newCategory] };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const updateCategory = useCallback((id: string, name: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === id ? { ...cat, name } : cat
        )
      };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.filter(cat => cat.id !== id)
      };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const addTerm = useCallback((categoryId: string, term: Omit<Term, 'id'>) => {
    const newTerm: Term = {
      ...term,
      id: `term-${Date.now()}`
    };
    setData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === categoryId
            ? { ...cat, terms: [...cat.terms, newTerm] }
            : cat
        )
      };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const updateTerm = useCallback((categoryId: string, termId: string, updates: Partial<Term>) => {
    setData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === categoryId
            ? {
                ...cat,
                terms: cat.terms.map(term =>
                  term.id === termId ? { ...term, ...updates } : term
                )
              }
            : cat
        )
      };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const deleteTerm = useCallback((categoryId: string, termId: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === categoryId
            ? { ...cat, terms: cat.terms.filter(term => term.id !== termId) }
            : cat
        )
      };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const bulkAddTerms = useCallback((categoryId: string, terms: Omit<Term, 'id'>[]) => {
    const newTerms: Term[] = terms.map(term => ({
      ...term,
      id: `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    setData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.map(cat =>
          cat.id === categoryId
            ? { ...cat, terms: [...cat.terms, ...newTerms] }
            : cat
        )
      };
      localStorage.setItem('glosarium-data', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonString: string) => {
    try {
      const parsedData = JSON.parse(jsonString);
      if (parsedData && Array.isArray(parsedData.categories)) {
        setData(parsedData);
        localStorage.setItem('glosarium-data', jsonString);
        setError(null);
        return true;
      } else {
        setError("Invalid glossary file format.");
        return false;
      }
    } catch (e) {
      setError("Invalid JSON format.");
      return false;
    }
  }, []);

  const resetToDefault = useCallback(async () => {
    try {
      const response = await fetch('./data/glossary.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const defaultData = await response.json();
      setData(defaultData);
      localStorage.setItem('glosarium-data', JSON.stringify(defaultData));
      setError(null);
    } catch (e) {
      setError('Failed to reset to default data.');
    }
  }, []);

  const clearLocalData = useCallback(async () => {
    try {
      const response = await fetch('./data/glossary.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const defaultData = await response.json();
      setData(defaultData);
      localStorage.removeItem('glosarium-data');
      setError(null);
    } catch (e) {
      setError('Failed to clear local data.');
    }
  }, []);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    sortedTermsByCategory,
    loadCustomGlossary,
    graphDataByCategory,
    // CRUD functions
    addCategory,
    updateCategory,
    deleteCategory,
    addTerm,
    updateTerm,
    deleteTerm,
    bulkAddTerms,
    // Import/Export functions
    exportData,
    importData,
    resetToDefault,
    clearLocalData
  };
};