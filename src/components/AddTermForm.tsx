import React, { useState, useEffect } from 'react';
import { Category, Term } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface AddTermFormProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSave: (categoryId: string, term: Omit<Term, 'id'>) => void;
  onCancel: () => void;
  editingTerm?: Term | null;
  onUpdate?: (categoryId: string, termId: string, updates: Partial<Term>) => void;
}

export const AddTermForm: React.FC<AddTermFormProps> = ({ categories, selectedCategoryId, onSave, onCancel, editingTerm, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [istilah, setIstilah] = useState('');
  const [bahasa, setBahasa] = useState('');
  const [kenapaAda, setKenapaAda] = useState('');
  const [contoh, setContoh] = useState('');
  const [referensi, setReferensi] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState(selectedCategoryId || '');
  const [isInitialized, setIsInitialized] = useState(false);

  const isEditing = !!editingTerm;

  // Local storage key for draft
  const DRAFT_KEY = 'glosarium-term-draft';

  // Save draft to localStorage
  const saveDraft = () => {
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
  };

  // Load draft from localStorage
  const loadDraft = () => {
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
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  useEffect(() => {
    if (editingTerm) {
      // Always reset form for editing existing term
      setTitle(editingTerm.title);
      setIstilah(editingTerm.definitions.istilah || '');
      setBahasa(editingTerm.definitions.bahasa || '');
      setKenapaAda(editingTerm.definitions.kenapaAda || '');
      setContoh(editingTerm.definitions.contoh || '');
      setReferensi(Array.isArray(editingTerm.definitions.referensi) ? editingTerm.definitions.referensi : []);
      // Find the category that contains this term
      const currentCategoryId = categories.find(cat => cat.terms.some(t => t.id === editingTerm.id))?.id || '';
      setCategoryId(currentCategoryId);
      setIsInitialized(true);
    } else if (!isInitialized) {
      // Load draft for adding new term
      loadDraft();
      setCategoryId(selectedCategoryId || '');
      setIsInitialized(true);
    } else if (!editingTerm && isInitialized && selectedCategoryId && selectedCategoryId !== categoryId) {
      // Update category when selectedCategoryId changes for add mode
      setCategoryId(selectedCategoryId);
    }
  }, [editingTerm, categories, selectedCategoryId, isInitialized, categoryId]);

  // Save draft whenever form data changes (only for add mode)
  useEffect(() => {
    if (isInitialized && !isEditing) {
      saveDraft();
    }
  }, [title, istilah, bahasa, kenapaAda, contoh, referensi, categoryId, isInitialized, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;

    if (isEditing && editingTerm && onUpdate) {
      // Update existing term
      onUpdate(categoryId, editingTerm.id, {
        title: title.trim(),
        definitions: {
          istilah: istilah.trim(),
          bahasa: bahasa.trim(),
          kenapaAda: kenapaAda.trim(),
          contoh: contoh.trim(),
          referensi: referensi.filter(r => r.trim())
        }
      });
    } else {
      // Add new term
      onSave(categoryId, {
        title: title.trim(),
        definitions: {
          istilah: istilah.trim(),
          bahasa: bahasa.trim(),
          kenapaAda: kenapaAda.trim(),
          contoh: contoh.trim(),
          referensi: referensi.filter(r => r.trim())
        }
      });
      // Clear draft and reset form after successful add
      clearDraft();
      setTitle('');
      setIstilah('');
      setBahasa('');
      setKenapaAda('');
      setContoh('');
      setReferensi([]);
      setIsInitialized(false); // Allow re-initialization on next open
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Kategori</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white"
          required
        >
          <option value="">Pilih kategori</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Judul</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white"
          placeholder="Masukkan judul istilah"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Definisi (Istilah)</label>
        <textarea
          value={istilah}
          onChange={(e) => setIstilah(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white h-20"
          placeholder="Masukkan definisi istilah"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Arti Bahasa</label>
        <textarea
          value={bahasa}
          onChange={(e) => setBahasa(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white h-20"
          placeholder="Masukkan arti dalam bahasa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Alasan Keberadaan</label>
        <textarea
          value={kenapaAda}
          onChange={(e) => setKenapaAda(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white h-20"
          placeholder="Masukkan alasan keberadaan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Contoh</label>
        <textarea
          value={contoh}
          onChange={(e) => setContoh(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#656565] rounded-lg p-3 text-white h-20"
          placeholder="Masukkan contoh penggunaan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#AAAAAA] mb-2">Referensi (Link)</label>
        <div className="space-y-2">
          {referensi.map((ref, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={ref}
                onChange={(e) => {
                  const newRefs = [...referensi];
                  newRefs[index] = e.target.value;
                  setReferensi(newRefs);
                }}
                placeholder="https://example.com"
                className="flex-1 bg-[#2d2d2d] border border-[#656565] rounded p-2 text-white text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const newRefs = referensi.filter((_, i) => i !== index);
                  setReferensi(newRefs);
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setReferensi([...referensi, '']);
            }}
            className="w-full py-2 bg-[#525252] hover:bg-[#656565] text-white rounded-lg flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Referensi
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
        >
          {isEditing ? 'Simpan' : 'Tambah Istilah'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-[#525252] hover:bg-[#656565] text-white rounded-lg"
        >
          Batal
        </button>
      </div>
    </form>
  );
};