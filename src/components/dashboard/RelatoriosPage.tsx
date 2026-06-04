// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/RelatoriosPage.tsx
// Fase: 6 — Inteligência Executiva Central
// ============================================

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, CheckSquare, Dumbbell, Award, Landmark, RefreshCw } from "lucide-react";

interface FinancialItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
}

interface InvestmentItem {
  id: string;
  name: string;
  currentValue: number;
  category: string;
}

interface LoanItem {
  id: string;
  name: string;
  remainingAmount: number;
}

interface TaskItem {
  id: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

export function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    income: 0,
    expenses: 0,
    totalInvested: 0,
    totalLoans: 0,
    tasksCount: 0,
    completedTasks: 0,
    habitsStreak: 0
  });

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resFinances, resInvestments, resLoans, resTasks, resHabits] = await Promise.all([
        fetch("/api/finances", { headers }).then(r => r.json()),
        fetch("/api/investments", { headers }).then(r => r.json()),
        fetch("/api/loans", { headers }).then(r => r.json()),
        fetch("/api/tasks", { headers }).then(r => r.json()),
        fetch("/api/habits", { headers }).then(r => r.json())
      ]);

      const income = Array.isArray(resFinances)
        ? resFinances.filter((f: FinancialItem) => f.type === "INCOME").reduce((acc, cur) => acc + cur.amount, 0)
        : 0;
      const expenses = Array.isArray(resFinances)
        ? resFinances.filter((f: FinancialItem) => f.type === "EXPENSE").reduce((acc, cur) => acc + cur.amount, 0)
        : 0;

      const totalInvested = Array.isArray(resInvestments)
        ? resInvestments.reduce((acc, cur: InvestmentItem) => acc + cur.currentValue, 0)
        : 0;

      const totalLoans = Array.isArray(resLoans)
        ? resLoans.reduce((acc, cur: LoanItem) => acc + cur.remainingAmount, 0)
        : 0;

      const tasksCount = Array.isArray(resTasks) ? resTasks.length : 0;
      const completedTasks = Array.isArray(resTasks) ? resTasks.filter((t: TaskItem) => t.status === "DONE").length : 0;

      const habitsStreak = Array.isArray(resHabits)
        ? resHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0)
        : 0;

      setData({
        income,
        expenses,
        totalInvested,
        totalLoans,
        tasksCount,
        completedTasks,
        habitsStreak
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const tasksCompletionRate = data.tasksCount > 0 ? Math.round((data.completedTasks / data.tasksCount) * 100) : 0;
  const financialBalance = data.income - data.expenses;
  const savingsRate = data.income > 0 ? Math.round((financialBalance / data.income) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-[300px]">
        <RefreshCw className="animate-spin text-indigo-500 mb-3" size={32} />
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold font-display">Calculando métricas analíticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      {/* Header section */}
      <div>
        <h1 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2 font-display uppercase tracking-tight">
          <BarChart3 className="text-indigo-400" size={16} /> Relatórios & Performance Central
        </h1>
        <p className="text-[10px] text-slate-400 mt-1">Análise agregada de saúde orçamentária e nível estratégico de produtividade do usuário ativo.</p>
      </div>

      {/* Grid Overview Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Index Card */}
        <div className="p-5 bg-[#161B22]/40 border border-[#30363D] hover:border-indigo-500/40 rounded-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capacidade Financeira</span>
            <TrendingUp size={15} className="text-indigo-400" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-bold text-emerald-400">R$ {financialBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
            <p className="text-[10px] text-slate-400 mt-1">Gordura Operacional Líquida</p>
          </div>
          {/* Progress balance bar */}
          <div className="mt-4 h-1.5 w-full bg-[#0B0F1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono">
            <span>Taxa Poupança: {savingsRate}%</span>
            <span>Estável</span>
          </div>
        </div>

        {/* Productive Performance Score */}
        <div className="p-5 bg-[#161B22]/40 border border-[#30363D] hover:border-[#20BF6B]/40 rounded-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Productivity Score</span>
            <CheckSquare size={15} className="text-[#20BF6B]" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-bold text-white">{tasksCompletionRate}%</h2>
            <p className="text-[10px] text-slate-400 mt-1">{data.completedTasks} / {data.tasksCount} Tarefas Sincronizadas</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#0B0F1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${tasksCompletionRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono">
            <span>Metas Líquidas</span>
            <span>Excelente</span>
          </div>
        </div>

        {/* Discipline / Streaks */}
        <div className="p-5 bg-[#161B22]/40 border border-[#30363D] hover:border-amber-500/40 rounded-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Autodisciplina</span>
            <Dumbbell size={15} className="text-amber-500" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-bold text-amber-400">{data.habitsStreak} dias</h2>
            <p className="text-[10px] text-slate-400 mt-1">Maior Streak de Hábitos</p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-[#0B0F1A] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${Math.min(100, (data.habitsStreak / 30) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-mono">
            <span>Meta: 30 dias</span>
            <span>Foco Operacional</span>
          </div>
        </div>
      </div>

      {/* Visual charts bento area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wealth Ratio Matrix */}
        <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display mb-4">Mapeamento de Equilíbrio Patrimonial</h3>
          
          <div className="space-y-4">
            {/* Liquidity scale */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300">Investimentos Totais</span>
                <span className="font-mono text-indigo-400">R$ {data.totalInvested.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-2 w-full bg-[#0B0F1A] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data.totalInvested > 0 ? 100 : 0}%` }} />
              </div>
            </div>

            {/* Loans scale */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300">Exposição ao Crédito (Financiamentos)</span>
                <span className="font-mono text-rose-400">R$ {data.totalLoans.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-2 w-full bg-[#0B0F1A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${data.totalInvested + data.totalLoans > 0 ? (data.totalLoans / (data.totalInvested + data.totalLoans)) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Income budget scale */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300">Budget Mensal Usado</span>
                <span className="font-mono text-amber-400">R$ {data.expenses.toLocaleString("pt-BR")} / R$ {data.income.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-2 w-full bg-[#0B0F1A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${data.income > 0 ? Math.min(100, (data.expenses / data.income) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl mt-5 text-[10px] text-slate-400 leading-relaxed flex items-center gap-2.5">
            <Award className="text-amber-500 shrink-0" size={16} />
            <span>
              {data.totalLoans > data.totalInvested
                ? "Atenção: Sua exposição de dívida supera os ativos líquidos investidos. Foque em aportes estratégicos em Tesouro ou Ações de Baixo Risco."
                : "Excelente: Seus ativos investidos cobrem com folga suas pendências financeiras concessionárias em andamento. Continue escalando."}
            </span>
          </div>
        </div>

        {/* Dynamic Vector/SVG Representation to mimic live dynamic charts */}
        <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display mb-2">Monitoramento de Consistência Semanal</h3>
          
          <div className="flex-1 flex items-end justify-between h-36 px-4 pt-6 pb-2">
            {[
              { day: "Seg", value: 30 },
              { day: "Ter", value: 45 },
              { day: "Qua", value: 75 },
              { day: "Qui", value: 60 },
              { day: "Sex", value: 90 },
              { day: "Sáb", value: 40 },
              { day: "Dom", value: 85 }
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="w-6 bg-[#0B0F1A] h-28 rounded-md flex items-end overflow-hidden relative border border-[#30363D]/40">
                  <div
                    className="w-full bg-indigo-600 group-hover:bg-indigo-500 transition-all duration-300 rounded-t-sm"
                    style={{ height: `${col.value}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-bold uppercase">{col.day}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 text-center font-semibold mt-3">Indicador Operacional de Checklist de Hábitos & Tarefas Semanal</p>
        </div>
      </div>
    </div>
  );
}
