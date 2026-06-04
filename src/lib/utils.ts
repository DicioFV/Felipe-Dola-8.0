// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/lib/utils.ts
// Fase: 1
// ============================================

/**
 * Utilitário para combinar classes Tailwind de forma condicional.
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(" ");
}

/**
 * Formata um valor numérico para Moeda Brasileira (R$).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA).
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("pt-BR");
}

/**
 * Retorna uma saudação dependendo do horário atual.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}
