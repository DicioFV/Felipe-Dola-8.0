// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/AssistentePage.tsx
// Fase: 6 — Inteligência Executiva Central
// ============================================

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, BrainCircuit, RefreshCw, Layers, ShieldCheck, Database } from "lucide-react";
import { useToast } from "../ui/Toast";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export function AssistentePage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "assistant",
      text: "### **Inteligência Central DOLA AI Ativa**\n\nBem-vindo à Fase 6 de Operações. Eu sou sua interface cognitiva integrada. Sincronizei com sua agenda, tarefas, hábitos, investimentos e dívidas em tempo real.\n\nEscolha uma das auditorias rápidas abaixo ou me dê instruções diretas para estruturar seu plano.",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend })
      });

      if (!res.ok) {
        throw new Error("Falha na comunicação com o assistente.");
      }

      const data = await res.json();
      
      // Pequeno delay artificial para ficar refinado
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ans-${Date.now()}`,
            sender: "assistant",
            text: data.text,
            timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        setIsTyping(false);
      }, 600);

    } catch (err: any) {
      toast("Não foi possível processar a resposta. Verifique os servidores Dola AI.", "error");
      setIsTyping(false);
    }
  };

  // Helper para renderizar markdown simples (bold, títulos, listas) de forma luxuosa
  const renderFormattedText = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      // Títulos principais com linhas inferiores
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-sm font-bold text-indigo-400 mt-4 mb-2 pb-1 border-b border-[#30363D]/40 font-display flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-400 animate-pulse" />
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-base font-bold text-[#E6EDF3] mt-5 mb-3 font-display">
            {line.replace("## ", "")}
          </h2>
        );
      }
      // Listas de bullet
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const cleanContent = line.replace(/^[\s*-]+/, "");
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc mb-1 leading-relaxed">
            {parseInlineStyles(cleanContent)}
          </li>
        );
      }
      // Listas numeradas
      if (/^\d+\.\s/.test(line.trim())) {
        const cleanContent = line.replace(/^\d+\.\s/, "");
        const num = line.match(/^\d+/)?.[0] || "";
        return (
          <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 my-2 leading-relaxed">
            <span className="flex h-5 w-5 rounded-full bg-slate-800 text-indigo-400 font-bold border border-indigo-500/20 text-[10px] items-center justify-center shrink-0">
              {num}
            </span>
            <div className="flex-1 pt-0.5">{parseInlineStyles(cleanContent)}</div>
          </div>
        );
      }
      // Parágrafos normais
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-1.5">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (txt: string) => {
    // Parser super simples para negrito **
    const parts = txt.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-white font-semibold">{part}</strong>;
      }
      // Code tags `coisas`
      const codeParts = part.split(/`([\s\S]*?)`/g);
      return codeParts.map((sub, j) => {
        if (j % 2 === 1) {
          return <code key={j} className="px-1.5 py-0.5 bg-[#0B0F1A] border border-[#30363D] text-[#A55EEA] text-[10px] font-mono rounded">{sub}</code>;
        }
        return sub;
      });
    });
  };

  const shortcuts = [
    { title: "Auditar Meu Dia", prompt: "Execute uma auditoria completa nos meus dados de hoje." },
    { title: "Diagnóstico de Orçamento", prompt: "Análise meu orçamento mensal e dê recomendações de economia." },
    { title: "Relatório de Ativos", prompt: "Como está minha carteira de investimentos e metas atuais?" },
    { title: "Plano de Dívidas", prompt: "Análise meus empréstimos e planeje uma estratégia para quitá-los rápido." }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 select-none max-w-5xl mx-auto">
      {/* Top Welcome Card */}
      <div className="p-4 bg-gradient-to-r from-slate-900/40 via-indigo-950/20 to-slate-900/40 border border-[#30363D]/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <BrainCircuit className="text-indigo-400 animate-pulse" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#E6EDF3] tracking-tight flex items-center gap-1.5 font-display">
              Inteligência Executiva Copilot
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Analisa automaticamente cruzamentos de performance e ativos financeiros da sua conta</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
            <ShieldCheck size={11} /> Real-Time Sync
          </div>
          <div className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
            <Database size={11} /> Fase 6 Integrada
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Sidebar Sugestões */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Auditorias Rápidas</p>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
            {shortcuts.map((sh, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sh.prompt)}
                className="p-3 text-left bg-[#161B22]/50 hover:bg-[#161B22]/90 border border-[#30363D] hover:border-indigo-500/40 rounded-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-indigo-400 transition-colors">
                  <Sparkles size={11} className="text-indigo-500 shrink-0 group-hover:animate-bounce" />
                  <span>{sh.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 truncate group-hover:text-slate-400 transition-colors">{sh.prompt}</p>
              </button>
            ))}
          </div>

          <div className="flex-1 hidden md:flex flex-col justify-end p-4 bg-gradient-to-t from-indigo-950/10 to-transparent border border-[#30363D]/20 rounded-2xl">
            <p className="text-[10px] text-indigo-400 font-bold tracking-wide flex items-center gap-1.5">
              <BrainCircuit size={12} />
              DOLA Cognição v1.0
            </p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              DOLA AI aprende com seus comportamentos diários. Cada hábito que você completa ou dívida que abate aumenta sua pontuação de maturidade financeira.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#161B22]/40 border border-[#30363D] rounded-2xl overflow-hidden relative">
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === "user" ? "bg-slate-800 text-slate-200" : "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400"
                }`}>
                  {msg.sender === "user" ? "ME" : "Ω"}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-left border ${
                  msg.sender === "user"
                    ? "bg-slate-800/80 border-[#30363D] text-slate-100 rounded-tr-none"
                    : "bg-[#0B0F1A]/80 border-[#30363D]/80 text-[#E6EDF3] rounded-tl-none"
                }`}>
                  {msg.sender === "user" ? <p className="text-xs">{msg.text}</p> : renderFormattedText(msg.text)}
                  <p className="text-[8px] text-slate-500 font-semibold tracking-wide text-right mt-2">{msg.timestamp}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  Ω
                </div>
                <div className="px-4 py-3 bg-[#0B0F1A]/80 border border-[#30363D]/80 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 bg-[#0B0F1A]/40 border-t border-[#30363D] flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite suas ordens ou perguntas para o DOLA AI..."
              className="flex-1 bg-[#0B0F1A]/80 text-xs px-4 py-2.5 border border-[#30363D] hover:border-slate-700 focus:border-indigo-500/80 focus:outline-none rounded-xl text-slate-100 transition-all font-sans"
            />
            <button
              type="submit"
              className="px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border border-indigo-400/20 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
