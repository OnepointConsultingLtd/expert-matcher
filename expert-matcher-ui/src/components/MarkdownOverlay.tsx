import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import remarkGfm from 'remark-gfm';
import Spinner from './spinners/Spinner';
import { renderMessage } from './messages/ErrorMessage';

export default function MarkdownOverlay () {
  // Handle escape key to close overlay
  const { overlayIsOpen, overlaySetClose, overlayContent, overlayTitle, overlayError, overlaySetError } = useAppStore();
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') overlaySetClose();
    };

    if (overlayIsOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling of background content
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [overlaySetClose]);

  return (
    <AnimatePresence>
      {overlayIsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={overlaySetClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 md:inset-10 z-50 overflow-hidden flex flex-col"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col max-h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                {overlayTitle && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {overlayTitle}
                  </h2>
                )}
                <button
                  onClick={overlaySetClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overlay-content flex-1 overflow-auto p-6 w-full">
                <div className="prose dark:prose-invert max-w-none">
                  {!overlayContent && !overlayError && <Spinner />}
                  {overlayContent && <ReactMarkdown remarkPlugins={[remarkGfm]}>{overlayContent}</ReactMarkdown>}
                  {overlayError && renderMessage(overlayError, 'bg-red-500', 'border-red-500', overlaySetError)}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 