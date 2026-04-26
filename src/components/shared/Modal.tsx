"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  description?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl", description }: ModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0f172a]/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* Modal Container to handle scrolling if content is taller than viewport */}
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                className={`relative w-full ${maxWidth} overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white text-left shadow-[0_24px_80px_rgba(15,23,42,0.12)] pointer-events-auto my-8`}
              >
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-[#f1f5f9]">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0f172a]">{title}</h2>
                    {description && (
                      <p className="mt-1 text-sm text-[#64748b]">{description}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 hover:bg-[#f8fafc] text-[#94a3b8] hover:text-[#0f172a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Body */}
                <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
