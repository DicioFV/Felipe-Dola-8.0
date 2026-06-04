// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/financial/LoansPage.tsx
// Fase: 7 — Gestão Avançada de Dívidas e Amortização
// ============================================

import React, { useState, useMemo } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Loan, LoanPayment, LoanType, LoanStatus } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Clock,
  Sparkles,
  DollarSign,
  TrendingDown,
  Percent,
  Calendar,
  Building2,
  ShieldAlert
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";

const LOAN_TYPES: Record<LoanType, { label: string; icon: string; color: string }> = {
  PESSOAL: { label: "Empréstimo Pessoal", icon: "👤", color: "#FF5252" },
  CONSIGNADO: { label: "Consignado em Folha", icon: "💼", color: "#FF9F43" },
  CARTAO_CREDITO: { label: "Cartão / Rotativo", icon: "💳", color: "#A55EEA" },
  FINANCIAMENTO_AUTO: { label: "Financiamento Veículo", icon: "🚗", color: "#54A0FF" },
  FINANCIAMENTO_IMOVEL: { label: "Financiamento Imobiliário", icon: "🏠", color: "#00D2FF" },
  CHEQUE_ESPECIAL: { label: "Cheque Especial", icon: "🚨", color: "#FF6B6B" },
  EMPRESARIAL: { label: "Crédito PJ", icon: "🏢", color: "#9F65FF" },
  OUTRO: { label: "Consórcios / Outros", icon: "🔮", color: "#8E9EAB" }
};

const LOAN_STATUS: Record<LoanStatus, { label: string; variant: "danger" | "warning" | "success" | "info" }> = {
  ACTIVE: { label: "Ativo", variant: "warning" },
  OVERDUE: { label: "Em Atraso ⚠️", variant: "danger" },
  PAID: { label: "Paga", variant: "success" },
  RENEGOCIATED: { label: "Repactuado", variant: "info" }
};

export function LoansPage() {
  const { data: loans, loading, create, update, remove, refresh } = useCrud<Loan>("/api/loans");
  
  // Controle de expandido para cronogramas
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  // Valor extra disponível para simulação do Conselheiro
  const [extraPayment, setExtraPayment] = useState<string>("500");

  // Estados de formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const [loanName, setLoanName] = useState("");
  const [loanInstitution, setInstitution] = useState("");
  const [loanType, setLoanType] = useState<LoanType>("PESSOAL");
  const [loanTotalAmount, setTotalAmount] = useState("");
  const [loanRemainingAmount, setRemainingAmount] = useState("");
  const [loanInterestRate, setInterestRate] = useState("");
  const [loanInstallmentValue, setInstallmentValue] = useState("");
  const [loanTotalInstallments, setTotalInstallments] = useState("12");
  const [loanPaidInstallments, setPaidInstallments] = useState("0");
  const [loanNotes, setNotes] = useState("");
  const [loanColor, setColor] = useState("#A55EEA");
  
  // Novas propriedades mapeadas para tipos existentes para evitar incompatibilidade
  const [loanTotalInterest, setTotalInterest] = useState(""); // guardado em penaltyAmount
  const [loanDueDay, setDueDay] = useState("10"); // guardado em earlyPaymentFee

  // Formatador monetário
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Estatísticas calculadas dinamicamente com base nas dívidas atuais
  const computedMetrics = useMemo(() => {
    const list = loans || [];
    let dTotal = 0;
    let pMensal = 0;
    let jTotalMes = 0;
    let sumWeightedRate = 0;

    list.forEach(l => {
      if (l.status !== "PAID") {
        const rem = l.remainingAmount || 0;
        const rate = l.interestRate || 0;
        const inst = l.installmentValue || 0;

        dTotal += rem;
        pMensal += inst;
        // Juros mensal estimado aproximado = saldo restante * taxa_mensal%
        const jMes = rem * (rate / 100);
        jTotalMes += jMes;
        sumWeightedRate += (rate * rem);
      }
    });

    const averageRate = dTotal > 0 ? (sumWeightedRate / dTotal) : 0;

    return {
      dTotal,
      pMensal,
      jTotalMes,
      averageRate
    };
  }, [loans]);

  // Filtros/Ordenação Avalanche (Maior taxa de juros)
  const avalancheOrderList = useMemo(() => {
    return [...(loans || [])]
      .filter(l => l.status !== "PAID")
      .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
  }, [loans]);

  // Filtros/Ordenação Snowball (Menor saldo restante)
  const snowballOrderList = useMemo(() => {
    return [...(loans || [])]
      .filter(l => l.status !== "PAID")
      .sort((a, b) => (a.remainingAmount || 0) - (b.remainingAmount || 0));
  }, [loans]);

  // Sugestões inteligentes reativas baseadas no slider/input de valor extra
  const aiInsights = useMemo(() => {
    const insights = [];
    const activeLoans = [...(loans || [])].filter(l => l.status !== "PAID");
    
    if (activeLoans.length === 0) {
      return [
        {
          type: "success",
          icon: <CheckCircle2 className="text-emerald-400 mt-0.5" size={14} />,
          text: "Parabéns! Nenhuma pendência financeira detectada. Continue poupando e investindo para blindar seu patrimônio."
        }
      ];
    }

    // Achar dívida com maior taxa
    const topInterest = [...activeLoans].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
    // Achar dívida com menor saldo
    const topSnowball = [...activeLoans].sort((a, b) => (a.remainingAmount || 0) - (b.remainingAmount || 0))[0];

    // Juros críticos (> 10%)
    if (topInterest && topInterest.interestRate > 10) {
      insights.push({
        type: "critical",
        icon: <ShieldAlert className="text-rose-400 mt-0.5 animate-pulse" size={15} />,
        text: `🚨 PRIORIDADE MÁXIMA: Quite primeiro ${topInterest.name} - juros acima de 10% ao mês são extremamente nocivos!`
      });
    }

    // Recomendação Avalanche
    if (topInterest) {
      insights.push({
        type: "avalanche",
        icon: <Sparkles className="text-indigo-400 mt-0.5" size={14} />,
        text: `📊 Método Avalanche: Foque recursos adicionais na dívida ${topInterest.name} (${topInterest.interestRate}% a.m.) para obter a maior economia financeira global.`
      });
    }

    // Recomendações de economia extras
    const extraVal = parseFloat(extraPayment) || 0;
    if (extraVal > 0 && topInterest) {
      const estimatedSaving = extraVal * (topInterest.interestRate / 100) * 12;
      insights.push({
        type: "saving",
        icon: <TrendingDown className="text-emerald-400 mt-0.5" size={14} />,
        text: `💸 Destinando R$ ${extraVal.toLocaleString("pt-BR")} extras mensais para o/a ${topInterest.name}, você poupará aproximadamente ${formatMoney(estimatedSaving)} de juros puros ao ano!`
      });
    }

    // Alerta de Portabilidade
    insights.push({
      type: "portability",
      icon: <Info className="text-sky-400 mt-0.5" size={14} />,
      text: `💡 Você está pagando ${formatMoney(computedMetrics.jTotalMes)} sob regime de juros simples mensalmente. Considere portabilidade de crédito para as taxas de menor exposição.`
    });

    // Dica Geral
    insights.push({
      type: "general",
      icon: <CheckCircle2 className="text-slate-400 mt-0.5" size={14} />,
      text: "✅ Estratégia de consistência: Pague as prestações mínimas em todos os compromissos contratuais e direcione todo o capital excedente para uma única dívida escolhida."
    });

    return insights;
  }, [loans, computedMetrics, extraPayment]);

  const handleOpenFormModal = (loan?: Loan) => {
    if (loan) {
      setEditingLoan(loan);
      setLoanName(loan.name);
      setInstitution(loan.institution || "");
      setLoanType(loan.type);
      setTotalAmount(String(loan.totalAmount));
      setRemainingAmount(String(loan.remainingAmount));
      setInterestRate(String(loan.interestRate));
      setInstallmentValue(String(loan.installmentValue || ""));
      setTotalInstallments(String(loan.totalInstallments));
      setPaidInstallments(String(loan.paidInstallments));
      setNotes(loan.notes || "");
      setColor(loan.color || "#A55EEA");
      setTotalInterest(String(loan.penaltyAmount || ""));
      setDueDay(String(loan.earlyPaymentFee || "10"));
    } else {
      setEditingLoan(null);
      setLoanName("");
      setInstitution("Bradesco");
      setLoanType("CARTAO_CREDITO");
      setTotalAmount("5000");
      setRemainingAmount("5000");
      setInterestRate("1.9");
      setInstallmentValue("");
      setTotalInstallments("12");
      setPaidInstallments("0");
      setNotes("");
      setColor("#A55EEA");
      setTotalInterest("");
      setDueDay("10");
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName || !loanTotalAmount) return;

    const parsedTotalAmount = parseFloat(loanTotalAmount) || 0;
    const parsedRemainingAmount = parseFloat(loanRemainingAmount) || parsedTotalAmount;
    const parsedInterest = parseFloat(loanInterestRate) || 0;
    const parsedInstallments = parseInt(loanTotalInstallments) || 12;
    const parsedPaid = parseInt(loanPaidInstallments) || 0;

    // Calcular parcelamento automático simples se não fornecido
    const autoInstallmentValue = parseFloat(loanInstallmentValue) || 
      Math.round(((parsedTotalAmount + (parsedTotalAmount * (parsedInterest / 100) * parsedInstallments)) / parsedInstallments) * 100) / 100;

    const payload = {
      name: loanName,
      institution: loanInstitution,
      type: loanType,
      totalAmount: parsedTotalAmount,
      remainingAmount: parsedRemainingAmount,
      interestRate: parsedInterest,
      installmentValue: autoInstallmentValue,
      totalInstallments: parsedInstallments,
      paidInstallments: parsedPaid,
      notes: loanNotes,
      color: loanColor,
      penaltyAmount: parseFloat(loanTotalInterest) || Math.round(parsedRemainingAmount * (parsedInterest / 100) * parsedInstallments), // guardado em penaltyAmount
      earlyPaymentFee: parseInt(loanDueDay) || 10, // guardado em earlyPaymentFee
      status: parsedRemainingAmount <= 0 ? "PAID" as LoanStatus : "ACTIVE" as LoanStatus
    };

    try {
      if (editingLoan) {
        await update(editingLoan.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      console.error("Erro no envio do form de empréstimo:", err);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (confirm("Deseja realmente remover esta dívida do sistema?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        console.error("Erro ao deletar dívida:", err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans select-none text-[#E6EDF3] pb-12">
      
      {/* Banner / Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#161B22] border border-[#30363D] rounded-2xl relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-3">
          <span className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Calculator size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight flex items-center gap-1">
              <span>📟 Gestor de Dívidas</span>
            </h1>
            <p className="text-2xs text-slate-400 font-medium">Estratégias avançadas, amortização simulada por inteligência e quitamento acelerado.</p>
          </div>
        </div>

        <Button 
          onClick={() => handleOpenFormModal()}
          className="bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 text-2xs font-bold cursor-pointer py-2 px-4 rounded-xl border-none transition shadow"
        >
          <Plus size={14} />
          Nova Dívida
        </Button>
      </div>

      {/* Bento Grid Indicadores de Dívidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dívida Total */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Dívida Total</span>
              <h3 className="text-xl font-bold tracking-tight font-display text-rose-500 mt-1">
                {formatMoney(computedMetrics.dTotal)}
              </h3>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-4 flex items-center gap-1">
            <span>📉 Saldo acumulado sob desconto</span>
          </p>
        </Card>

        {/* Card 2: Parcela Mensal */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Parcela Mensal</span>
              <h3 className="text-xl font-bold tracking-tight font-display text-amber-500 mt-1">
                {formatMoney(computedMetrics.pMensal)}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-4">
            🎯 Compromisso contratual mensal
          </p>
        </Card>

        {/* Card 3: Juros/Mês */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Juros / Mês</span>
              <h3 className="text-xl font-bold tracking-tight font-display text-purple-400 mt-1">
                {formatMoney(computedMetrics.jTotalMes)}
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-4">
            ⚠️ Encargos que corroem seu patrimônio
          </p>
        </Card>

        {/* Card 4: Taxa Média */}
        <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Taxa Média a.m.</span>
              <h3 className="text-xl font-bold tracking-tight font-display text-indigo-400 mt-1">
                {computedMetrics.averageRate.toFixed(1)}% a.m.
              </h3>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Percent size={16} />
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-4">
            ⚡ Média ponderada pela exposição
          </p>
        </Card>
      </div>

      {/* Seção Comparativa e DOLA AI Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Comparativo de Dívidas & Simulador (7 de 12 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Comparativo Horizontal */}
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">📊 Comparativo de Dívidas</CardTitle>
              <CardDescription>Relação de montante devedor e custos associados</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {(!loans || loans.filter(l => l.status !== "PAID").length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">
                  Nenhuma dívida crítica ativa para comparação gráfica.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {[...(loans || [])].filter(l => l.status !== "PAID").map((loan) => {
                    const pct = computedMetrics.dTotal > 0 ? (loan.remainingAmount / computedMetrics.dTotal) * 100 : 0;
                    // Cor do juros conforme percentual
                    const isHigh = loan.interestRate > 10;
                    const isMedium = loan.interestRate >= 3 && loan.interestRate <= 10;
                    const dotColor = isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500";
                    const barColor = isHigh ? "bg-gradient-to-r from-rose-500 to-rose-600" : isMedium ? "bg-gradient-to-r from-amber-500 to-amber-600" : "bg-gradient-to-r from-emerald-500 to-emerald-600";
                    
                    return (
                      <div key={loan.id} className="space-y-1">
                        <div className="flex justify-between items-center text-2xs font-bold leading-none">
                          <span className="text-[#E6EDF3] flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            {loan.name} <span className="text-slate-500 text-[10px] font-normal">({loan.institution})</span>
                          </span>
                          <span className="font-mono text-slate-400">
                            {formatMoney(loan.remainingAmount)} <span className="text-[10px] font-medium" style={{ color: loan.color }}>({loan.interestRate}% a.m.)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#0D1117] h-2.5 rounded-full overflow-hidden border border-[#30363D]">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                      🔴 Juros &gt; 10%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                      🟡 Juros 3% - 10%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      🟢 Juros &lt; 3%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conselheiro Inteligente Dola AI */}
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#00D2FF]" />
                  💡 Conselheiro Financeiro DOLA AI
                </CardTitle>
                <CardDescription>Indicações de amortização reativas em tempo real</CardDescription>
              </div>

              {/* Input valor extra */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valor Extra:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-2xs font-bold font-mono">R$</span>
                  <input 
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="Ex: 500"
                    className="bg-[#0B0F1A] border border-[#30363D] focus:border-purple-500 text-slate-300 rounded-lg text-2xs font-bold pl-7 pr-2.5 py-1.5 w-24 outline-none font-mono"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {aiInsights.map((insight, idx) => {
                  let borderClass = "border-[#30363D] bg-[#0B0F1A]/50";
                  if (insight.type === "critical") borderClass = "border-rose-500/25 bg-rose-500/[0.02]";
                  if (insight.type === "saving") borderClass = "border-emerald-500/25 bg-emerald-500/[0.02]";
                  if (insight.type === "avalanche") borderClass = "border-purple-500/20 bg-purple-500/[0.02]";

                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 border rounded-xl flex items-start gap-2.5 transition text-[11px] leading-relaxed text-slate-300 ${borderClass}`}
                    >
                      {insight.icon}
                      <span className="flex-1 font-medium">{insight.text}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ordem Avançada Avalanche / Snowball (5 de 12 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Métodos de Liquidação Planar */}
          <Card className="border-[#30363D] bg-[#161B22] p-5 h-full flex flex-col justify-between">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" />
                DOLA AI • Simulação de Estratégias
              </CardTitle>
              <CardDescription>Siga o método que melhor se encaixa com o seu momento mental e financeiro</CardDescription>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Avalanche */}
              <div className="space-y-3 bg-[#0B0F1A]/40 border border-[#30363D] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <span className="text-2xs font-bold text-rose-400 uppercase tracking-wide">🔻 Avalanche (Taxa)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">Foco em liquidar os maiores juros para poupar dinheiro no longo prazo.</p>
                </div>

                <div className="space-y-2 mt-4 flex-1">
                  {avalancheOrderList.length === 0 ? (
                    <div className="text-[10px] text-slate-500 italic">Sem dívidas ativas.</div>
                  ) : (
                    avalancheOrderList.map((loan, i) => (
                      <div key={loan.id} className="flex justify-between items-center text-[10px] leading-tight font-medium p-1.5 bg-[#161B22]/50 border border-slate-800 rounded-lg">
                        <span className="text-slate-300 truncate max-w-[80px]">#{i+1} {loan.name}</span>
                        <Badge className="bg-rose-500/10 text-rose-400 text-[9px] font-mono leading-none border-none py-0.5 px-1.5">{loan.interestRate}% a.m.</Badge>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-[9px] text-[#00D2FF] font-bold uppercase tracking-wider mt-4 bg-cyan-500/5 p-1.5 rounded border border-cyan-500/10 text-center">
                  Economia Matemática Máxima
                </div>
              </div>

              {/* Snowball */}
              <div className="space-y-3 bg-[#0B0F1A]/40 border border-[#30363D] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <span className="text-2xs font-bold text-emerald-400 uppercase tracking-wide">🔺 Snowball (Saldo)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">Foco no menor saldo devedor para obter alívio psicológico rápido.</p>
                </div>

                <div className="space-y-2 mt-4 flex-1">
                  {snowballOrderList.length === 0 ? (
                    <div className="text-[10px] text-slate-500 italic">Sem dívidas ativas.</div>
                  ) : (
                    snowballOrderList.map((loan, i) => (
                      <div key={loan.id} className="flex justify-between items-center text-[10px] leading-tight font-medium p-1.5 bg-[#161B22]/50 border border-slate-800 rounded-lg">
                        <span className="text-slate-300 truncate max-w-[80px]">#{i+1} {loan.name}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono leading-none border-none py-0.5 px-1.5">{formatMoney(loan.remainingAmount)}</Badge>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mt-4 bg-purple-500/5 p-1.5 rounded border border-purple-500/10 text-center">
                  Foco na Motivação e Fôlego
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Tabela "Suas Dívidas" no final do layout */}
      <Card className="border-[#30363D] bg-[#161B22] p-5">
        <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">📋 Suas Dívidas Ativas e Financiamentos</CardTitle>
            <CardDescription>Sincronização cadastral segura, histórico e amortização programada</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Sincronizando contratos de dívidas...</div>
          ) : !loans || loans.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500 italic border border-dashed border-[#30363D] rounded-2xl">
              Nenhum débito ou financiamento cadastrado. Clique em "Nova Dívida" para modelar seu primeiro contrato!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-2xs md:text-xs">
                <thead>
                  <tr className="border-b border-[#30363D] text-[#8B949E] uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Dívida</th>
                    <th className="py-3 px-4">Saldo Devedor</th>
                    <th className="py-3 px-4 text-center">Taxa Juros</th>
                    <th className="py-3 px-4 text-right">Prestações</th>
                    <th className="py-3 px-4 text-center">Meses p/ Quitar</th>
                    <th className="py-3 px-4 text-right">Total Juros Estimativo</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/60">
                  {loans.map((loan) => {
                    const isExpanded = expandedLoanId === loan.id;
                    const typeDetails = LOAN_TYPES[loan.type] || { label: "Outro", icon: "📁", color: "#8E9EAB" };
                    const hasPayments = loan.payments && loan.payments.length > 0;
                    
                    // calculos
                    const rem = loan.remainingAmount || 0;
                    const inst = loan.installmentValue || 0;
                    const monthsLeft = inst > 0 ? Math.ceil(rem / inst) : 1;
                    
                    // juros acumulado prévio salvo em penaltyAmount
                    const jurosTotal = loan.penaltyAmount || (loan.totalAmount * (loan.interestRate / 100) * loan.totalInstallments);

                    // Dia de vencimento salvo em earlyPaymentFee
                    const dueDay = loan.earlyPaymentFee || 10;

                    return (
                      <React.Fragment key={loan.id}>
                        <tr className="hover:bg-[#161B22]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                style={{ backgroundColor: `${loan.color}15`, color: loan.color }}
                              >
                                {typeDetails.icon}
                              </span>
                              <div>
                                <p className="font-bold text-[#E6EDF3] flex items-center gap-1.5">
                                  {loan.name} 
                                  <span className="text-[10px] font-normal text-slate-500">({loan.institution})</span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                                  <Calendar size={10} className="text-slate-500" />
                                  Vence dia {dueDay}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-rose-500">
                            {formatMoney(rem)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                              style={{ backgroundColor: `${loan.color}15`, color: loan.color }}
                            >
                              {loan.interestRate}% a.m.
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-semibold text-amber-500 text-[11px]">
                            {formatMoney(inst)}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-300">
                            {monthsLeft} meses
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-semibold text-indigo-400">
                            {formatMoney(jurosTotal)}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {hasPayments && (
                                <button
                                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                                  className="p-1 px-1.5 bg-slate-800 text-slate-400 hover:text-white rounded transition text-[10px] font-medium flex items-center gap-0.5 cursor-pointer"
                                  title="Expandir parcelas"
                                >
                                  <span>{isExpanded ? "Ocultar" : "Parcelas"}</span>
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenFormModal(loan)}
                                className="p-1 text-[#00D2FF] hover:bg-cyan-500/10 rounded transition cursor-pointer"
                                title="Editar Dívida"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteLoan(loan.id)}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                title="Remover Dívida"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Dropdown de parcelamento simplificado se expandido */}
                        {isExpanded && hasPayments && (
                          <tr>
                            <td colSpan={7} className="bg-[#0B0F1A]/50 p-4 border-l-2 border-purple-500">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <Calendar size={11} /> Cronograma de Amortização de Contrato • {loan.name}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pb-1.5">
                                  {loan.payments?.map((payment: any, pIdx: number) => (
                                    <div 
                                      key={payment.id} 
                                      className={`p-2 border rounded-lg text-center transition font-mono ${
                                        payment.isPaid 
                                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                                          : "bg-[#161B22] border-slate-800 text-slate-400"
                                      }`}
                                    >
                                      <p className="text-[9px] font-bold">Parc #{payment.installmentNum}</p>
                                      <p className="text-[11px] font-bold mt-1 leading-none">{formatMoney(payment.scheduledAmount)}</p>
                                      <p className="text-[8px] text-slate-500 font-medium mt-1 uppercase">{payment.isPaid ? "Quitada ✔️" : `Dia ${payment.dueDate.split("-")[2]}`}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Criar/Editar Dívida */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
              <h2 className="text-xs font-bold font-display text-[#E6EDF3] tracking-tight uppercase flex items-center gap-1.5">
                <Calculator size={14} className="text-purple-400" />
                {editingLoan ? "Sincronizar Crédito Existente" : "Cadastrar Nova Operação Devedora"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-[#30363D] rounded transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Nome do Contrato</label>
                  <input
                    type="text"
                    required
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    placeholder="Ex: Cartão Nubank"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Credor / Banco</label>
                  <input
                    type="text"
                    required
                    value={loanInstitution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex: Nubank, Caixa"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Tipo de Operação</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as LoanType)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] cursor-pointer outline-none"
                  >
                    {Object.entries(LOAN_TYPES).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Cor Visual</label>
                  <input
                    type="color"
                    value={loanColor}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-7 bg-[#0B0F1A] border border-[#30363D] rounded-xl cursor-pointer p-0.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Saldo Devedor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={loanRemainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                    placeholder="Ex: 3500.00"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Taxa Juros Mensal (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={loanInterestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Ex: 1.5"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Valor de cada Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={loanInstallmentValue}
                    onChange={(e) => setInstallmentValue(e.target.value)}
                    placeholder="Calculado automático se vazio"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Dia de Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={loanDueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Total de Parcelas Contratadas</label>
                  <input
                    type="number"
                    required
                    value={loanTotalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Total Juros Estimado Pagos (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={loanTotalInterest}
                    onChange={(e) => setTotalInterest(e.target.value)}
                    placeholder="Ex: 11500"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Detalhamento Geral & Observações</label>
                <textarea
                  value={loanNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Renegociações previstas, amortizações extras necessárias..."
                  className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] h-12 h-14 resize-none outline-none"
                />
              </div>

              {/* Também repassar o total original invisivelmente */}
              <input type="hidden" value={loanTotalAmount} />

              <div className="flex justify-end gap-2.5 pt-2.5">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="border-[#30363D] text-slate-400 hover:text-white cursor-pointer py-1.5 px-4 rounded-xl text-2xs hover:bg-[#30363D]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white cursor-pointer py-1.5 px-4 rounded-xl text-2xs font-bold font-sans border-none transition shadow"
                >
                  Salvar Dívida
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
