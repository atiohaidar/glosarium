import React, { useState, useRef } from 'react';
import { Category, Term } from '../../types';
import { Modal } from '../ui/Modal';
import { AddTermForm } from '../ui/AddTermForm';
import { DocumentTextIcon } from '../ui/icons';
import { CategoriesTab } from './CategoriesTab';
import { TermsTab } from './TermsTab';
import { ImportExportTab } from './ImportExportTab';

interface DataManagementProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateTerm: (categoryId: string, termId: string, updates: Partial<Term>) => void;
  onDeleteTerm: (categoryId: string, termId: string) => void;
  onExportData: () => string;
  onImportData: (jsonString: string) => boolean;
  onResetToDefault: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateTerm,
  onDeleteTerm,
  onExportData,
  onImportData,
  onResetToDefault
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'terms' | 'import-export'>('categories');
  const [editingTerm, setEditingTerm] = useState<{ term: Term; categoryId: string } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const handleSelectedCategoryChange = (id: string) => {
    setSelectedCategoryId(id);
  };

  const handleEditTerm = (term: Term) => {
    setEditingTerm({ term, categoryId: selectedCategoryId });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:scale-110 z-50 group"
        title="Kelola Data"
      >
        <DocumentTextIcon className="w-6 h-6" />
        <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Kelola Data
        </div>
      </button>

      <Modal onClose={() => setIsOpen(false)} isOpen={isOpen}>
        <div className="w-full max-w-4xl max-h-[80vh] overflow-hidden p-6">
          <div className="flex items-center gap-3 mb-6">
            <DocumentTextIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kelola Data Glosarium</h1>
          </div>

          <div className="flex border-b border-[var(--border-primary)] mb-6">
            {[
              { key: 'categories', label: 'Kategori' },
              { key: 'terms', label: 'Istilah' },
              { key: 'import-export', label: 'Import/Export' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'categories' | 'terms' | 'import-export')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                onAddCategory={onAddCategory}
                onUpdateCategory={onUpdateCategory}
                onDeleteCategory={onDeleteCategory}
              />
            )}
            {activeTab === 'terms' && (
              <TermsTab
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectedCategoryChange={handleSelectedCategoryChange}
                onUpdateTerm={onUpdateTerm}
                onDeleteTerm={onDeleteTerm}
                onEditTerm={handleEditTerm}
              />
            )}
            {activeTab === 'import-export' && (
              <ImportExportTab
                onExportData={onExportData}
                onImportData={onImportData}
                onResetToDefault={onResetToDefault}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Term Modal */}
      {editingTerm && (
        <Modal onClose={() => setEditingTerm(null)} isOpen={true}>
          <div className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Istilah</h2>
            <AddTermForm
              categories={categories}
              selectedCategoryId={editingTerm.categoryId}
              editingTerm={editingTerm.term}
              onUpdate={(categoryId, termId, updates) => {
                onUpdateTerm(categoryId, termId, updates);
                setEditingTerm(null);
              }}
              onCancel={() => setEditingTerm(null)}
            />
          </div>
        </Modal>
      )}
    </>
  );
};