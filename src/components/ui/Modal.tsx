"use client";

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Custom Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            ref={modalRef}
            className={cn(
              "relative z-50 w-full max-w-lg origin-center overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl mx-4",
              className
            )}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                {title && <h3 className="text-xl font-semibold leading-6 text-slate-900">{title}</h3>}
                {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
