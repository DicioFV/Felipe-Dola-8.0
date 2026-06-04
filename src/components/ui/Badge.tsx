// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Badge.tsx
// Fase: 1
// ============================================

import React from "react";
import { cn } from "@/src/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant = "primary", className, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider";
  
  const variants = {
    primary: "bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/20",
    secondary: "bg-[#1A1A2E] text-[#8888A0] border border-white/5",
    success: "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20",
    warning: "bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/20",
    danger: "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20",
    info: "bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20"
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
