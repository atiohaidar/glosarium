import React, { useState } from 'react';
import { Category, Term } from '../../types';
import { PencilIcon, TrashIcon, DocumentTextIcon } from '../ui/icons';

interface TermsTabProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectedCategoryChange: (id: string) => void;
  onUpdateTerm: (categoryId: string, termId: string, updates: Partial<Term>) => void;
  onDeleteTerm: (categoryId: string, termId: string) => void;
  onEditTerm: (term: Term) => void;
}

export const TermsTab: React.FC<TermsTabProps> = ({
  categories,
  selectedCategoryId,
  onSelectedCategoryChange,
  onUpdateTerm,
  onDeleteTerm,
  onEditTerm
}) => {
  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[var(--text-secondary)]">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Belum ada kategori</p>
            <p className="text-sm">Buat kategori terlebih dahulu di tab &quot;Kategori&quot;</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => onSelectedCategoryChange(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
            >
              <option value="">Pilih kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {selectedCategoryId && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.find(c => c.id === selectedCategoryId)?.terms.map(term => (
                <div key={term.id} className="bg-[var(--bg-secondary)] p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[var(--text-primary)] font-semibold">{term.title}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditTerm(term)}
                        className="p-1 text-[var(--text-secondary)] hover:text-white"
                        title="Edit istilah"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTerm(selectedCategoryId, term.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Hapus istilah"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    <div>Istilah: {term.definitions.istilah || '-'}</div>
                    <div>Bahasa: {term.definitions.bahasa || '-'}</div>
                    <div>Alasan: {term.definitions.kenapaAda || '-'}</div>
                    <div>Contoh: {term.definitions.contoh || '-'}</div>
                    {term.definitions.referensi && term.definitions.referensi.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium">Referensi:</span>
                        <div className="ml-2 space-y-1">
                          {term.definitions.referensi.map((ref, idx) => (
                            <a
                              key={idx}
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sky-400 hover:text-sky-300 underline text-xs break-all"
                            >
                              {ref}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};