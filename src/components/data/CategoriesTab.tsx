import React, { useState } from 'react';
import { Category } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon } from '../ui/icons';

interface CategoriesTabProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[var(--text-primary)] mb-4">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Belum ada kategori</p>
            <p className="text-sm">Tambahkan kategori baru untuk memulai mengelola istilah</p>
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Masukan Nama kategori baru"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
        />
        <button
          onClick={() => {
            if (newCategoryName.trim()) {
              onAddCategory(newCategoryName.trim());
              setNewCategoryName('');
            }
          }}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {categories.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between bg-[var(--bg-secondary)] p-3 rounded-lg">
              {editingCategory?.id === category.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded p-1 text-[var(--text-primary)]"
                  />
                  <button
                    onClick={() => {
                      onUpdateCategory(category.id, editingCategory.name);
                      setEditingCategory(null);
                    }}
                    className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-[var(--text-primary)]">{category.name} ({category.terms.length} istilah)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 text-[var(--text-secondary)] hover:text-white"
                      title="Edit kategori"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Hapus kategori"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};