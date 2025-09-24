import React from 'react';
import { Category, Term } from '../../types';
import { Modal } from './Modal';
import { TermCard } from './TermCard';
import { QuizFlow } from '../quiz/QuizFlow';
import { AddTermForm } from './AddTermForm';

interface ModalsContainerProps {
    // Term modal
    selectedTermForModal: Term | null;
    onCloseTermModal: () => void;
    currentTerms: Term[];

    // Quiz modal
    isQuizMode: boolean;
    onCloseQuizModal: () => void;
    categories: Category[];
    sortedTermsByCategory: Map<string, Term[]>;
    selectedCategoryId: string | null;

    // Edit term modal
    editingTerm: Term | null;
    onCloseEditModal: () => void;
    onUpdateTerm: (categoryId: string, termId: string, updates: Partial<Term>) => void;

    // Add term modal
    isAddTermMode: boolean;
    onCloseAddModal: () => void;
    onAddTerm: (categoryId: string, term: Term) => void;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({
    selectedTermForModal,
    onCloseTermModal,
    currentTerms,
    isQuizMode,
    onCloseQuizModal,
    categories,
    sortedTermsByCategory,
    selectedCategoryId,
    editingTerm,
    onCloseEditModal,
    onUpdateTerm,
    isAddTermMode,
    onCloseAddModal,
    onAddTerm
}) => {
    return (
        <>
            {/* Term Detail Modal */}
            {selectedTermForModal && (
                <Modal onClose={onCloseTermModal}>
                    <div className="p-1">
                        <TermCard term={selectedTermForModal} allTerms={currentTerms} />
                    </div>
                </Modal>
            )}

            {/* Quiz Modal */}
            {isQuizMode && (
                <Modal onClose={onCloseQuizModal}>
                    <div className="p-6 pt-12">
                        <QuizFlow
                            categories={categories}
                            sortedTermsByCategory={sortedTermsByCategory}
                            onExit={onCloseQuizModal}
                            selectedCategoryId={selectedCategoryId}
                        />
                    </div>
                </Modal>
            )}

            {/* Edit Term Modal */}
            {editingTerm && (
                <Modal onClose={onCloseEditModal}>
                    <div className="w-full max-w-2xl p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Edit Istilah</h2>
                        <AddTermForm
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            editingTerm={editingTerm}
                            onUpdate={(categoryId, termId, updates) => {
                                onUpdateTerm(categoryId, termId, updates);
                                onCloseEditModal();
                            }}
                            onCancel={onCloseEditModal}
                        />
                    </div>
                </Modal>
            )}

            {/* Add Term Modal */}
            {isAddTermMode && (
                <Modal onClose={onCloseAddModal}>
                    <div className="w-full max-w-2xl p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                            Tambah Istilah Baru {selectedCategoryId && categories.find(c => c.id === selectedCategoryId) ? `di "${categories.find(c => c.id === selectedCategoryId)?.name}"` : ''}
                        </h2>
                        <AddTermForm
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            onSave={(categoryId, term) => {
                                onAddTerm(categoryId, term);
                                onCloseAddModal();
                            }}
                            onCancel={onCloseAddModal}
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};