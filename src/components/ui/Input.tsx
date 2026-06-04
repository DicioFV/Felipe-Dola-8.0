// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Input.tsx
// Fase: 1
// ============================================

import React from "react";
import { cn } from "@/src/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-medium text-[#8888A0] select-none">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-lg bg-[#1A1A2E]/50 border border-white/[0.06] hover:border-white/10 focus:border-purple-500/80 px-3.5 py-2 text-sm text-[#F1F1F3] placeholder-[#8888A0]/50 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10 disabled:opacity-50 disabled:pointer-events-none",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-2xs text-[#FF5252] font-medium leading-none mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
