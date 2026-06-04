import React from "react";
import { LogOut, ShieldCheck, Smartphone, X } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { User } from "@/src/types";

export function Sidebar({ currentTab, setCurrentTab }: { currentTab: string, setCurrentTab: (tab: string) => void }) {
  const { user, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [showPwaModal, setShowPwaModal] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA instalado!");
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaModal(true);
    }
  };

  if (!user) return null;

  // Navegação dinâmica com base no papel do usuário
  const navigationItems = [
    // — PRODUTIVIDADE
    { icon: "🏠", label: "Dashboard", href: "/dashboard" },
    { icon: "📅", label: "Agenda", href: "/agenda" }, 
    { icon: "✅", label: "Tarefas", href: "/tarefas" }, 
    { icon: "📝", label: "Notas", href: "/notas" }, 
    { icon: "⏰", label: "Alarmes", href: "/alarmes" }, 
    { icon: "🔄", label: "Hábitos", href: "/habitos" }, 
    { icon: "🎯", label: "Roleta Inteligente", href: "/roleta" },
    { icon: "👨‍👩‍👧", label: "Família", href: "/familia" },
    { icon: "💬", label: "WhatsApp Bot", href: "/whatsapp", badge: "Grátis", badgeColor: "#25D366" },
    
    // — FINANCEIRO (separador visual)
    { separator: true, label: "Financeiro" },
    { icon: "💰", label: "Financeiro", href: "/financeiro" },
    { icon: "📈", label: "Investimentos", href: "/investimentos" },
    { icon: "🏦", label: "Empréstimos", href: "/emprestimos" },
    { icon: "🧮", label: "Calculadora Inteligente", href: "/calculadora" },
    
    // — ANÁLISE (separador visual)
    { separator: true, label: "Análise" },
    { icon: "📊", label: "Relatórios", href: "/relatorios" },
    { icon: "🛡️", label: "Auditoria", href: "/auditoria", badge: "Sec", badgeColor: "#A55EEA" },
    { icon: "🤖", label: "Assistente IA", href: "/assistente", badge: "Live", badgeColor: "#20BF6B" },
    
    // — CONTA (separador visual)
    { separator: true, label: "Conta" },
    { icon: "👤", label: "Perfil", href: "/perfil" },
    { icon: "⚙️", label: "Configurações", href: "/configuracoes" },

    // — GERENCIAMENTO ADM (Fase 2)
    ...(user.role === "SUPERADMIN" ? [
      { separator: true, label: "Administração" },
      { icon: "👑", label: "Admin", href: "/usuarios" }
    ] : [])
  ];

  return (
    <aside className="w-64 bg-[#161B22]/95 backdrop-blur-md border-r border-[#30363D] h-screen flex flex-col justify-between fixed top-0 left-0 z-20 select-none pb-4 font-sans">
      {/* Header Info */}
      <div className="flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-[#30363D]">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 italic">
            Ω
          </div>
          <div>
            <h1 className="text-sm font-semibold font-display text-[#E6EDF3] tracking-tight">DOLA <span className="text-slate-500 font-normal">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Executive Platform</p>
          </div>
        </div>
 
        {/* User Card */}
        <div className="mx-4 my-4 p-3 bg-[#0B0F1A]/50 rounded-xl border border-[#30363D] flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
              alt={user.name}
              className="w-9 h-9 rounded-full border border-[#30363D]"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#161B22] rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-xs font-semibold text-[#E6EDF3] truncate leading-tight">{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={10} className="text-indigo-400" />
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>
 
        {/* Scrollable Nav list */}
        <nav className="flex-1 overflow-y-auto max-h-[60vh] px-2 space-y-0.5">
          {navigationItems.map((item, index) => {
            if (item.separator) {
              return (
                <div key={index} className="px-3 pt-4 pb-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                    {item.label}
                  </span>
                </div>
              );
            }
 
            const isSelected = currentTab === item.href;
 
            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentTab(item.href || "/dashboard");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-[#E6EDF3]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm opacity-90">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
 
                {item.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[8px] font-bold leading-none select-none uppercase tracking-wider"
                    style={{
                      background: `${(item as any).badgeColor || "rgba(255, 255, 255, 0.04)"}`,
                      color: (item as any).badgeColor ? "#fff" : "#ff5252"
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* Log out Footer */}
      <div className="px-4 pt-3 border-t border-[#30363D] space-y-1.5">
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <Smartphone size={14} />
          Instalar no Aparelho
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Sair da Conta
        </button>
      </div>

      {/* Modal de Instalação PWA */}
      {showPwaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowPwaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                📱
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Instalar DOLA AI</h3>
                <p className="text-xs text-slate-400">Instale no celular, tablet ou computador</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-300">
                O DOLA AI funciona como um aplicativo nativo no seu aparelho, sem ocupar espaço da sua loja de aplicativos.
              </p>

              <div className="space-y-3">
                {/* Opção iOS */}
                <div className="p-3 bg-[#0B0F1A] rounded-xl border border-[#30363D]">
                  <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    🍎 iPhone & iPad (Safari)
                  </h4>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1">
                    <li>Toque no botão de <strong>Compartilhar</strong> (ícone de seta pra cima na barra inferior).</li>
                    <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                    <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
                  </ol>
                </div>

                {/* Opção Android */}
                <div className="p-3 bg-[#0B0F1A] rounded-xl border border-[#30363D]">
                  <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    🤖 Android (Chrome)
                  </h4>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1">
                    <li>Toque no ícone de <strong>três pontos</strong> no canto superior direito.</li>
                    <li>Selecione a opção <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à Tela Inicial</strong>.</li>
                  </ol>
                </div>

                {/* Opção Computador / PC */}
                <div className="p-3 bg-[#0B0F1A] rounded-xl border border-[#30363D]">
                  <h4 className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    🖥️ Computador (Chrome/Edge)
                  </h4>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1">
                    <li>Clique no ícone de <strong>instalação</strong> (computador com seta para baixo) na barra de endereços do navegador.</li>
                    <li>Ou clique nos <strong>três pontos</strong> do menu e selecione <strong>Instalar Dola AI</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPwaModal(false)}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
