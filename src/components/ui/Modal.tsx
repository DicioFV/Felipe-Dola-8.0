// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Modal.tsx
// Fase: 1
// ============================================

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, size = "md", children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121A] text-[#F1F1F3] shadow-2xl flex flex-col max-h-[90vh]",
              sizes[size]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
              <h2 className="font-display text-lg font-semibold tracking-tight text-[#F1F1F3]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[#8888A0] hover:bg-white/5 hover:text-[#F1F1F3] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="overflow-y-auto p-5 overflow-x-hidden flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
