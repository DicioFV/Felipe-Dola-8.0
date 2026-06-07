// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/auth/LoginPage.tsx
// Fase: 1 — Versão Direct Access por Nome (Sem Login Requerido)
// ============================================

import React, { useState } from "react";
import { Sparkles, User, ShieldCheck, Terminal, HelpCircle } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/components/ui/Toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Manipulação do submit de acesso por nome
  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast("Por favor, digite seu nome ou identificador do projeto.", "warning");
      return;
    }

    setLoading(true);
    try {
      await login(cleanName);
      
      if (cleanName.toLowerCase() === "adminfelipe") {
        toast("Acesso de Administrador Felipe concedido! Permissões de edição completa ativas.", "success");
      } else {
        toast(`Bem-vindo ao seu workspace individual: ${cleanName}! Sincronismo ativo.`, "success");
      }
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Erro ao conectar-se ao workspace.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setName("adminfelipe");
    toast("Identificador de Administrador preenchido! Clique em acessar.", "info");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0F] overflow-hidden select-none">
      {/* Luzes decorativas de fundo (neon azul e roxo do Dola AI) */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-150px] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Caixa de Acesso Central */}
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#00D2FF] p-2.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-xl font-bold font-display text-white tracking-widest">D</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-display font-medium tracking-tight text-white mb-1">
              DOLA AI
            </h1>
            <p className="text-xs text-[#8888A0] uppercase tracking-wider font-semibold">
              Executive Assistant Platform
            </p>
          </div>
        </div>

        <Card className="glass-panel border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden bg-[#10101F]/70 backdrop-blur-xl">
          <CardHeader className="p-0 mb-5 text-left">
            <CardTitle className="text-lg font-semibold text-white">Acesso Sem Senha</CardTitle>
            <CardDescription className="text-xs text-[#8888A0]">
              Informe seu nome ou chave do projeto para conectar ou criar seu espaço de forma individualizada.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleAccessSubmit} className="flex flex-col gap-4 text-left">
              {/* Campo para o Nome / Chave */}
              <div className="relative flex flex-col gap-1.5 text-left">
                <label className="text-xs font-medium text-[#8888A0]">Seu Nome ou Identificador do Canal</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: felipe ou adminfelipe"
                    className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-purple-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10"
                    disabled={loading}
                    autoFocus
                    required
                  />
                </div>
                
                {/* Dica explicativa sutil */}
                <div className="mt-1 flex items-start gap-1 text-[11px] text-[#8888A0]/80 leading-normal bg-[#18182E]/40 p-2.5 rounded-lg border border-white/[0.02]">
                  <HelpCircle size={12} className="shrink-0 text-cyan-400 mt-0.5" />
                  <span>
                    Seu nome identifica seu canal de dados de forma segura. Se for novo ele será salvo, e se já existir, ele recupera todo o seu progresso anterior!
                  </span>
                </div>
              </div>

              {/* Botão de Entrar / Criar Workspace */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full mt-2 font-display bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg shadow-lg shadow-purple-500/15 py-2.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {!loading && <Sparkles size={16} className="text-cyan-300" />}
                Conectar ao Workspace
              </Button>
            </form>

            {/* Separador e atalho para o admin completo */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-white/[0.05]"></div>
              <span className="flex-shrink mx-3 text-[10px] text-[#8888A0]/60 font-semibold uppercase tracking-wider font-mono">Controle Administrador</span>
              <div className="flex-grow border-t border-white/[0.05]"></div>
            </div>

            <button
              onClick={handleQuickAdmin}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A2E]/50 hover:bg-[#25253F]/60 text-xs font-semibold text-[#8888A0] hover:text-[#F1F1F3] border border-white/[0.04] p-2.5 rounded-lg transition-all cursor-pointer"
            >
              <Terminal size={14} className="text-[#00D2FF]" />
              Identificar-se como adminfelipe (Acesso Completo)
            </button>
          </CardContent>
        </Card>

        {/* Informações adicionais estéticas */}
        <div className="mt-6 flex flex-col items-center gap-1 select-none">
          <div className="flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/15">
            <ShieldCheck size={11} className="text-emerald-400 animate-pulse" />
            <span>SINCRONISMO SUPABASE DE ALTA DISPONIBILIDADE</span>
          </div>
          <p className="text-[10px] text-center text-[#8888A0]/40 uppercase tracking-widest leading-none mt-2">
            DOLA AI — SISTEMA EXECUTIVO PRIVADO
          </p>
        </div>
      </div>
    </div>
  );
}
