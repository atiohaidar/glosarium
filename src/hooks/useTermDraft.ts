import { useState, useCallback } from 'react';
import { Term } from '../types';

interface UseTermDraftReturn {
  title: string;
  istilah: string;
  bahasa: string;
  kenapaAda: string;
  contoh: string;
  referensi: string[];
  categoryId: string;
  setTitle: (value: string) => void;
  setIstilah: (value: string) => void;
  setBahasa: (value: string) => void;
  setKenapaAda: (value: string) => void;
  setContoh: (value: string) => void;
  setReferensi: (value: string[]) => void;
  setCategoryId: (value: string) => void;
  loadDraft: () => void;
  saveDraft: () => void;
  clearDraft: () => void;
}

export const useTermDraft = (isEditing: boolean, selectedCategoryId?: string | null): UseTermDraftReturn => {
  const [title, setTitle] = useState('');
  const [istilah, setIstilah] = useState('');
  const [bahasa, setBahasa] = useState('');
  const [kenapaAda, setKenapaAda] = useState('');
  const [contoh, setContoh] = useState('');
  const [referensi, setReferensi] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState(selectedCategoryId || '');

  const DRAFT_KEY = 'glosarium-term-draft';

  const saveDraft = useCallback(() => {
    if (!isEditing) {
      const draft = {
        title,
        istilah,
        bahasa,
        kenapaAda,
        contoh,
        referensi,
        categoryId
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [isEditing, title, istilah, bahasa, kenapaAda, contoh, referensi, categoryId]);

  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setIstilah(parsed.istilah || '');
        setBahasa(parsed.bahasa || '');
        setKenapaAda(parsed.kenapaAda || '');
        setContoh(parsed.contoh || '');
        setReferensi(Array.isArray(parsed.referensi) ? parsed.referensi : []);
        setCategoryId(parsed.categoryId || selectedCategoryId || '');
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [selectedCategoryId]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return {
    title,
    istilah,
    bahasa,
    kenapaAda,
    contoh,
    referensi,
    categoryId,
    setTitle,
    setIstilah,
    setBahasa,
    setKenapaAda,
    setContoh,
    setReferensi,
    setCategoryId,
    loadDraft,
    saveDraft,
    clearDraft
  };
};