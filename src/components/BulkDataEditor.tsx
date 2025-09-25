import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Category } from '../types';

// Placeholder Icons jika file tidak ada
const PlusIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ArrowDownTrayIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ArrowUpTrayIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l4-4m-4 4V4" /></svg>;

// --- INTERFACE & DATA STRUCTURE ---
interface TermData {
    id: string;
    title: string;
    istilah: string;
    bahasa: string;
    kenapaAda: string;
    contoh: string;
    referensi: string[];
}

// --- KONSTANTA (PRINSIP DRY) ---
const markdownComponents = {
    p: ({ children }) => <p className="mb-1 text-[var(--text-primary)]">{children}</p>,
    strong: ({ children }) => <strong className="font-bold text-[var(--text-primary)]">{children}</strong>,
    em: ({ children }) => <em className="italic text-[var(--text-primary)]">{children}</em>,
    code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-400 font-mono text-sm">{children}</code>,
    pre: ({ children }) => <pre className="bg-gray-800 p-2 rounded text-green-400 font-mono text-sm overflow-x-auto my-1 whitespace-pre-wrap">{children}</pre>,
};

// --- SUB-KOMPONEN 1: EditableField ---
interface EditableFieldProps {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onCommit?: () => void;
    isTextarea?: boolean;
    supportsMarkdown?: boolean;
    rows?: number;
    className?: string;
    inputClassName?: string;
    fieldName?: string;
}

const EditableField: React.FC<EditableFieldProps> = React.memo(({
    value,
    placeholder,
    onChange,
    onCommit,
    isTextarea = false,
    supportsMarkdown = false,
    rows = 1, // Default rows menjadi 1, akan mengembang dari sana
    className = '',
    inputClassName = '',
    fieldName = '',
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // --- PERBAIKAN 2: LOGIKA AUTO-GROWING TEXTAREA ---
    useEffect(() => {
        if (isEditing && inputRef.current && isTextarea) {
            const el = inputRef.current;
            el.style.height = 'auto'; // Reset height
            el.style.height = `${el.scrollHeight}px`; // Set to content height
        }
    }, [value, isEditing, isTextarea]); // Jalankan setiap kali nilai atau status edit berubah

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            const len = inputRef.current?.value.length ?? 0;
            inputRef.current?.setSelectionRange(len, len);
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (!isTextarea || (isTextarea && onCommit)) {
                e.preventDefault();
                setIsEditing(false);
                onCommit?.();
            }
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    if (isEditing) {
        const commonProps = {
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
            onBlur: () => setIsEditing(false),
            onKeyDown: handleKeyDown,
            className: `w-full px-3 py-2 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none shadow-sm hover:shadow-md transition-shadow ${inputClassName}`,
            'data-field-id': fieldName ? `field-${fieldName}` : undefined
        };

        if (supportsMarkdown && isTextarea) {
            return (
                <div className="relative">
                    <textarea
                        {...commonProps}
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        rows={rows}
                        placeholder={placeholder}
                    />
                </div>
            );
        }

        return isTextarea
            ? <textarea {...commonProps} ref={inputRef as React.RefObject<HTMLTextAreaElement>} rows={rows} placeholder={placeholder} className={`${commonProps.className} overflow-hidden`} />
            : <input {...commonProps} ref={inputRef as React.RefObject<HTMLInputElement>} type="text" placeholder={placeholder} />;
    }

    return (
        <div
            className={`group cursor-pointer p-2 -m-2 rounded transition-colors min-h-[40px] ${className}`}
            onClick={() => setIsEditing(true)}
            data-field-id={fieldName ? `field-${fieldName}` : undefined}
        >
            <div className="flex items-start justify-between">
                <div className="text-[var(--text-primary)] whitespace-pre-wrap flex-1">
                    {value.trim() ? (
                        (fieldName === 'istilah' || fieldName === 'bahasa' || fieldName === 'kenapaAda' || fieldName === 'contoh') ? (
                            <ReactMarkdown components={markdownComponents}>{value}</ReactMarkdown>
                        ) : value
                    ) : (
                        <span className="text-[var(--text-secondary)]">{placeholder}</span>
                    )}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sky-600 hover:bg-sky-50 rounded transition-all ml-2"
                    title="Edit"
                >✏️</button>
            </div>
        </div>
    );
});

// --- SUB-KOMPONEN 2: TermItem ---
// Tidak ada perubahan di sini
interface TermItemProps {
    term: TermData;
    onUpdate: (termId: string, updatedTerm: Partial<TermData>) => void;
    onRemove: (termId: string) => void;
    isDeletable: boolean;
    focusNextField: (currentTermId: string, currentField: string) => void;
}

const TermItem: React.FC<TermItemProps> = React.memo(({ term, onUpdate, onRemove, isDeletable, focusNextField }) => {
    const handleFieldUpdate = (field: keyof Omit<TermData, 'id'>, value: string | string[]) => {
        onUpdate(term.id, { [field]: value });
    };

    const addReference = () => {
        const newRefs = [...term.referensi, ''];
        handleFieldUpdate('referensi', newRefs);
        setTimeout(() => {
            const lastRefInput = document.querySelector(`[data-term-id="${term.id}"] [data-field-id="field-referensi-${newRefs.length - 1}"]`) as HTMLElement;
            lastRefInput?.click();
        }, 0);
    };

    const updateReference = (index: number, value: string) => {
        const newReferensi = term.referensi.map((ref, i) => i === index ? value : ref);
        handleFieldUpdate('referensi', newReferensi);
    };

    const removeReference = (index: number) => {
        const newReferensi = term.referensi.filter((_, i) => i !== index);
        handleFieldUpdate('referensi', newReferensi);
    };

    const fieldOrder = useMemo(() => ['title', 'istilah', 'bahasa', 'kenapaAda', 'contoh', 'referensi'], []);

    return (
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] overflow-hidden" data-term-id={term.id}>
            <div className="p-6">
                <table className="w-full border-collapse">
                    <tbody>
                        <tr className="border-b-2 border-[var(--border-primary)] bg-[var(--bg-tertiary)]/50">
                            <td colSpan={2} className="px-4 py-6 text-center">
                                <EditableField
                                    value={term.title}
                                    placeholder="Masukkan nama istilah..."
                                    onChange={(value) => handleFieldUpdate('title', value)}
                                    onCommit={() => focusNextField(term.id, 'title')}
                                    inputClassName="font-bold text-xl text-center min-w-[400px]"
                                    fieldName="title"
                                />
                            </td>
                        </tr>
                        {fieldOrder.slice(1, -1).map(field => (
                            <tr key={field} className="border-b border-[var(--border-primary)]">
                                <td className="px-4 py-3 font-semibold text-[var(--text-primary)] w-48 align-top capitalize">
                                    {field === 'kenapaAda' ? 'Alasan Keberadaan' : (field === 'istilah' ? 'Definisi' : (field === 'contoh' ? 'Contoh' : 'Arti Bahasa'))}
                                </td>
                                <td className="px-4 py-3">
                                    <EditableField
                                        value={term[field as keyof TermData] as string}
                                        placeholder={`Masukkan ${field}...`}
                                        onChange={(value) => handleFieldUpdate(field as keyof Omit<TermData, 'id'>, value)}
                                        onCommit={() => focusNextField(term.id, field)}
                                        isTextarea={['istilah', 'kenapaAda', 'contoh'].includes(field)}
                                        rows={2} // Nilai rows kini berfungsi sebagai tinggi minimal
                                        fieldName={field}
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] align-top">Referensi</td>
                            <td className="px-4 py-3 space-y-3">
                                {term.referensi.map((ref, refIndex) => (
                                    <div key={refIndex} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <EditableField
                                                value={ref}
                                                placeholder="https://..."
                                                onChange={(value) => updateReference(refIndex, value)}
                                                onCommit={addReference}
                                                inputClassName="text-sm"
                                                fieldName={`referensi-${refIndex}`}
                                            />
                                        </div>
                                        {term.referensi.length > 1 && (
                                            <button onClick={() => removeReference(refIndex)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><TrashIcon className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addReference} className="w-full px-3 py-2 text-sky-600 hover:bg-sky-50 border-2 border-dashed border-sky-300 rounded-lg hover:border-sky-500 transition-colors text-sm font-medium">
                                    + Tambah Referensi
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {isDeletable && (
                    <div className="mt-4 flex justify-end">
                        <button onClick={() => onRemove(term.id)} className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 border border-red-200">
                            <TrashIcon className="w-4 h-4" /> Hapus Istilah
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});


// --- KOMPONEN UTAMA: BulkDataEditor ---
// Tidak ada perubahan signifikan di sini
interface BulkDataEditorProps {
    onBack?: () => void;
    onImportData?: (jsonString: string) => boolean;
    existingData?: string;
}

const BulkDataEditor: React.FC<BulkDataEditorProps> = ({ onBack, onImportData, existingData }) => {
    const [terms, setTerms] = useState<TermData[]>([]);
    const [notes, setNotes] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const hasLoadedRef = useRef(false);

    // Load categories from existing data instead of fetching
    useEffect(() => {
        if (existingData) {
            try {
                const data = JSON.parse(existingData);
                if (data.categories && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error('Failed to parse existing data for categories:', error);
                setCategories([]);
            }
        }
    }, [existingData]);

    // Load data from localStorage on mount
    useEffect(() => {
        if (hasLoadedRef.current) return; // Skip if already loaded (for React strict mode)
        const savedData = localStorage.getItem('bulk-data-editor-data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const loadedTerms = parsed.terms && Array.isArray(parsed.terms) ? (parsed.terms.length > 0 ? parsed.terms : [{ id: `term-${Date.now()}`, title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: [''] }]) : [{ id: `term-${Date.now()}`, title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: [''] }];
                setTerms(loadedTerms);
                setNotes(parsed.notes || '');
            } catch (error) {
                console.error('Failed to load data from localStorage:', error);
                // Jika error, set default
                setTerms([{ id: `term-${Date.now()}`, title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: [''] }]);
                setNotes('');
            }
        } else {
            // Jika tidak ada data, set default
            setTerms([{ id: `term-${Date.now()}`, title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: [''] }]);
            setNotes('');
        }
        hasLoadedRef.current = true;
    }, []);

    // Save data to localStorage whenever terms or notes change
    useEffect(() => {
        if (!hasLoadedRef.current) return; // Skip save until data has been loaded
        const dataToSave = { terms, notes };
        localStorage.setItem('bulk-data-editor-data', JSON.stringify(dataToSave));
    }, [terms, notes]);

    const addTerm = () => {
        const newTerm: TermData = {
            id: `term-${Date.now()}`,
            title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: ['']
        };
        setTerms(prev => [...prev, newTerm]);
    };

    const removeTerm = useCallback((termId: string) => {
        setTerms(prev => prev.filter(term => term.id !== termId));
    }, []);

    const updateTerm = useCallback((termId: string, updatedFields: Partial<TermData>) => {
        setTerms(prev => prev.map(term => term.id === termId ? { ...term, ...updatedFields } : term));
    }, []);

    const uploadToGlosarium = () => {
        if (!onImportData) {
            alert('Fungsi import tidak tersedia. Silakan gunakan export manual.');
            return;
        }

        let categoryName = '';
        let categoryId = '';

        if (selectedCategory === 'new') {
            categoryName = newCategoryName.trim();
            if (!categoryName) {
                alert('Masukkan nama kategori baru.');
                return;
            }
        } else {
            // selectedCategory contains the category id
            categoryId = selectedCategory;
            const selectedCat = categories.find(cat => cat.id === categoryId);
            if (!selectedCat) {
                alert('Kategori yang dipilih tidak ditemukan.');
                return;
            }
            categoryName = selectedCat.name;
        }

        // Convert terms to glosarium format
        const glosariumTerms = terms.map(({ id, ...term }) => ({
            title: term.title,
            definitions: {
                istilah: term.istilah,
                bahasa: term.bahasa,
                kenapaAda: term.kenapaAda,
                contoh: term.contoh,
                referensi: term.referensi.filter(ref => ref.trim() !== ''),
            }
        })).filter(term => term.title.trim() !== ''); // Filter terms with title

        if (glosariumTerms.length === 0) {
            alert('Tidak ada data istilah yang valid untuk di-upload.');
            return;
        }

        // Get existing data and merge with new data
        let existingGlossary = { categories: [] };
        if (existingData) {
            try {
                existingGlossary = JSON.parse(existingData);
            } catch (error) {
                console.error('Error parsing existing data:', error);
                existingGlossary = { categories: [] };
            }
        }

        // Find or create the category
        let targetCategory;
        if (selectedCategory === 'new') {
            // Create new category with unique id
            const newId = `cat-${Date.now()}`;
            targetCategory = { id: newId, name: categoryName, terms: [] };
            existingGlossary.categories.push(targetCategory);
        } else {
            // Find existing category by id
            targetCategory = existingGlossary.categories.find(cat => cat.id === categoryId);
            if (!targetCategory) {
                // If category doesn't exist in existing data, create it
                targetCategory = { id: categoryId, name: categoryName, terms: [] };
                existingGlossary.categories.push(targetCategory);
            }
        }

        // Merge terms: update existing or add new
        glosariumTerms.forEach(newTerm => {
            const existingTermIndex = targetCategory.terms.findIndex(term => term.title === newTerm.title);
            if (existingTermIndex >= 0) {
                // Update existing term
                targetCategory.terms[existingTermIndex] = newTerm;
            } else {
                // Add new term
                targetCategory.terms.push(newTerm);
            }
        });

        // Import merged data
        const mergedDataStr = JSON.stringify(existingGlossary, null, 2);
        const success = onImportData(mergedDataStr);

        if (success) {
            // Clear localStorage and reset state
            localStorage.removeItem('bulk-data-editor-data');
            setTerms([{ id: `term-${Date.now()}`, title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: [''] }]);
            setNotes('');
            setShowUploadModal(false);
            setSelectedCategory('');
            setNewCategoryName('');

            alert(`Data berhasil di-upload ke glosarium! ${glosariumTerms.length} istilah ${selectedCategory === 'new' ? 'ditambahkan ke kategori baru' : 'diupdate di kategori'} "${categoryName}".`);
        } else {
            alert('Gagal meng-upload data ke glosarium. Silakan coba lagi.');
        }
    };

    const clearAllData = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Data yang belum di-export akan hilang.')) {
            setTerms([{ id: `term-${Date.now()}`, title: '', istilah: '', bahasa: '', kenapaAda: '', contoh: '', referensi: [''] }]);
            setNotes('');
            localStorage.removeItem('bulk-data-editor-data');
        }
    };

    const focusNextField = useCallback((currentTermId: string, currentField: string) => {
        const fieldOrder = ['title', 'istilah', 'bahasa', 'kenapaAda', 'contoh', 'referensi'];
        const currentIndex = fieldOrder.indexOf(currentField);

        if (currentIndex < fieldOrder.length - 1) {
            const nextField = fieldOrder[currentIndex + 1];
            let nextInput: HTMLElement | null = null;

            if (nextField === 'referensi') {
                // Untuk referensi, cari referensi pertama (index 0)
                nextInput = document.querySelector(`[data-term-id="${currentTermId}"] [data-field-id="field-referensi-0"]`) as HTMLElement;
            } else {
                nextInput = document.querySelector(`[data-term-id="${currentTermId}"] [data-field-id="field-${nextField}"]`) as HTMLElement;
            }

            nextInput?.click();
        }
    }, []);


    const exportData = () => {
        const dataToExport = {
            notes: notes.trim() || undefined,
            terms: terms.map(({ id, ...termData }) => ({
                ...termData,
                referensi: termData.referensi.filter(ref => ref.trim() !== ''),
            }))
        };
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                const importedTerms = imported.terms || (Array.isArray(imported) ? imported : []);

                if (Array.isArray(importedTerms)) {
                    const newTerms: TermData[] = importedTerms.map((item, index) => ({
                        id: `term-${Date.now()}-${index}`,
                        title: item.title || '',
                        istilah: item.definitions?.istilah || item.istilah || '',
                        bahasa: item.definitions?.bahasa || item.bahasa || '',
                        kenapaAda: item.definitions?.kenapaAda || item.kenapaAda || '',
                        contoh: item.definitions?.contoh || item.contoh || '',
                        referensi: item.definitions?.referensi || item.referensi || [''],
                    }));
                    setTerms(newTerms.length > 0 ? newTerms : terms);
                    setNotes(imported.notes || '');
                }
            } catch (error) {
                alert('Gagal mengimpor data. Format file tidak valid.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="container mx-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                    {onBack && <button onClick={onBack} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500">← Kembali</button>}
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold">Bulk Data Editor</h1>
                        <p className="text-[var(--text-secondary)]">Isi data istilah secara massal</p>
                    </div>
                    <div className="w-32"></div>
                </div>

                <div className="mb-6 flex gap-4">
                    <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
                        <ArrowDownTrayIcon className="w-4 h-4" /> Export
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer">
                        <ArrowUpTrayIcon className="w-4 h-4" /> Import
                        <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>
                    <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">
                        <ArrowUpTrayIcon className="w-4 h-4" /> Upload to Glosarium
                    </button>
                    <button onClick={clearAllData} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
                        <TrashIcon className="w-4 h-4" /> Clear All Data
                    </button>
                </div>

                <div className="mb-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6">
                    <h2 className="text-lg font-semibold mb-4">Catatan</h2>
                    <EditableField
                        value={notes}
                        onChange={setNotes}
                        placeholder="Tulis catatan Anda di sini... (opsional)"
                        isTextarea
                        rows={5}
                        fieldName="notes"
                    />
                </div>

                <div className="space-y-8 pb-8">
                    {terms.map((term) => (
                        <TermItem
                            key={term.id}
                            term={term}
                            onUpdate={updateTerm}
                            onRemove={removeTerm}
                            isDeletable={terms.length > 1}
                            focusNextField={focusNextField}
                        />
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <button onClick={addTerm} className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-500 text-lg font-medium">
                        <PlusIcon className="w-5 h-5" /> Tambah Istilah
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Upload ke Glosarium</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Pilih Kategori
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="">Pilih kategori...</option>
                                    {categories.filter(cat => cat && cat.id).map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                    <option value="new">Buat kategori baru</option>
                                </select>
                            </div>
                            {selectedCategory === 'new' && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        Nama Kategori Baru
                                    </label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Masukkan nama kategori..."
                                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={uploadToGlosarium}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
                            >
                                Upload
                            </button>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkDataEditor;