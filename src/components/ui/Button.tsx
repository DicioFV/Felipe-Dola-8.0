// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Button.tsx
// Fase: 1
// ============================================

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white",
      secondary: "bg-[#1A1A2E] hover:bg-[#25253F] text-[#F1F1F3] border border-white/5",
      danger: "bg-[#FF5252] hover:bg-[#E04343] text-white",
      success: "bg-[#00E676] hover:bg-[#00C853] text-[#0A0A0F] font-semibold",
      warning: "bg-[#FFD600] hover:bg-[#E6C000] text-[#0A0A0F] font-semibold",
      ghost: "hover:bg-white/5 text-[#8888A0] hover:text-[#F1F1F3]",
      outline: "bg-transparent border border-white/10 hover:bg-white/5 text-[#F1F1F3]"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Carregando...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
