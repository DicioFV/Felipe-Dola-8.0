// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Select.tsx
// Fase: 1
// ============================================

import React from "react";
import { cn } from "@/src/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-medium text-[#8888A0] select-none">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full rounded-lg bg-[#1A1A2E]/50 border border-white/[0.06] hover:border-white/10 focus:border-purple-500/80 px-3.5 py-2 text-sm text-[#F1F1F3] transition-colors outline-none focus:ring-2 focus:ring-purple-500/10 disabled:opacity-50 disabled:pointer-events-none appearance-none cursor-pointer",
              error && "border-red-500/80 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#12121A] text-[#F1F1F3]">
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#8888A0]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-2xs text-[#FF5252] font-medium leading-none mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
