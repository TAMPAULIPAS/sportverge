'use client';

// TODO: Dialog.tsx
export default function Component() {
  return null;
}
// ═══════════════════════════════════════════════════════════════
//  Dialog — მოდალური ფანჯარა
//  გამოიყენება: Login, Register, Settings, Confirmation
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
  className,
}: DialogProps) {
  // ESC ღილაკით დახურვა
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Dialog content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            className={cn(
              'relative w-full bg-surface border border-edge rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden',
              sizes[size],
              className
            )}
          >
            {/* Top gradient line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime to-transparent opacity-60" />

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 p-5 lg:p-6 pb-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2
                      id="dialog-title"
                      className="font-heading text-lg lg:text-xl font-bold text-text tracking-tight"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted mt-1">{description}</p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="shrink-0 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
                    aria-label="Close dialog"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-5 lg:px-6 pb-5 lg:pb-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-5 lg:px-6 py-4 bg-surface/40 border-t border-edge/50 flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Dialog;
