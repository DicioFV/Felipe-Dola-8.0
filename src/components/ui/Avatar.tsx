// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/ui/Avatar.tsx
// Fase: 1
// ============================================

import React from "react";
import { cn } from "@/src/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "sm", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl"
  };

  const getInitials = (userName: string) => {
    if (!userName) return "U";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#1A1A2E] text-[#F1F1F3] font-semibold items-center justify-center select-none shadow-inner",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover aspect-square"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Se falhar o carregamento da imagem, esconde a tag img para exibir as iniciais
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
