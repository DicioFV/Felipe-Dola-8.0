// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Toast.tsx
// Fase: 1
// ============================================

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado com um ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove após 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void; key?: string }) {
  const iconMap = {
    success: <CheckCircle2 className="text-[#00E676] shrink-0" size={18} />,
    error: <XCircle className="text-[#FF5252] shrink-0" size={18} />,
    warning: <AlertCircle className="text-[#FFD600] shrink-0" size={18} />,
    info: <Info className="text-[#00D2FF] shrink-0" size={18} />
  };

  const bgBorderMap = {
    success: "bg-[#0A0A0F]/90 border-[#00E676]/20",
    error: "bg-[#0A0A0F]/90 border-[#FF5252]/20",
    warning: "bg-[#0A0A0F]/90 border-[#FFD600]/20",
    info: "bg-[#0A0A0F]/90 border-[#00D2FF]/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 15 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-xl shadow-black/60 backdrop-blur-md ${bgBorderMap[toast.type]}`}
    >
      {iconMap[toast.type]}
      <div className="flex-1">
        <p className="text-xs font-medium text-[#F1F1F3] leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-[#8888A0] hover:text-[#F1F1F3] transition-colors p-0.5 cursor-pointer rounded-md hover:bg-white/5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
