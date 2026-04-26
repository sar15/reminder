"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  description?: string;
}

export function SlideOver({ isOpen, onClose, title, children, width = "max-w-md", description }: SlideOverProps) {
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#0f172a]/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* SlideOver Panel */}
          <div className="fixed inset-y-0 right-0 z-50 flex pointer-events-none w-full sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`w-full ${width} pointer-events-auto`}
            >
              <div className="flex h-full flex-col bg-white border-l border-[#e2e8f0] shadow-[0_0_80px_rgba(15,23,42,0.1)]">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-6 border-b border-[#f1f5f9] bg-[#f8fafc]/50">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0f172a]">{title}</h2>
                    {description && (
                      <p className="mt-1 text-sm text-[#64748b] leading-relaxed">{description}</p>
                    )}
                  </div>
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full bg-white p-2 text-[#94a3b8] hover:text-[#0f172a] shadow-sm border border-[#e2e8f0] hover:bg-[#f8fafc] transition-all focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]"
                    >
                      <span className="sr-only">Close panel</span>
                      <X size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Body */}
                <div className="relative flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-white">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
