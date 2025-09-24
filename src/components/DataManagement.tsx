import React, { useState, useRef } from 'react';
import { Category, Term } from '../types';
import { Modal } from './Modal';
import { AddTermForm } from './AddTermForm';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, TrashIcon, PencilIcon, PlusIcon, DocumentTextIcon } from './icons';

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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTerm, setEditingTerm] = useState<{ term: Term; categoryId: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = onExportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glosarium-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content && onImportData(content)) {
          alert('Data berhasil diimpor!');
        } else {
          alert('Gagal mengimpor data. Pastikan format JSON valid.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const renderCategoriesTab = () => (
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

  const renderTermsTab = () => (
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
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
            >
              <option value="">Pilih kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {selectedCategoryId && (
            <>
              {/* Bulk Import via Text */}
              {/* <div className="bg-[#2d2d2d] p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Bulk Tambah Istilah</h4>
                <p className="text-[#AAAAAA] text-sm mb-3">
                  Format: Judul | Definisi | Arti Bahasa | Alasan | Contoh<br/>
                  Pisahkan setiap istilah dengan baris baru
                </p>
                <textarea
                  placeholder={`Contoh:
Machine Learning | Teknik AI yang memungkinkan komputer belajar dari data | Pembelajaran Mesin | Untuk mengotomatisasi analisis data | Klasifikasi email spam
Deep Learning | Subset ML dengan neural networks | Pembelajaran Mendalam | Untuk tugas kompleks seperti pengenalan gambar | Deteksi objek`}
                  className="w-full bg-[#1a1a1a] border border-[#656565] rounded-lg p-3 text-white h-32 mb-3"
                  onChange={(e) => {
                    // Handle bulk text input
                    const text = e.target.value;
                    // We'll process this in the button click
                  }}
                  id="bulk-text-input"
                />
                <button
                  onClick={() => {
                    const textarea = document.getElementById('bulk-text-input') as HTMLTextAreaElement;
                    const text = textarea.value.trim();
                    if (!text) return;

                    const lines = text.split('\n').filter(line => line.trim());
                    const terms: Omit<Term, 'id'>[] = [];

                    for (const line of lines) {
                      const parts = line.split('|').map(p => p.trim());
                      if (parts.length >= 1) {
                        const [title, istilah, bahasa, kenapaAda, contoh] = parts;
                        terms.push({
                          title,
                          definitions: {
                            istilah: istilah || '',
                            bahasa: bahasa || '',
                            kenapaAda: kenapaAda || '',
                            contoh: contoh || ''
                          }
                        });
                      }
                    }

                    if (terms.length > 0) {
                      onBulkAddTerms(selectedCategoryId, terms);
                      textarea.value = '';
                      alert(`${terms.length} istilah berhasil ditambahkan!`);
                    }
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                >
                  Tambah Bulk
                </button>
              </div> */}

              {/* Terms List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.find(c => c.id === selectedCategoryId)?.terms.map(term => (
                  <div key={term.id} className="bg-[var(--bg-secondary)] p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-primary)] font-semibold">{term.title}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTerm({ term, categoryId: selectedCategoryId })}
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
            </>
          )}
        </>
      )}
    </div>
  );

  const renderImportExportTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Data
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            Unduh semua data glosarium dalam format JSON
          </p>
          <button
            onClick={handleExport}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export JSON
          </button>
        </div>

        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ArrowUpTrayIcon className="w-5 h-5" />
            Import Data
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mb-3">
            Unggah file JSON untuk mengganti semua data
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import JSON
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--border-primary)] pt-4">
        <h3 className="text-white font-semibold mb-3">Pengaturan Data</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              const confirmExport = window.confirm('Apakah Anda ingin export data sebelum reset ke default?');
              if (confirmExport) {
                handleExport();
              }
              if (window.confirm('Reset ke data default? Data local akan hilang.')) {
                onResetToDefault();
              }
            }}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg"
          >
            Reset ke Default
          </button>
          {/* <button
            onClick={() => {
              const confirmExport = window.confirm('Apakah Anda ingin export data sebelum menghapus data local?');
              if (confirmExport) {
                handleExport();
              }
              if (window.confirm('Hapus semua data local? Aplikasi akan menggunakan data kosong sampai Anda reset ke default.')) {
                onClearLocalData();
              }
            }}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
          >
            Hapus Data Local
          </button> */}
        </div>
      </div>
    </div>
  );

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
            {activeTab === 'categories' && renderCategoriesTab()}
            {activeTab === 'terms' && renderTermsTab()}
            {activeTab === 'import-export' && renderImportExportTab()}
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