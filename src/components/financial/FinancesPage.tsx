// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/financial/FinancesPage.tsx
// Fase: 3 — Gestão Financeira Completa
// ============================================

import React, { useState, useMemo } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Finance, FinanceType } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Check,
  Percent,
  Calculator,
  RefreshCw,
  Clock,
  Briefcase
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";

// Categorias padrão para auxiliar o usuário
const DEFAULT_CATEGORIES = [
  "Salário",
  "Rendimentos",
  "Alimentação",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Assinaturas",
  "Investimentos",
  "Serviços",
  "Outros"
];

// Cores para as categorias
const CATEGORY_COLORS: Record<string, string> = {
  "Salário": "#00E676",
  "Rendimentos": "#00D2FF",
  "Alimentação": "#FF9F43",
  "Moradia": "#EA5455",
  "Transporte": "#9F65FF",
  "Lazer": "#FF6B6B",
  "Saúde": "#1DD1A1",
  "Educação": "#54A0FF",
  "Assinaturas": "#A55EEA",
  "Investimentos": "#10AC84",
  "Serviços": "#F1C40F",
  "Outros": "#8395A7"
};

export function FinancesPage() {
  const { data: finances, loading, create, update, remove, refresh } = useCrud<Finance>("/api/finances");
  
  // Estados de Filtros e Busca
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Estado para Modal de Inserção / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);

  // Estados de Formulário
  const [type, setType] = useState<FinanceType>("EXPENSE");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");
  const [dueDate, setDueDate] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [recurrence, setRecurrence] = useState("UNIQUE");
  const [notes, setNotes] = useState("");

  // Estado para Simulação Inteligente de Fluxo de Caixa (Previsão de 30/60/90 dias)
  const [showProjection, setShowProjection] = useState(false);
  const [projectionDays, setProjectionDays] = useState(30);

  // Filtra as transações baseadas nos inputs do usuário
  const filteredFinances = useMemo(() => {
    return (finances || []).filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === "ALL" || f.type === typeFilter;
      const matchesCategory = categoryFilter === "ALL" || f.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === "PAID") matchesStatus = f.isPaid;
      if (statusFilter === "PENDING") matchesStatus = !f.isPaid;

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [finances, searchQuery, typeFilter, categoryFilter, statusFilter]);

  // Cálculos financeiros consolidados
  const stats = useMemo(() => {
    const list = finances || [];
    let incomesTotal = 0;      // INCOME
    let expensesTotal = 0;     // EXPENSE
    let payablesTotal = 0;     // PAYABLE
    let receivablesTotal = 0;  // RECEIVABLE

    let paidIncomes = 0;
    let paidExpenses = 0;
    let pendingPayables = 0;
    let pendingReceivables = 0;

    list.forEach(f => {
      const amt = f.amount || 0;
      if (f.type === "INCOME") {
        incomesTotal += amt;
        if (f.isPaid) paidIncomes += amt;
      } else if (f.type === "EXPENSE") {
        expensesTotal += amt;
        if (f.isPaid) paidExpenses += amt;
      } else if (f.type === "PAYABLE") {
        payablesTotal += amt;
        if (!f.isPaid) pendingPayables += amt;
      } else if (f.type === "RECEIVABLE") {
        receivablesTotal += amt;
        if (!f.isPaid) pendingReceivables += amt;
      }
    });

    // Saldo disponível líquido real = (Receitas Pagas + Recebíveis Recebidos) - (Despesas Pagas + Contas Pagas)
    // Para simplificar: Saldo Estimado = Todas Entradas (INCOME + RECEIVABLE) - Todas Saídas (EXPENSE + PAYABLE)
    const saldoLiquidoAtual = paidIncomes - paidExpenses;
    const fluxoLiquidoFuturo = (paidIncomes + receivablesTotal) - (paidExpenses + payablesTotal);

    return {
      incomesTotal,
      expensesTotal,
      payablesTotal,
      receivablesTotal,
      saldoLiquidoAtual,
      fluxoLiquidoFuturo,
      paidIncomes,
      paidExpenses,
      pendingPayables,
      pendingReceivables
    };
  }, [finances]);

  // Projeção Matemática baseada em transações recorrentes e pendências
  const projectionData = useMemo(() => {
    const list = finances || [];
    let startBalance = stats.saldoLiquidoAtual;
    
    // Projeta ganhos e perdas pendentes que vencem nos próximos N dias
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + projectionDays);

    let projectedInflow = 0;
    let projectedOutflow = 0;

    list.forEach(f => {
      if (!f.isPaid && f.dueDate) {
        const itemDate = new Date(f.dueDate);
        if (itemDate >= today && itemDate <= limitDate) {
          if (f.type === "RECEIVABLE" || f.type === "INCOME") {
            projectedInflow += f.amount;
          } else {
            projectedOutflow += f.amount;
          }
        }
      }

      // Adiciona recorrências mensais simuladas para os próximos dias
      if (f.recurrence === "MONTHLY" && f.isPaid) {
        const monthlyTimes = Math.floor(projectionDays / 30);
        if (monthlyTimes > 0) {
          if (f.type === "INCOME") {
            projectedInflow += f.amount * monthlyTimes;
          } else if (f.type === "EXPENSE" || f.type === "PAYABLE") {
            projectedOutflow += f.amount * monthlyTimes;
          }
        }
      }
    });

    const targetBalance = startBalance + projectedInflow - projectedOutflow;

    return {
      startBalance,
      projectedInflow,
      projectedOutflow,
      targetBalance
    };
  }, [finances, stats, projectionDays]);

  // Agrupamento por Categoria para gráfico visual em barra
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    const totalOut = (finances || [])
      .filter(f => f.type === "EXPENSE" || f.type === "PAYABLE")
      .reduce((acc, f) => acc + (f.amount || 0), 0) || 1;

    (finances || []).forEach(f => {
      if (f.type === "EXPENSE" || f.type === "PAYABLE") {
        const cat = f.category || "Outros";
        summary[cat] = (summary[cat] || 0) + f.amount;
      }
    });

    return Object.entries(summary).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalOut) * 100)
    })).sort((a, b) => b.value - a.value);
  }, [finances]);

  // Formata o dinheiro em Real
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const startCreate = (pType?: FinanceType) => {
    setEditingFinance(null);
    setType(pType || "EXPENSE");
    setTitle("");
    setAmount("");
    setCategory(pType === "INCOME" || pType === "RECEIVABLE" ? "Salário" : "Alimentação");
    setDueDate(new Date().toISOString().split("T")[0]);
    setPaidAt("");
    setIsPaid(pType === "INCOME" || pType === "EXPENSE");
    setRecurrence("UNIQUE");
    setNotes("");
    setIsModalOpen(true);
  };

  const startEdit = (f: Finance) => {
    setEditingFinance(f);
    setType(f.type);
    setTitle(f.title);
    setAmount(String(f.amount));
    setCategory(f.category || "Outros");
    setDueDate(f.dueDate ? f.dueDate.split("T")[0] : "");
    setPaidAt(f.paidAt ? f.paidAt.split("T")[0] : "");
    setIsPaid(f.isPaid);
    setRecurrence(f.recurrence || "UNIQUE");
    setNotes(f.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      const payload = {
        type,
        title,
        amount: parseFloat(amount),
        category,
        dueDate: dueDate || null,
        paidAt: isPaid ? (paidAt || new Date().toISOString()) : null,
        isPaid,
        recurrence,
        notes
      };

      if (editingFinance) {
        await update(editingFinance.id, payload);
      } else {
        await create(payload);
      }

      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // toast handle por useCrud
    }
  };

  const handleTogglePayment = async (f: Finance) => {
    try {
      await update(f.id, {
        isPaid: !f.isPaid,
        paidAt: !f.isPaid ? new Date().toISOString() : null
      });
      refresh();
    } catch (err) {
      // tratado
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este lançamento financeiro?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        // tratado
      }
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn font-sans">
      
      {/* Top Banner do Módulo Financeiro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#161B22] border border-[#30363D] rounded-2xl relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign size={20} />
            </span>
            <div>
              <h1 className="text-xl font-bold font-display text-[#E6EDF3] tracking-tight uppercase">DOLA FINANCIAL</h1>
              <p className="text-xs text-slate-400 font-medium">Orquestração avançada de contas, fluxos de caixa e projeção de ativos.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            onClick={() => setShowProjection(!showProjection)} 
            variant="outline" 
            className="border-[#30363D] flex items-center gap-1.5 text-xs font-semibold cursor-pointer py-1.5 px-3 rounded-xl bg-slate-900 text-indigo-400"
          >
            <Calculator size={14} />
            {showProjection ? "Ver Fluxo Geral" : "Simular Projeção"}
          </Button>

          <Button 
            onClick={() => startCreate("EXPENSE")} 
            className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 text-xs font-bold cursor-pointer py-1.5 px-3.5 rounded-xl"
          >
            <Plus size={14} />
            Lançar Despesa
          </Button>
          
          <Button 
            onClick={() => startCreate("INCOME")} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 text-xs font-bold cursor-pointer py-1.5 px-3.5 rounded-xl"
          >
            <Plus size={14} />
            Lançar Receita
          </Button>
        </div>
      </div>

      {/* Seção Inteligente de Projeção */}
      {showProjection && (
        <div className="p-6 bg-[#161B22] border border-indigo-500/20 rounded-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-sm font-bold font-display text-[#E6EDF3] uppercase tracking-wider">Simulador de Provedor Financeiro IA</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] p-1 rounded-xl">
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setProjectionDays(days)}
                  className={`text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                    projectionDays === days 
                      ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10" 
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {days} Dias
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-[#0B0F1A]/80 border border-[#30363D] p-4 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Saldo Atual Base</p>
              <h4 className="text-lg font-bold text-[#E6EDF3]">{formatMoney(projectionData.startBalance)}</h4>
            </div>
            <div className="bg-[#0B0F1A]/80 border border-[#30363D] p-4 rounded-xl">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Entradas Previstas (+ Recorrências)</p>
              <h4 className="text-lg font-bold text-emerald-400">+{formatMoney(projectionData.projectedInflow)}</h4>
            </div>
            <div className="bg-[#0B0F1A]/80 border border-[#30363D] p-4 rounded-xl">
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-1">Saídas Previstas (+ Recorrências)</p>
              <h4 className="text-lg font-bold text-rose-400">-{formatMoney(projectionData.projectedOutflow)}</h4>
            </div>
            <div className="bg-[#0B0F1A]/80 border border-indigo-500/30 p-4 rounded-xl shadow-lg ring-1 ring-indigo-500/10">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Saldo Final Projetado</p>
              <h4 className={`text-lg font-bold ${projectionData.targetBalance >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                {formatMoney(projectionData.targetBalance)}
              </h4>
            </div>
          </div>

          <div className="text-[10px] text-[#8B949E] mt-1 italic">
            *A projeção considera todas as contas a pagar/receber com vencimento no intervalo selecionado, além de multiplicar os lançamentos definidos como "Mensal" pela fração de tempo correspondente.
          </div>
        </div>
      )}

      {/* Bento Grid de Indicadores Principais de Finanças */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saldo Disponível (Líquido Clínico) */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Saldo Líquido Real</span>
              <h3 className={`text-2xl font-bold tracking-tight font-display mt-1 ${stats.saldoLiquidoAtual >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                {formatMoney(stats.saldoLiquidoAtual)}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter mt-4">
            Saldo de contas pagas e salários creditados
          </div>
        </Card>

        {/* Card 2: Contas a Receber (Pendente) */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">A Receber</span>
              <h3 className="text-2xl font-bold tracking-tight text-[#00D2FF] font-display mt-1">
                {formatMoney(stats.pendingReceivables)}
              </h3>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-[10px] text-[#00D2FF] font-bold uppercase tracking-widest mt-4">
            Pendências ativas que entrarão em breve
          </div>
        </Card>

        {/* Card 3: Contas a Pagar (Pendente) */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Contas a Pagar</span>
              <h3 className="text-2xl font-bold tracking-tight text-[#FF5252] font-display mt-1">
                {formatMoney(stats.pendingPayables)}
              </h3>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="text-[10px] text-[#FF5252] font-bold uppercase tracking-widest mt-4">
            Total em aberto vencendo
          </div>
        </Card>

        {/* Card 4: Fluxo Consolidado (Futuro Estimado) */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Evolução Mensal (Prev.)</span>
              <h3 className={`text-2xl font-bold tracking-tight font-display mt-1 ${stats.fluxoLiquidoFuturo >= 0 ? "text-indigo-400" : "text-amber-500"}`}>
                {formatMoney(stats.fluxoLiquidoFuturo)}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-4">
            Prevendo pagamentos e recebimentos pendentes
          </div>
        </Card>
      </div>

      {/* Seção Gráfica e Lançamento Direto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gráfico de Barras Customizado SVG (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border-[#30363D] bg-[#161B22] h-full flex flex-col justify-between">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">📊 FLUXO DE CAIXA MENSAL (ENTRADAS VS SAÍDAS)</CardTitle>
                <CardDescription>Comparativo real de faturamento por tipo de lançamento financeiro</CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col justify-end">
              {/* Plotador de Barras SVG */}
              <div className="w-full h-48 bg-[#0B0F1A]/40 rounded-xl border border-[#30363D] p-4 flex items-end justify-around relative">
                {/* Linhas de Grade de Fundo */}
                <div className="absolute inset-x-0 top-1/4 border-t border-slate-800/50 pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 border-t border-slate-800/50 pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 border-t border-slate-800/50 pointer-events-none" />

                {/* Barra 1: Receitas Pagas */}
                <div className="flex flex-col items-center gap-2 z-10 w-1/5 group">
                  <div className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMoney(stats.paidIncomes)}
                  </div>
                  <div 
                    className="w-8 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-md transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                    style={{ height: `${Math.max(12, Math.min(100, (stats.paidIncomes / (stats.incomesTotal || 1)) * 100)) * 1.2}px` }}
                  />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Incomes OK</span>
                </div>

                {/* Barra 2: Recebíveis Futuros */}
                <div className="flex flex-col items-center gap-2 z-10 w-1/5 group">
                  <div className="text-[10px] font-bold text-[#00D2FF] opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMoney(stats.pendingReceivables)}
                  </div>
                  <div 
                    className="w-8 bg-sky-500/80 hover:bg-sky-400 rounded-t-md transition-all shadow-lg shadow-sky-500/10 cursor-pointer"
                    style={{ height: `${Math.max(12, Math.min(100, (stats.pendingReceivables / (stats.receivablesTotal || 1)) * 100)) * 1.2}px` }}
                  />
                  <span className="text-[9px] text-[#00D2FF] font-bold uppercase tracking-wider">Recv. Pend</span>
                </div>

                {/* Barra 3: Despesas Pagas */}
                <div className="flex flex-col items-center gap-2 z-10 w-1/5 group">
                  <div className="text-[10px] font-bold text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMoney(stats.paidExpenses)}
                  </div>
                  <div 
                    className="w-8 bg-rose-500/80 hover:bg-rose-400 rounded-t-md transition-all shadow-lg shadow-rose-500/10 cursor-pointer"
                    style={{ height: `${Math.max(12, Math.min(100, (stats.paidExpenses / (stats.expensesTotal || 1)) * 100)) * 1.2}px` }}
                  />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Outflow OK</span>
                </div>

                {/* Barra 4: Contas Pendentes */}
                <div className="flex flex-col items-center gap-2 z-10 w-1/5 group">
                  <div className="text-[10px] font-bold text-[#FF5252] opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMoney(stats.pendingPayables)}
                  </div>
                  <div 
                    className="w-8 bg-[#FF5252]/80 hover:bg-[#FF5252]/100 rounded-t-md transition-all shadow-lg shadow-rose-500/10 cursor-pointer"
                    style={{ height: `${Math.max(12, Math.min(100, (stats.pendingPayables / (stats.payablesTotal || 1)) * 100)) * 1.2}px` }}
                  />
                  <span className="text-[9px] text-[#FF5252] font-bold uppercase tracking-wider">To Pay</span>
                </div>
              </div>

              <div className="mt-4 flex gap-4 text-[9px] text-slate-500 font-semibold uppercase tracking-wider justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Recebido / Pago
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Pendência / Aberto
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento de Distribuição por Categorias (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-[#30363D] bg-[#161B22] h-full flex flex-col justify-between">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-sm">🎯 DISTRIBUIÇÃO DAS DESPESAS</CardTitle>
              <CardDescription>Percentual de gastos agregados por categoria estrutural</CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-3.5 flex-1">
              {categorySummary.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Briefcase size={28} className="text-slate-600 mb-2" />
                  Nenhuma despesa ou conta cadastrada.
                </div>
              ) : (
                categorySummary.slice(0, 5).map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-2xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[cat.name] || "#8395A7" }}
                        />
                        <span className="text-[#E6EDF3]">{cat.name}</span>
                      </div>
                      <div className="text-slate-400">
                        {formatMoney(cat.value)} <span className="text-slate-500 text-[9px] font-bold">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${cat.percentage}%`, 
                          backgroundColor: CATEGORY_COLORS[cat.name] || "#8395A7" 
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Caixa de Pesquisa, Filtros e Lista de Registros */}
      <Card className="border-[#30363D] bg-[#161B22]">
        <CardHeader className="p-0 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm">🧾 DETALHAMENTO DE LANÇAMENTOS</CardTitle>
            <CardDescription>Fluxo completo de contas do usuário</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Campo de Busca */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search size={12} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título ou tag..."
                className="pl-8 pr-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors w-44"
              />
            </div>

            {/* Filtro de Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
              <option value="PAYABLE">Conta a Pagar</option>
              <option value="RECEIVABLE">Conta a Receber</option>
            </select>

            {/* Filtro de Categoria */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Todas Categorias</option>
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Filtro de Situação */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="ALL">Qualquer Situação</option>
              <option value="PAID">Pago / Recebido</option>
              <option value="PENDING">Pendente</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-indigo-400" size={16} />
              Sincronizando lançamentos financeiros...
            </div>
          ) : filteredFinances.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs">
              Nenhuma transação financeira corresponde ao filtro especificado.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#30363D]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B0F1A]/80 border-b border-[#30363D] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Lançamento</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Vencimento</th>
                    <th className="px-4 py-3">Situação</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D] text-xs">
                  {filteredFinances.map((f) => {
                    const typeLabels: Record<string, { label: string, variant: "success" | "danger" | "info" | "warning" }> = {
                      INCOME: { label: "Receita", variant: "success" },
                      EXPENSE: { label: "Despesa", variant: "danger" },
                      PAYABLE: { label: "A Pagar", variant: "warning" },
                      RECEIVABLE: { label: "A Receber", variant: "info" }
                    };

                    return (
                      <tr 
                        key={f.id} 
                        className="hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-semibold text-[#E6EDF3]">{f.title}</p>
                            {f.notes && <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{f.notes}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={typeLabels[f.type]?.variant || "primary"}>
                            {typeLabels[f.type]?.label || f.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono">
                          <span className={
                            f.type === "INCOME" || f.type === "RECEIVABLE" 
                              ? "text-emerald-400" 
                              : "text-rose-400"
                          }>
                            {f.type === "INCOME" || f.type === "RECEIVABLE" ? "+" : "-"} {formatMoney(f.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[f.category || ""] || "#8395A7" }}
                            />
                            <span className="text-[#8B949E]">{f.category || "Sem Categoria"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono">
                          {f.dueDate ? new Date(f.dueDate).toLocaleDateString("pt-BR") : "Não informado"}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleTogglePayment(f)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold leading-none cursor-pointer transition-all border ${
                              f.isPaid 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${f.isPaid ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                            {f.isPaid ? "Efetivado" : "Pendente"}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(f)}
                              className="p-1 px-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                              title="Editar Lançamento"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              className="p-1 px-2 hover:bg-rose-500/20 text-rose-500 rounded-md transition-colors cursor-pointer"
                              title="Excluir Lançamento"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal / Slide-over para Modelagem de Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn select-none p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingFinance ? "Editar Lançamento" : "Modelar Novo Lançamento"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-[#30363D] rounded transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Seletor Gráfico de Tipo */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tipo do Lançamento</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "INCOME", label: "Receita", color: "hover:bg-emerald-500/10 border-emerald-500/20 active:bg-emerald-500" },
                    { key: "EXPENSE", label: "Despesa", color: "hover:bg-rose-500/10 border-rose-500/20 active:bg-rose-500" },
                    { key: "PAYABLE", label: "A Pagar", color: "hover:bg-amber-500/10 border-amber-500/20 active:bg-amber-500" },
                    { key: "RECEIVABLE", label: "A Receber", color: "hover:bg-cyan-500/10 border-cyan-500/20 active:bg-cyan-500" }
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setType(btn.key as FinanceType)}
                      className={`py-2 text-2xs font-bold rounded-lg border cursor-pointer transition-all ${
                        type === btn.key 
                          ? "bg-indigo-600 text-white border-indigo-500" 
                          : "bg-slate-900 text-slate-400 border-[#30363D] " + btn.color
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Descrição / Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Salário Mensal, Fatura Nubank, Escola"
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Grid: Valor e Categoria */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Vencimento e Recorrência */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Data do Vencimento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 transition-colors font-mono cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Periodicidade / Recorrência</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="UNIQUE">Lançamento Único</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensal</option>
                  </select>
                </div>
              </div>

              {/* Booleano de Efetivado / Pago / Recebido */}
              <div className="flex items-center justify-between p-3 bg-[#0B0F1A] rounded-xl border border-[#30363D]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#E6EDF3] font-bold uppercase tracking-wider">Situação Consolidada</span>
                  <span className="text-[9px] text-slate-400 leading-none mt-0.5">Marcar como Pago ou Recebido agora</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                    isPaid ? "bg-emerald-600 flex justify-end" : "bg-slate-800 flex justify-start"
                  }`}
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              {/* Observações / Notas de Rodapé */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Notas de Referência</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Pago com Pix, parcelado em 3x no cartão azul"
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-xs text-[#E6EDF3] placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors h-14 resize-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="border-[#30363D] text-slate-400 hover:text-white cursor-pointer py-2 px-4 rounded-xl text-xs hover:bg-[#30363D]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-2 px-4 rounded-xl text-xs font-bold"
                >
                  {editingFinance ? "Salvar Lançamento" : "Modelar Lançamento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
