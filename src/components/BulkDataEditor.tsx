import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons';

interface TermData {
    id: string;
    title: string;
    istilah: string;
    bahasa: string;
    kenapaAda: string;
    contoh: string;
    referensi: string[];
}

interface BulkDataEditorProps {
    onBack?: () => void;
}

const BulkDataEditor: React.FC<BulkDataEditorProps> = ({ onBack }) => {
    const [terms, setTerms] = useState<TermData[]>([
        {
            id: 'term-1',
            title: '',
            istilah: '',
            bahasa: '',
            kenapaAda: '',
            contoh: '',
            referensi: ['']
        }
    ]);
    const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
    const [notes, setNotes] = useState<string>('');

    // Focus to title on initial load for new terms
    useEffect(() => {
        terms.forEach(term => {
            if (!term.title.trim()) {
                const titleFieldId = `${term.id}-title`;
                if (!editingFields.has(titleFieldId)) {
                    setEditingFields(prev => new Set(prev).add(titleFieldId));
                }
            }
        });
    }, [terms.length]); // Only run when terms array length changes (new term added)

    const addTerm = () => {
        const newTerm: TermData = {
            id: `term-${terms.length + 1}`,
            title: '',
            istilah: '',
            bahasa: '',
            kenapaAda: '',
            contoh: '',
            referensi: ['']
        };
        setTerms([...terms, newTerm]);
    };

    const removeTerm = (termId: string) => {
        if (terms.length > 1) {
            setTerms(terms.filter(term => term.id !== termId));
        }
    };

    const updateField = (termId: string, field: keyof Omit<TermData, 'id' | 'referensi'>, value: string) => {
        setTerms(terms.map(term =>
            term.id === termId
                ? { ...term, [field]: value }
                : term
        ));
    };

    const addReference = (termId: string) => {
        setTerms(terms.map(term =>
            term.id === termId
                ? { ...term, referensi: [...term.referensi, ''] }
                : term
        ));
        // Focus will be handled in the component after re-render
    };

    const updateReference = (termId: string, index: number, value: string) => {
        setTerms(terms.map(term =>
            term.id === termId
                ? { ...term, referensi: term.referensi.map((ref, i) => i === index ? value : ref) }
                : term
        ));
    };

    const removeReference = (termId: string, index: number) => {
        setTerms(terms.map(term =>
            term.id === termId && term.referensi.length > 1
                ? { ...term, referensi: term.referensi.filter((_, i) => i !== index) }
                : term
        ));
    };

    const toggleFieldEdit = (fieldId: string) => {
        setEditingFields(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fieldId)) {
                newSet.delete(fieldId);
            } else {
                newSet.add(fieldId);
            }
            return newSet;
        });
    };


    const moveToNextField = (currentTermId: string, currentFieldName: string) => {
        const currentTerm = terms.find(term => term.id === currentTermId);
        if (!currentTerm) return;

        // Define field order for navigation
        const fieldOrder = ['title', 'istilah', 'bahasa', 'kenapaAda', 'contoh'];

        // Find current field index
        const currentIndex = fieldOrder.indexOf(currentFieldName);
        if (currentIndex === -1) return;

        // Find next field that should be edited (either has value or needs editing)
        for (let i = currentIndex + 1; i < fieldOrder.length; i++) {
            const nextFieldName = fieldOrder[i];
            const fieldValue = currentTerm[nextFieldName as keyof TermData] as string;
            const fieldId = `${currentTermId}-${nextFieldName}`;
            const isEditing = editingFields.has(fieldId);
            const hasValue = fieldValue.trim() !== '';

            if (!isEditing && !hasValue) {
                // Start editing this empty field
                setEditingFields(prev => new Set(prev).add(fieldId));

                // Focus the field after state update
                setTimeout(() => {
                    const termElement = document.querySelector(`[data-term-id="${currentTermId}"]`);
                    if (termElement) {
                        const fieldElement = termElement.querySelector(`[data-field-id="${fieldId}"]`) as HTMLInputElement | HTMLTextAreaElement;
                        if (fieldElement) {
                            fieldElement.focus();
                            // Set cursor to end if it's a text input
                            if (fieldElement.type === 'text' && fieldElement.setSelectionRange) {
                                fieldElement.setSelectionRange(fieldValue.length, fieldValue.length);
                            }
                        }
                    }
                }, 0);
                return;
            } else if (isEditing || hasValue) {
                // Focus existing field
                setTimeout(() => {
                    const termElement = document.querySelector(`[data-term-id="${currentTermId}"]`);
                    if (termElement) {
                        const fieldElement = termElement.querySelector(`[data-field-id="${fieldId}"]`) as HTMLInputElement | HTMLTextAreaElement;
                        if (fieldElement) {
                            fieldElement.focus();
                            // Set cursor to end of text
                            if (fieldElement.setSelectionRange) {
                                const value = fieldElement.value;
                                fieldElement.setSelectionRange(value.length, value.length);
                            }
                        }
                    }
                }, 0);
                return;
            }
        }

        // If no more fields to edit, check references
        const currentTermRefs = currentTerm.referensi;
        const hasEmptyRef = currentTermRefs.some(ref => ref.trim() === '');
        if (hasEmptyRef || currentTermRefs.length === 0) {
            // Add new reference if needed
            if (currentTermRefs.length === 0 || currentTermRefs[currentTermRefs.length - 1].trim() !== '') {
                addReference(currentTermId);
            }
            // Focus the last reference input
            setTimeout(() => {
                const termElement = document.querySelector(`[data-term-id="${currentTermId}"]`);
                if (termElement) {
                    const refInputs = termElement.querySelectorAll(`input[type="url"]`);
                    const lastRefInput = refInputs[refInputs.length - 1] as HTMLInputElement;
                    if (lastRefInput) {
                        lastRefInput.focus();
                        const value = lastRefInput.value;
                        lastRefInput.setSelectionRange(value.length, value.length);
                    }
                }
            }, 0);
        }
    }; const renderEditableField = (
        termId: string,
        fieldName: keyof Omit<TermData, 'id' | 'referensi'>,
        value: string,
        placeholder: string,
        isTextarea: boolean = false,
        rows: number = 3,
        additionalProps?: any,
        supportsMarkdown: boolean = false
    ) => {
        const fieldId = `${termId}-${fieldName}`;
        const isEditing = editingFields.has(fieldId);
        const hasValue = value.trim() !== '';

        if (isEditing || (!hasValue && fieldName === 'title')) {
            const { className: additionalClassName, ...otherAdditionalProps } = additionalProps || {};
            const commonProps = {
                value,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    updateField(termId, fieldName, e.target.value),
                onBlur: () => toggleFieldEdit(fieldId),
                onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        if (isTextarea && supportsMarkdown) {
                            // For markdown textareas, Enter moves to next field, Shift+Enter creates new line
                            e.preventDefault();
                            moveToNextField(termId, fieldName);
                        } else if (!isTextarea) {
                            // For inputs, Enter moves to next field
                            e.preventDefault();
                            moveToNextField(termId, fieldName);
                        }
                    } else if (e.key === 'Escape') {
                        toggleFieldEdit(fieldId);
                    }
                },
                placeholder,
                className: `w-full px-3 py-2 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none shadow-sm hover:shadow-md transition-shadow ${additionalClassName || ''}`,
                autoFocus: true,
                ...otherAdditionalProps
            };

            if (supportsMarkdown) {
                const markdownProps = {
                    value,
                    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateField(termId, fieldName, e.target.value),
                    onBlur: () => toggleFieldEdit(fieldId),
                    onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            // For markdown textareas, Enter moves to next field
                            e.preventDefault();
                            moveToNextField(termId, fieldName);
                        } else if (e.key === 'Escape') {
                            toggleFieldEdit(fieldId);
                        }
                        // Shift+Enter will create new line (default behavior)
                    },
                    className: `w-full px-3 py-2 bg-transparent border-2 border-[var(--border-primary)] rounded-lg text-transparent caret-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none shadow-sm hover:shadow-md transition-shadow ${additionalClassName || ''}`,
                    style: {
                        position: 'relative',
                        zIndex: 2,
                        background: 'transparent',
                        color: 'transparent',
                        caretColor: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit'
                    },
                    autoFocus: true,
                    rows,
                    ...otherAdditionalProps
                };

                return (
                    <div className="relative">
                        {/* Hidden textarea for actual input */}
                        <textarea {...markdownProps} data-field-id={fieldId} />
                        {/* Formatted preview overlay */}
                        <div
                            className="absolute inset-0 px-3 py-2 pointer-events-none text-[var(--text-primary)] leading-relaxed overflow-hidden"
                            style={{
                                zIndex: 1,
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}
                        >
                            {value.trim() ? (
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-1 text-[var(--text-primary)]">{children}</p>,
                                        strong: ({ children }) => <strong className="font-bold text-[var(--text-primary)]">{children}</strong>,
                                        em: ({ children }) => <em className="italic text-[var(--text-primary)]">{children}</em>,
                                        code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-400 font-mono text-sm">{children}</code>,
                                        pre: ({ children }) => <pre className="bg-gray-800 p-2 rounded text-green-400 font-mono text-sm overflow-x-auto my-1 whitespace-pre-wrap">{children}</pre>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold text-[var(--text-primary)] mb-1">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{children}</h3>,
                                        ul: ({ children }) => <ul className="list-disc list-inside mb-1 text-[var(--text-primary)]">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-1 text-[var(--text-primary)]">{children}</ol>,
                                        li: ({ children }) => <li className="text-[var(--text-primary)]">{children}</li>,
                                        a: ({ children, href }) => <a href={href} className="text-sky-600 hover:text-sky-700 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                        blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-500 pl-2 italic text-[var(--text-secondary)] my-1">{children}</blockquote>
                                    }}
                                >
                                    {value}
                                </ReactMarkdown>
                            ) : (
                                <span className="text-[var(--text-secondary)]">{placeholder}</span>
                            )}
                        </div>
                    </div>
                );
            } else {
                return isTextarea ? (
                    <textarea {...commonProps} rows={rows} data-field-id={fieldId} />
                ) : (
                    <input {...commonProps} type="text" data-field-id={fieldId} />
                );
            }
        } else {
            return (
                <div
                    className="group cursor-pointer p-2 -m-2 rounded transition-colors"
                    onClick={() => toggleFieldEdit(fieldId)}
                    data-field-id={fieldId}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-[var(--text-primary)] whitespace-pre-wrap group-hover:text-sky-600 transition-colors flex-1">
                            {supportsMarkdown ? (
                                <div className="text-[var(--text-primary)] leading-relaxed">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p className="mb-2 text-[var(--text-primary)]">{children}</p>,
                                            strong: ({ children }) => <strong className="font-bold text-[var(--text-primary)]">{children}</strong>,
                                            em: ({ children }) => <em className="italic text-[var(--text-primary)]">{children}</em>,
                                            code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-400 font-mono text-sm">{children}</code>,
                                            pre: ({ children }) => <pre className="bg-gray-800 p-3 rounded text-green-400 font-mono text-sm overflow-x-auto my-2">{children}</pre>,
                                            h1: ({ children }) => <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{children}</h3>,
                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-[var(--text-primary)]">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-[var(--text-primary)]">{children}</ol>,
                                            li: ({ children }) => <li className="text-[var(--text-primary)]">{children}</li>,
                                            a: ({ children, href }) => <a href={href} className="text-sky-600 hover:text-sky-700 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                            blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic text-[var(--text-secondary)] my-2">{children}</blockquote>
                                        }}
                                    >
                                        {value}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                value || <span className="text-[var(--text-secondary)]">{placeholder}</span>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFieldEdit(fieldId);
                            }}
                            className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sky-600 hover:bg-sky-50 rounded transition-all ml-2"
                            title="Edit"
                        >
                            ✏️
                        </button>
                    </div>
                </div>
            );
        }
    };

    const exportData = () => {
        const exportData = {
            notes: notes.trim() || undefined,
            terms: terms.map(term => ({
                title: term.title || `Istilah ${terms.indexOf(term) + 1}`,
                definitions: {
                    title: term.title,
                    istilah: term.istilah,
                    bahasa: term.bahasa,
                    kenapaAda: term.kenapaAda,
                    contoh: term.contoh,
                    referensi: term.referensi.filter(ref => ref.trim() !== '')
                }
            }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bulk-data-export.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target?.result as string);

                    // Handle both old format (array) and new format (object with notes and terms)
                    let termsData = [];
                    let notesData = '';

                    if (Array.isArray(importedData)) {
                        // Old format: array of terms
                        termsData = importedData;
                    } else if (importedData && typeof importedData === 'object') {
                        // New format: { notes?, terms: [] }
                        notesData = importedData.notes || '';
                        termsData = importedData.terms || [];
                    }

                    if (Array.isArray(termsData)) {
                        const newTerms: TermData[] = termsData.map((item, index) => ({
                            id: `term-${index + 1}`,
                            title: item.title || '',
                            istilah: item.definitions?.istilah || '',
                            bahasa: item.definitions?.bahasa || '',
                            kenapaAda: item.definitions?.kenapaAda || '',
                            contoh: item.definitions?.contoh || '',
                            referensi: Array.isArray(item.definitions?.referensi) ? item.definitions.referensi : ['']
                        }));
                        setTerms(newTerms);
                        setNotes(notesData);
                    }
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className="container mx-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
                        >
                            ← Kembali ke Glosarium
                        </button>
                    )}
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Bulk Data Editor</h1>
                        <p className="text-[var(--text-secondary)]">Isi data istilah secara massal dalam format tabel</p>
                    </div>
                    <div className="w-32"></div> {/* Spacer untuk balance layout */}
                </div>

                <div className="mb-6 flex gap-4">
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export
                    </button>

                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Import
                        <input
                            type="file"
                            accept=".json"
                            onChange={importData}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Notes Section */}
                <div className="mb-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Catatan</h2>
                    <div className="relative">
                        {editingFields.has('notes') || !notes.trim() ? (
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={() => toggleFieldEdit('notes')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        toggleFieldEdit('notes');
                                    }
                                }}
                                placeholder="Tulis catatan Anda di sini... (opsional)"
                                className="w-full px-4 py-3 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-vertical shadow-sm hover:shadow-md transition-shadow min-h-[120px]"
                                autoFocus
                            />
                        ) : (
                            <div
                                className="group cursor-pointer p-4 -m-4 rounded transition-colors min-h-[120px] whitespace-pre-wrap"
                                onClick={() => toggleFieldEdit('notes')}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="text-[var(--text-primary)] flex-1">
                                        {notes}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFieldEdit('notes');
                                        }}
                                        className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sky-600 hover:bg-sky-50 rounded transition-all ml-2 flex-shrink-0"
                                        title="Edit catatan"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tables */}
                <div className="space-y-8 pb-8">
                    {terms.map((term, termIndex) => (
                        <div key={term.id} className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] overflow-hidden" data-term-id={term.id}>
                            {/* Table Content */}
                            <div className="p-6">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {/* Term Title Row - Centered */}
                                        <tr className="border-b-2 border-[var(--border-primary)] bg-[var(--bg-tertiary)]/50">
                                            <td colSpan={2} className="px-4 py-6 text-center">
                                                {editingFields.has(`${term.id}-title`) || !term.title.trim() ? (
                                                    <input
                                                        type="text"
                                                        value={term.title}
                                                        onChange={(e) => updateField(term.id, 'title', e.target.value)}
                                                        onBlur={() => toggleFieldEdit(`${term.id}-title`)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                // For title input, Enter moves to next field
                                                                e.preventDefault();
                                                                moveToNextField(term.id, 'title');
                                                            } else if (e.key === 'Escape') {
                                                                toggleFieldEdit(`${term.id}-title`);
                                                            }
                                                        }}
                                                        placeholder="Masukkan nama istilah..."
                                                        className="px-4 py-3 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm hover:shadow-md transition-shadow font-bold text-xl text-center min-w-[400px]"
                                                        autoFocus
                                                        data-field-id={`${term.id}-title`}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center gap-3" data-field-id={`${term.id}-title`}>
                                                        <h2
                                                            className="text-2xl font-bold text-[var(--text-primary)] cursor-pointer hover:text-sky-600 transition-colors"
                                                            onClick={() => toggleFieldEdit(`${term.id}-title`)}
                                                        >
                                                            {term.title}
                                                        </h2>
                                                        <button
                                                            onClick={() => toggleFieldEdit(`${term.id}-title`)}
                                                            className="px-2 py-1 text-sky-600 hover:bg-sky-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Edit nama istilah"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Definition Row */}
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] w-48 align-top">
                                                Definisi
                                            </td>
                                            <td className="px-4 py-3">
                                                {renderEditableField(
                                                    term.id,
                                                    'istilah',
                                                    term.istilah,
                                                    'Masukkan definisi...',
                                                    true,
                                                    4,
                                                    undefined,
                                                    true
                                                )}
                                            </td>
                                        </tr>

                                        {/* Language Meaning Row */}
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] align-top">
                                                Arti Bahasa
                                            </td>
                                            <td className="px-4 py-3">
                                                {renderEditableField(
                                                    term.id,
                                                    'bahasa',
                                                    term.bahasa,
                                                    'Masukkan arti bahasa...',
                                                    false,
                                                    1,
                                                    undefined,
                                                    true
                                                )}
                                            </td>
                                        </tr>

                                        {/* Reason Row */}
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] align-top">
                                                Alasan Keberadaan
                                            </td>
                                            <td className="px-4 py-3">
                                                {renderEditableField(
                                                    term.id,
                                                    'kenapaAda',
                                                    term.kenapaAda,
                                                    'Masukkan alasan keberadaan...',
                                                    true,
                                                    3,
                                                    undefined,
                                                    true
                                                )}
                                            </td>
                                        </tr>

                                        {/* Example Row */}
                                        <tr className="border-b border-[var(--border-primary)]">
                                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] align-top">
                                                <div className="flex items-center gap-2">
                                                    Contoh
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {renderEditableField(
                                                    term.id,
                                                    'contoh',
                                                    term.contoh,
                                                    'Masukkan contoh...',
                                                    true,
                                                    3,
                                                    undefined,
                                                    true
                                                )}
                                            </td>
                                        </tr>

                                        {/* References Row */}
                                        <tr>
                                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] align-top">
                                                Referensi
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-3">
                                                    {term.referensi.map((ref, refIndex) => (
                                                        <div key={refIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="url"
                                                                value={ref}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value;
                                                                    const otherNonEmptyRefs = term.referensi.filter((ref, i) => i !== refIndex && ref.trim() !== '').length;
                                                                    if (newValue.trim() === '' && otherNonEmptyRefs > 0) {
                                                                        // Remove empty reference if there are other non-empty references
                                                                        removeReference(term.id, refIndex);
                                                                    } else {
                                                                        updateReference(term.id, refIndex, newValue);
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        addReference(term.id);
                                                                        // Focus on the new reference input after DOM update
                                                                        setTimeout(() => {
                                                                            const termElement = document.querySelector(`[data-term-id="${term.id}"]`);
                                                                            if (termElement) {
                                                                                const inputs = termElement.querySelectorAll(`input[type="url"][placeholder="https://..."]`);
                                                                                const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
                                                                                if (lastInput) {
                                                                                    lastInput.focus();
                                                                                }
                                                                            }
                                                                        }, 0);
                                                                    }
                                                                }}
                                                                placeholder="https://..."
                                                                className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm shadow-sm hover:shadow-md transition-shadow"
                                                                data-field-id={`${term.id}-referensi-${refIndex}`}
                                                            />
                                                            {term.referensi.length > 1 && (
                                                                <button
                                                                    onClick={() => removeReference(term.id, refIndex)}
                                                                    className="px-2 py-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                                    title="Hapus referensi"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Add Reference Row */}
                                        <tr>
                                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)] align-top">
                                                Tambah Referensi
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => addReference(term.id)}
                                                    className="w-full px-3 py-2 text-sky-600 hover:bg-sky-50 border-2 border-dashed border-sky-300 rounded-lg hover:border-sky-500 transition-colors text-sm font-medium"
                                                >
                                                    + Tambah Referensi
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Delete Term Button */}
                                {terms.length > 1 && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => removeTerm(term.id)}
                                            className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 border border-red-200"
                                            title="Hapus istilah"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Hapus Istilah
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={addTerm}
                        className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors text-lg font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Tambah Istilah
                    </button>
                </div>

                <div className="mt-8 text-center text-[var(--text-secondary)]">
                    <p>Tip: Anda dapat menyalin data dari spreadsheet dan menempelkannya langsung ke kolom yang sesuai</p>
                </div>
            </div>
        </div>
    );
};

export default BulkDataEditor;