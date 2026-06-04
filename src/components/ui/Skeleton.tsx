// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Skeleton.tsx
// Fase: 1
// ============================================

import React from "react";
import { cn } from "@/src/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
  className?: string;
}

export function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/[0.04]",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      {...props}
    />
  );
}
