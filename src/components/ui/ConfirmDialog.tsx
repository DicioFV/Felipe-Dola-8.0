// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/ConfirmDialog.tsx
// Fase: 1
// ============================================

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Apagar",
  cancelText = "Cancelar",
  isDanger = true
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="rounded-full bg-red-500/10 p-3 text-[#FF5252]">
          <AlertTriangle size={24} />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[#F1F1F3]">{title}</p>
          <p className="text-xs text-[#8888A0] leading-normal">{description}</p>
        </div>

        <div className="flex gap-2 w-full mt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 bg-white/5 text-[#F1F1F3] border border-white/5"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
