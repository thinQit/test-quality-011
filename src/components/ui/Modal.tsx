'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, title, onClose, children, className }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
        className={cn('relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg', className)}
      >
        <div className="flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
