import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer = null, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('drawer-open');
    return () => document.body.classList.remove('drawer-open');
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex w-full flex-col bg-ivory shadow-2xl
              ${wide || footer
                ? 'h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl'
                : 'max-h-[min(92dvh,100%)] rounded-t-[28px] sm:rounded-3xl'}
              sm:max-h-[90dvh]
              ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
              {title ? (
                <h3 className="font-display text-2xl leading-tight text-burgundy sm:text-3xl">{title}</h3>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                className="touch-target inline-flex shrink-0 items-center justify-center rounded-full p-2 text-muted hover:bg-nude hover:text-burgundy"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
              {children}
            </div>

            {footer ? (
              <div className="shrink-0 border-t border-white/10 bg-blush px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
