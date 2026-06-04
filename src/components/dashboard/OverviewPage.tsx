// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/OverviewPage.tsx
// Fase: 7 — Dashboard Personalizado - Widgets Reordenáveis e Ocultáveis
// ============================================

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Settings,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
  Heart,
  TrendingDown as TrendOff
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/components/ui/Toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";

interface OverviewPageProps {
  setCurrentTab?: (tab: string) => void;
}

interface DashboardWidget {
  id: string;
  title: string;
  category: "METRICS" | "FINANCES" | "PANELS";
  visible: boolean;
  order: number;
}

const defaultWidgets: DashboardWidget[] = [
  { id: "tasks_summary", title: "📋 Resumo de Tarefas", category: "METRICS", visible: true, order: 0 },
  { id: "meetings_summary", title: "📅 Compromissos Hoje", category: "METRICS", visible: true, order: 1 },
  { id: "habits_summary", title: "🎯 Hábitos Diários", category: "METRICS", visible: true, order: 2 },
  { id: "financial_risk", title: "⚠️ Alertas de Risco", category: "METRICS", visible: true, order: 3 },
  { id: "assets_patrimonio", title: "💼 Patrimônio Investido", category: "FINANCES", visible: true, order: 4 },
  { id: "debts_total", title: "🏦 Total em Dívidas", category: "FINANCES", visible: true, order: 5 },
  { id: "net_balance", title: "⚖️ Saldo Líquido", category: "FINANCES", visible: true, order: 6 },
  { id: "calendar_events", title: "📅 Painel - Compromissos Destacados", category: "PANELS", visible: true, order: 7 },
  { id: "urgent_tasks", title: "🔥 Painel - Tarefas Urgentes", category: "PANELS", visible: true, order: 8 },
  { id: "productivity_distribution", title: "📊 Painel - Distribuição de Produtividade", category: "PANELS", visible: true, order: 9 },
  { id: "quick_actions", title: "⚡ Painel - Ações Rápidas Bento", category: "PANELS", visible: true, order: 10 }
];

const quickActions = [
  { icon: "✅", label: "Nova Tarefa", href: "/tarefas" },
  { icon: "📅", label: "Novo Evento", href: "/agenda" },
  { icon: "📝", label: "Nova Nota", href: "/notas" },
  { icon: "⏰", label: "Novo Alarme", href: "/alarmes" },
  { icon: "📈", label: "Novo Investimento", href: "/investimentos" },
  { icon: "🏦", label: "Novo Empréstimo", href: "/emprestimos" },
];

export function OverviewPage({ setCurrentTab }: OverviewPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeChartFilter, setActiveChartFilter] = useState("1M");
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Inicializa os widgets do localStorage ou padrão
  useEffect(() => {
    const cached = localStorage.getItem("dola_dashboard_widgets_order");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as DashboardWidget[];
        // Merge com novos widgets caso existam
        if (parsed.length === defaultWidgets.length) {
          setWidgets(parsed.sort((a, b) => a.order - b.order));
          return;
        }
      } catch (e) {
        console.error("Erro carregando ordem de widgets", e);
      }
    }
    setWidgets([...defaultWidgets]);
  }, []);

  const saveWidgets = (newWidgets: DashboardWidget[]) => {
    const updated = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    setWidgets(updated);
    localStorage.setItem("dola_dashboard_widgets_order", JSON.stringify(updated));
  };

  const handleToggleVisibility = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveWidgets(updated);
    toast("Configuração de layout salva!", "success");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...widgets];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    saveWidgets(list);
  };

  const handleMoveDown = (index: number) => {
    if (index === widgets.length - 1) return;
    const list = [...widgets];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    saveWidgets(list);
  };

  const resetLayout = () => {
    saveWidgets([...defaultWidgets]);
    toast("Widget layout restaurado para o padrão!", "info");
  };

  const handleQuickAction = (actionLabel: string, href: string) => {
    if (setCurrentTab && href) {
      setCurrentTab(href);
    } else {
      toast(`Módulo '${actionLabel}' iniciado.`, "info");
    }
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return new Date().toLocaleDateString("pt-BR", options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Divide os widgets ativos por categoria de forma ordenada
  const orderedVisibleWidgets = widgets.filter(w => w.visible);

  // Mapeamento de blocos de renderização específicos para cada ID de widget
  const renderWidgetContent = (id: string) => {
    switch (id) {
      // METRIC CARDS
      case "tasks_summary":
        return (
          <Card hoverEffect className="border-[#30363D] flex flex-col justify-between p-4 bg-[#161B22]/80 h-full">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Painel de Tarefas</span>
                <h3 className="text-3xl font-bold tracking-tight text-[#E6EDF3] mt-1">4 <span className="text-xs text-slate-500 font-normal">pendentes</span></h3>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <CheckSquare size={16} />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-indigo-500 h-full w-2/3"></div>
            </div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-2">
              2 urgentes para hoje
            </div>
          </Card>
        );

      case "meetings_summary":
        return (
          <Card hoverEffect className="border-[#30363D] flex flex-col justify-between p-4 bg-[#161B22]/80 h-full">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Compromissos hoje</span>
                <h3 className="text-3xl font-bold tracking-tight text-[#E6EDF3] mt-1">2 <span className="text-xs text-slate-500 font-normal">agendados</span></h3>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Calendar size={16} />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-emerald-500 h-full w-1/2"></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 truncate uppercase tracking-tighter">
              Próximo • Reunião Semanal 14h
            </div>
          </Card>
        );

      case "habits_summary":
        return (
          <Card hoverEffect className="border-[#30363D] flex flex-col justify-center items-center text-center p-6 bg-[#161B22]/80 h-full">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Hábitos diários</div>
            <div className="text-4xl font-bold text-emerald-400 tracking-tight">3/5</div>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Streak ativo de 6 dias!</div>
          </Card>
        );

      case "financial_risk":
        return (
          <Card hoverEffect className="border-[#30363D] flex flex-col justify-center items-center text-center p-6 bg-[#161B22]/80 h-full">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Risk & Contas</div>
            <div className="text-4xl font-bold text-amber-400 tracking-tight">1 <span className="text-sm text-slate-500 font-normal font-mono">A-</span></div>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-semibold">Vence em 2 dias • R$ 340</div>
          </Card>
        );

      // FINANCES CARDS
      case "assets_patrimonio":
        return (
          <Card hoverEffect className="border-[#30363D] bg-[#161B22] p-5 h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">💼 Patrimônio Investido</span>
              <span className="p-1 px-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-3xs font-bold uppercase flex items-center gap-0.5 font-mono">
                <ArrowUpRight size={10} /> +14.2% YOY
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#00E676] font-display">R$ 150.000,00</h2>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-indigo-500 h-full w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-2 font-medium">Soma de todos os investimentos ativos</p>
          </Card>
        );

      case "debts_total":
        return (
          <Card hoverEffect className="border-[#30363D] bg-[#161B22] p-5 h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">🏦 Total em Dívidas</span>
              <span className="p-1 px-1.5 rounded-full bg-rose-500/10 text-rose-400 text-3xs font-bold uppercase flex items-center gap-0.5 font-mono">
                <ArrowDownRight size={10} /> -4.5%
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#FF5252] font-display">R$ 42.000,00</h2>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-rose-500 h-full w-1/3"></div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-2 font-medium">Soma acumulada de todos os empréstimos</p>
          </Card>
        );

      case "net_balance":
        return (
          <Card hoverEffect className="border-[#30363D] bg-[#161B22] p-5 h-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">⚖️ Saldo Líquido</span>
              <span className="px-1.5 py-0.5 bg-indigo-500/10 rounded text-[8px] text-indigo-400 font-bold uppercase tracking-wider">Livre</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-indigo-400 font-display">R$ 108.000,00</h2>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-indigo-500 h-full w-[72%]"></div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter mt-2 font-medium">Patrimônio disponível descontando empréstimos</p>
          </Card>
        );

      // PANELS CARDS
      case "calendar_events":
        return (
          <Card className="border-[#30363D] bg-[#161B22] h-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row justify-between items-center p-0 mb-4">
                <div>
                  <CardTitle className="text-sm">📅 Compromissos destacados</CardTitle>
                  <CardDescription>Eventos programados de hoje</CardDescription>
                </div>
                <Badge variant="info" className="text-3xs uppercase font-bold border-none py-0.5 px-2">Agenda</Badge>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="p-4 rounded-xl bg-[#0B0F1A]/45 border border-[#30363D] flex gap-3 transition-colors hover:bg-[#0B0F1A]/80">
                  <div className="w-1 bg-[#6C5CE7] h-10 rounded-full shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#E6EDF3]">Reunião Semanal de Alinhamento</h4>
                      <span className="text-[10px] text-slate-500 font-mono">14:00 - 15:30</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Sala Remota Zoom • Equipe de Plataforma</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0B0F1A]/45 border border-[#30363D] flex gap-3 transition-colors hover:bg-[#0B0F1A]/80">
                  <div className="w-1 bg-emerald-500 h-10 rounded-full shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#E6EDF3]">Revisão Patrimonial Trimestral</h4>
                      <span className="text-[10px] text-slate-500 font-mono">16:30 - 17:30</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Escritório Central • Consultoria de Investimento</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        );

      case "urgent_tasks":
        return (
          <Card className="border-[#30363D] bg-[#161B22] h-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row justify-between items-center p-0 mb-4">
                <div>
                  <CardTitle className="text-sm">🔥 Tarefas Urgentes</CardTitle>
                  <CardDescription>Alta prioridade necessitando ação imediata</CardDescription>
                </div>
                <Badge variant="danger" className="text-3xs uppercase font-bold border-none py-0.5 px-2">Urgente</Badge>
              </CardHeader>
              <CardContent className="p-0 space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F1A]/45 border border-[#30363D]">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-[#E6EDF3]">Quitar Fatura Cartão Master</h5>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Vence Amanhã • R$ 1.890,00</p>
                    </div>
                  </div>
                  <Badge variant="danger" className="text-[8px] font-bold border-none">ALTA</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F1A]/45 border border-[#30363D]">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-[#E6EDF3]">Reunião de Escopo com Desenvolvimento</h5>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Hoje às 15:30 • Trabalho</p>
                    </div>
                  </div>
                  <Badge variant="warning" className="text-[8px] font-bold border-none">MÉDIA</Badge>
                </div>
              </CardContent>
            </div>
          </Card>
        );

      case "productivity_distribution":
        return (
          <Card className="border-[#30363D] bg-[#161B22] flex flex-col justify-between h-full p-4">
            <CardHeader className="flex flex-row justify-between items-start p-0 mb-4">
              <div>
                <CardTitle className="text-sm">📊 Distribuição de Produtividade</CardTitle>
                <CardDescription>Status atual e métricas cumulativas</CardDescription>
              </div>
              <div className="flex gap-1.5 bg-slate-900 border border-[#30363D] p-1 rounded-lg">
                {["1W", "1M", "1Y"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveChartFilter(filter)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      activeChartFilter === filter
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-28 flex items-end justify-between gap-1.5 px-1 pt-4">
                {activeChartFilter === "1W" ? (
                  [40, 65, 80, 55, 90, 85, 95].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div 
                        className="w-full bg-[#30363D]/60 hover:bg-slate-700 rounded-t-md transition-all relative overflow-hidden"
                        style={{ height: `${val}%` }}
                      >
                        <div className="absolute inset-0 bg-indigo-500/85 transition-all opacity-0 group-hover:opacity-100" />
                        {idx === 4 && <div className="absolute inset-0 bg-indigo-500/90" />}
                        {idx === 6 && <div className="absolute inset-0 bg-emerald-500/90" />}
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono font-bold">
                        {["S", "T", "Q", "Q", "S", "S", "D"][idx]}
                      </span>
                    </div>
                  ))
                ) : activeChartFilter === "1M" ? (
                  [30, 45, 60, 40, 75, 55, 80, 70, 85, 65, 95, 50].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div 
                        className="w-full bg-[#30363D]/50 hover:bg-[#30363D] rounded-t-sm transition-all relative overflow-hidden"
                        style={{ height: `${val}%` }}
                      >
                        <div className="absolute inset-0 bg-indigo-500/80 transition-all opacity-0 group-hover:opacity-100" />
                        {idx === 10 && <div className="absolute inset-0 bg-emerald-500/90 w-full" />}
                        {idx === 3 && <div className="absolute inset-0 bg-indigo-500/80 w-full" />}
                      </div>
                      <span className="text-[7.5px] text-slate-500 font-mono font-bold scale-[0.8]">
                        {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][idx]}
                      </span>
                    </div>
                  ))
                ) : (
                  [65, 75, 85, 95].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div 
                        className="w-full bg-[#30363D]/60 hover:bg-slate-700 rounded-t-lg transition-all relative overflow-hidden"
                        style={{ height: `${val}%` }}
                      >
                        <div className="absolute inset-0 bg-[#A55EEA]" />
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono font-bold">
                        {["T1", "T2", "T3", "T4"][idx]}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "quick_actions":
        return (
          <Card className="border-[#30363D] bg-[#161B22] p-4 h-full flex flex-col justify-between">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm">⚡ Ações Rápidas Bento</CardTitle>
              <CardDescription>Lançamentos e atalhos rápidos do sistema</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAction(action.label, action.href)}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-[#0B0F1A]/75 hover:bg-slate-800/80 border border-[#30363D] hover:border-indigo-500/40 transition-all duration-300 gap-1.5 group cursor-pointer text-center"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="text-[8.5px] text-slate-400 group-hover:text-white font-bold tracking-widest uppercase transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn relative">
      
      {/* HUD customizador de widgets deslizante / in-line */}
      {isCustomizerOpen && (
        <Card className="border-indigo-500/40 bg-[#0D1117] p-5 shadow-2xl relative overflow-hidden ring-1 ring-indigo-500/10">
          <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4 relative z-10">
            <div>
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-200 flex items-center gap-1.5">
                <Settings size={14} className="text-indigo-400 animate-spin-slow" />
                ⚙️ Personalizar Widgets do Dashboard
              </CardTitle>
              <CardDescription>Oculte, exiba ou reordene as seções bento do seu DOLA AI</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={resetLayout} 
                className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-bold h-7 px-3.5 rounded-lg"
              >
                <RefreshCw size={10} className="mr-1" /> Padrão
              </Button>
              <Button 
                onClick={() => setIsCustomizerOpen(false)}
                className="bg-indigo-650 hover:bg-indigo-600 text-[#E6EDF3] text-[10px] font-bold h-7 px-4 rounded-lg"
              >
                Salvar & Fechar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10 max-h-96 overflow-y-auto pr-1">
            {widgets.map((w, idx) => (
              <div 
                key={w.id} 
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  w.visible 
                    ? "bg-[#161B22]/80 border-[#30363D] hover:border-indigo-550/50" 
                    : "bg-[#0B0F1A]/40 border-slate-900 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(w.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 transition text-[#E6EDF3] cursor-pointer"
                    title={w.visible ? "Ocultar Widget" : "Exibir Widget"}
                  >
                    {w.visible ? <Eye size={12} className="text-emerald-400" /> : <EyeOff size={12} className="text-slate-500" />}
                  </button>
                  <span className="text-[10px] font-bold text-slate-200 truncate max-w-[130px]">{w.title}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Mover para cima"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <span className="text-[9px] font-bold font-mono text-slate-600 px-0.5">{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === widgets.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Mover para baixo"
                  >
                    <ArrowDown size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] p-6">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-medium tracking-tight text-[#E6EDF3]">
                {getGreeting()}, <span className="text-indigo-400 font-semibold">{user?.name}</span>!
              </h1>
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-medium capitalize">
              Hoje é {getFormattedDate()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "SUPERADMIN" && (
              <Button 
                onClick={() => setCurrentTab && setCurrentTab("/usuarios")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-550 hover:to-indigo-550 text-white font-bold text-2xs flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border-none shadow-md cursor-pointer"
              >
                <span>👑 Admin</span>
              </Button>
            )}
            <Button 
              onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
              className="bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] font-bold text-2xs flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border border-[#30363D] shadow-md cursor-pointer"
            >
              <Settings size={13} className="text-indigo-400" />
              📊 Customizar Widgets
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Dinâmico de Métricas Rápidas (id: tasks_summary, meetings_summary, habits_summary, financial_risk) */}
      {orderedVisibleWidgets.some(w => w.category === "METRICS") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {orderedVisibleWidgets
            .filter(w => w.category === "METRICS")
            .map(w => (
              <div key={w.id} className="h-full">
                {renderWidgetContent(w.id)}
              </div>
            ))}
        </div>
      )}

      {/* Grid Dinâmico de Métricas Financeiras Avançadas (id: assets_patrimonio, debts_total, net_balance) */}
      {orderedVisibleWidgets.some(w => w.category === "FINANCES") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          {orderedVisibleWidgets
            .filter(w => w.category === "FINANCES")
            .map(w => (
              <div key={w.id} className="h-full">
                {renderWidgetContent(w.id)}
              </div>
            ))}
        </div>
      )}

      {/* Grid Dinâmico de Painéis de Controle Bento (id: calendar_events, urgent_tasks, productivity_distribution, quick_actions) */}
      {orderedVisibleWidgets.some(w => w.category === "PANELS") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn">
          {/* Se múltiplos painéis ativos, renderizamos em colunas bento flexíveis */}
          {orderedVisibleWidgets
            .filter(w => w.category === "PANELS")
            .map((w, index) => {
              // Mapeamento dinâmico de col-span para harmonizar o layout bento dependendo do número de painéis ativos
              let colSpan = "lg:col-span-6";
              if (w.id === "calendar_events" || w.id === "urgent_tasks") colSpan = "lg:col-span-6";
              if (w.id === "productivity_distribution" || w.id === "quick_actions") colSpan = "lg:col-span-6";
              
              // Se sobrar apenas um painel central
              const panelsCount = orderedVisibleWidgets.filter(w => w.category === "PANELS").length;
              if (panelsCount === 1) colSpan = "lg:col-span-12";
              
              return (
                <div key={w.id} className={colSpan}>
                  {renderWidgetContent(w.id)}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
