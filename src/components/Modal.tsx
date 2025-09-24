import React, { useEffect, useRef } from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  isOpen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, isOpen = true }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click is on the backdrop itself, not on the modal content
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef} 
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-[var(--border-primary)]/50 animate-slide-up"
      >
        {children}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--bg-tertiary)]/50 hover:bg-[var(--border-primary)]/80 text-[var(--text-primary)] transition-all"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
