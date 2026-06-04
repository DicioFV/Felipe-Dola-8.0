// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/financial/InvestmentsPage.tsx
// Fase: 7 — Otimização Patrimonial e Renda Fixa
// ============================================

import React, { useState, useMemo } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Investment, InvestmentGoal, InvestmentType, InvestorProfile, RiskLevel } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Target, 
  ShieldCheck, 
  PlusCircle, 
  X, 
  Info,
  Layers, 
  ArrowRight,
  TrendingUp as TrendingUpIcon,
  HelpCircle,
  Clock,
  ExternalLink,
  BookOpen,
  PieChart,
  DollarSign
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";

const INVESTMENT_TYPES: Record<InvestmentType, { label: string; color: string; icon: string }> = {
  RENDA_FIXA: { label: "Renda Fixa", color: "#4F46E5", icon: "🪙" },
  RENDA_VARIAVEL: { label: "Ações & FIIs", color: "#00E676", icon: "📈" },
  FUNDOS: { label: "Fundos", color: "#00D2FF", icon: "🧱" },
  CRIPTOMOEDAS: { label: "Web3 & Crypto", color: "#FFA100", icon: "⚡" },
  IMOVEIS: { label: "Crédito Imobiliário", color: "#FF5252", icon: "🏢" },
  PREVIDENCIA: { label: "Previdência", color: "#A55EEA", icon: "🛡️" },
  POUPANCA: { label: "Poupança", color: "#95A5A6", icon: "🏦" },
  OUTRO: { label: "Alternativos", color: "#F1C40F", icon: "🔮" }
};

const RISK_LABELS: Record<RiskLevel, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  BAIXO: { label: "Baixo Risco", variant: "success" },
  MEDIO: { label: "Risco Moderado", variant: "info" },
  ALTO: { label: "Alto Risco", variant: "warning" },
  MUITO_ALTO: { label: "Risco Crítico", variant: "danger" }
};

export function InvestmentsPage() {
  const { data: investments, loading: loadingInv, create: createInv, update: updateInv, remove: removeInv, refresh: refreshInv } = useCrud<Investment>("/api/investments");
  const { data: goals, loading: loadingGoals, create: createGoal, update: updateGoal, remove: removeGoal, refresh: refreshGoals } = useCrud<InvestmentGoal>("/api/investment-goals");

  // Estado de Tab Geral
  const [generalTab, setGeneralTab] = useState<"CENTRAL" | "METAS">("CENTRAL");
  // Filtro de ativos Recomendados ou Todos
  const [activeTypeTab, setActiveTypeTab] = useState<"TODOS" | "RENDA_FIXA" | "RENDA_VARIAVEL">("TODOS");

  // Estado para o Cenário Macroeconômico (Brasil e Mundial)
  const [activeScenario, setActiveScenario] = useState<"SELIC_ALTA" | "SELIC_QUEDA" | "INFLACAO_GLOBAL" | "CRISE_SISTEMICA">("SELIC_ALTA");

  // Estado para busca e ordenação na tabela "Todos os Investimentos"
  const [tableSearch, setTableSearch] = useState("");
  const [tableSortBy, setTableSortBy] = useState<"NAME" | "BALANCE" | "RETURN" | "RISK">("NAME");
  const [portfolioViewMode, setPortfolioViewMode] = useState<"GRID" | "TABLE">("TABLE");

  // Estado para o Simulador de Investimentos
  const [simMonthlyContribution, setSimMonthlyContribution] = useState<number>(1000);
  const [simYears, setSimYears] = useState<number>(10);

  // Estados de Entrada para Ativos personalizados
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [invName, setInvName] = useState("");
  const [invType, setInvType] = useState<InvestmentType>("RENDA_FIXA");
  const [invProfile, setInvProfile] = useState<InvestorProfile>("MODERADO");
  const [invInstitution, setInvInstitution] = useState("");
  const [invInitialAmount, setInvInitialAmount] = useState("");
  const [invCurrentAmount, setInvCurrentAmount] = useState("");
  const [invMonthlyDeposit, setInvMonthlyDeposit] = useState("");
  const [invExpectedReturn, setInvExpectedReturn] = useState("");
  const [invRiskLevel, setInvRiskLevel] = useState<RiskLevel>("MEDIO");
  const [invNotes, setInvNotes] = useState("");
  const [invColor, setInvColor] = useState("#4F46E5");

  // Transação Rápida no Ativo (Aporte / Retirada)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedInvForTx, setSelectedInvForTx] = useState<Investment | null>(null);
  const [txType, setTxType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [txAmount, setTxAmount] = useState("");
  const [txNotes, setTxNotes] = useState("");

  // Estados para Metas
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<InvestmentGoal | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalCurrentAmount, setGoalCurrentAmount] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalColor, setGoalColor] = useState("#00D2FF");

  // Formatador monetário
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Investimentos recomendados em tempo real atualizados conforme cenário financeiro brasileiro e mundial (Image 6)
  const recommendedFixedIncome = useMemo(() => {
    if (activeScenario === "SELIC_ALTA") {
      return [
        {
          id: "rec-tesouro-selic",
          name: "Tesouro Selic 2029",
          category: "Tesouro Direto",
          rate: "10.75% a.a.",
          rateVal: 10.75,
          risk: "BAIXO" as RiskLevel,
          delay: "D+0",
          notes: "Reserva imediata. Taxas altas garantem rentabilidade pura com risco soberano.",
          min: 30.00,
          isFreeTax: false
        },
        {
          id: "rec-cdb-120",
          name: "CDB Credi-Banc 120% CDI",
          category: "CDB Daycoval",
          rate: "12.78% a.a.",
          rateVal: 12.78,
          risk: "BAIXO" as RiskLevel,
          delay: "2 anos",
          notes: "Maior retorno atrelado à liquidez no vencimento de 24 meses sob FGC.",
          min: 1000.00,
          isFreeTax: false
        },
        {
          id: "rec-lci-lca",
          name: "LCI/LCA Banco Inter",
          category: "Letra Crédito",
          rate: "9.90% a.a. (Isento)",
          rateVal: 9.90,
          risk: "BAIXO" as RiskLevel,
          delay: "90 dias",
          notes: "Isenção total de IR. Rentabilidade líquida real equivalente a ~11.8% de CDB comum.",
          min: 500.00,
          isFreeTax: true
        },
        {
          id: "rec-cri-cra",
          name: "CRI Agro-Securitizadora",
          category: "Securitização",
          rate: "12.65% a.a.",
          rateVal: 12.65,
          risk: "MEDIO" as RiskLevel,
          delay: "5 anos",
          notes: "Lastreado em recebíveis de altíssimo rendimento isento para diversificação robusta.",
          min: 1000.00,
          isFreeTax: true
        }
      ];
    }
    
    if (activeScenario === "SELIC_QUEDA") {
      return [
        {
          id: "rec-tesouro-pref",
          name: "Tesouro Prefixado 2027",
          category: "Tesouro Direto",
          rate: "12.50% a.a.",
          rateVal: 12.50,
          risk: "BAIXO" as RiskLevel,
          delay: "90 dias+",
          notes: "Rentabilidade prefixada travada antes da queda dos juros. Excelente ganho de marcação a mercado.",
          min: 100.00,
          isFreeTax: false
        },
        {
          id: "rec-deb-inc",
          name: "Debêntures Incentivadas Vale",
          category: "Crédito Privado",
          rate: "11.50% a.a.",
          rateVal: 11.50,
          risk: "MEDIO" as RiskLevel,
          delay: "6 anos",
          notes: "Isento de IPCA. Emissões securitárias de infraestrutura robusta de longo prazo.",
          min: 1000.00,
          isFreeTax: true
        },
        {
          id: "rec-fiis",
          name: "FII MXRF11 - Papéis",
          category: "Fundos Imobiliários",
          rate: "13.20% a.a. (Dividends)",
          rateVal: 13.20,
          risk: "MEDIO" as RiskLevel,
          delay: "D+2 (Trade)",
          notes: "Dividendos mensais isentos. Queda dos juros valoriza as cotas físicas na bolsa de valores.",
          min: 100.00,
          isFreeTax: true
        },
        {
          id: "rec-lca-pref",
          name: "LCA Prefixada Daycoval",
          category: "Letra Crédito",
          rate: "10.40% a.a. (Isento)",
          rateVal: 10.40,
          risk: "BAIXO" as RiskLevel,
          delay: "1 ano",
          notes: "Retorno isento garantido prefixado. Ideal para assegurar ganhos de 2 dígitos com segurança total.",
          min: 2000.00,
          isFreeTax: true
        }
      ];
    }

    if (activeScenario === "INFLACAO_GLOBAL") {
      return [
        {
          id: "rec-tesouro-ipca",
          name: "Tesouro IPCA+ 2029",
          category: "Tesouro Direto",
          rate: "IPCA + 6.55% a.a.",
          rateVal: 11.05,
          risk: "BAIXO" as RiskLevel,
          delay: "2-3 anos",
          notes: "Proteção máxima contra inflação local. Rendimento garantido acima do índice IPCA oficial.",
          min: 50.00,
          isFreeTax: false
        },
        {
          id: "rec-cra-ipca",
          name: "CRA IPCA+ Minerva",
          category: "Crédito Privado",
          rate: "IPCA + 7.20% (Isento)",
          rateVal: 11.70,
          risk: "MEDIO" as RiskLevel,
          delay: "3 anos",
          notes: "Retorno líquido isento blindado contra a inflação com prêmio real robusto corporativo.",
          min: 1000.00,
          isFreeTax: true
        },
        {
          id: "rec-lci-ipca",
          name: "LCI IPCA+ Caixa Econômica",
          category: "Letra Crédito",
          rate: "IPCA + 5.80% a.a.",
          rateVal: 10.30,
          risk: "BAIXO" as RiskLevel,
          delay: "90 dias",
          notes: "Garantia FGC de liquidez curta combinada com indexação de proteção de poder de compra.",
          min: 1000.00,
          isFreeTax: true
        },
        {
          id: "rec-fiis-tijolo",
          name: "FII KNPRI11 - Tijolo Logístico",
          category: "Fundos Imobiliários",
          rate: "11.85% a.a.",
          rateVal: 11.85,
          risk: "MEDIO" as RiskLevel,
          delay: "D+2",
          notes: "Contratos de aluguel corrigidos anualmente pela inflação garantem reajuste real dos ativos.",
          min: 500.00,
          isFreeTax: true
        }
      ];
    }

    // CRISE_SISTEMICA - Proteção & Dólar (Flight to Safety)
    return [
      {
        id: "rec-fundo-cambial",
        name: "Fundo de Câmbio Dólar Hedge",
        category: "Fundos de Câmbio",
        rate: "Variação Cambial USD",
        rateVal: 12.00,
        risk: "MEDIO" as RiskLevel,
        delay: "D+1",
        notes: "Blindagem de capital em moedas fortes. Protege seu patrimônio em desvalorizações agudas da moeda nacional.",
        min: 500.00,
        isFreeTax: false
      },
      {
        id: "rec-ouro-etf",
        name: "ETF Ouro GOLD11 (B3)",
        category: "Commodities",
        rate: "Variação Ouro Spot",
        rateVal: 15.40,
        risk: "MEDIO" as RiskLevel,
        delay: "D+2",
        notes: "Ativo de refúgio definitivo de valor em tempos de crises e choques geopolíticos internacionais.",
        min: 100.00,
        isFreeTax: false
      },
      {
        id: "rec-dola-selic",
        name: "Tesouro Selic Curto",
        category: "Tesouro Direto",
        rate: "10.75% a.a.",
        rateVal: 10.75,
        risk: "BAIXO" as RiskLevel,
        delay: "D+0",
        notes: "Caixa imediato. Liquidez pós-fixada soberana é crucial para aproveitar oportunidades pós-crise.",
        min: 30.00,
        isFreeTax: false
      },
      {
        id: "rec-btc-crypto",
        name: "Bitcoin (BTC) Físico",
        category: "Web3 & Crypto",
        rate: "Variação Livre",
        rateVal: 22.00,
        risk: "MUITO_ALTO" as RiskLevel,
        delay: "Imediato",
        notes: "Ativo digital descentralizado e escasso. Comportamento histórico de proteção a estresses bancários globais.",
        min: 100.00,
        isFreeTax: false
      }
    ];
  }, [activeScenario]);

  // Simulação reativa composta baseada nos inputs do usuário
  const simResults = useMemo(() => {
    const monthlyAmt = simMonthlyContribution;
    const months = simYears * 12;
    const totalInvested = monthlyAmt * months;

    // Função de simulação base com juros mensais
    const calculateGrowth = (annualRate: number) => {
      const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
      let finalBal = 0;
      for (let i = 0; i < months; i++) {
        finalBal = (finalBal + monthlyAmt) * (1 + monthlyRate);
      }
      const earnings = Math.max(0, finalBal - totalInvested);
      const profitPercentage = totalInvested > 0 ? (earnings / totalInvested) * 100 : 0;
      return {
        total: finalBal,
        profit: earnings,
        pct: profitPercentage
      };
    };

    return {
      totalInvested,
      cdb120: calculateGrowth(12.78),
      pref2027: calculateGrowth(12.50),
      ipca2029: calculateGrowth(11.00),
      selic: calculateGrowth(10.75),
      cdb100: calculateGrowth(10.65)
    };
  }, [simMonthlyContribution, simYears]);

  const handleOpenAssetModal = (inv?: Investment) => {
    if (inv) {
      setEditingInv(inv);
      setInvName(inv.name);
      setInvType(inv.type);
      setInvProfile(inv.profile || "MODERADO");
      setInvInstitution(inv.institution || "");
      setInvInitialAmount(String(inv.initialAmount));
      setInvCurrentAmount(String(inv.currentAmount));
      setInvMonthlyDeposit(String(inv.monthlyDeposit || ""));
      setInvExpectedReturn(String(inv.expectedReturn || ""));
      setInvRiskLevel(inv.riskLevel);
      setInvNotes(inv.notes || "");
      setInvColor(inv.color || "#4F46E5");
    } else {
      setEditingInv(null);
      setInvName("");
      setInvType("RENDA_FIXA");
      setInvProfile("MODERADO");
      setInvInstitution("XP ");
      setInvInitialAmount("5000");
      setInvCurrentAmount("5000");
      setInvMonthlyDeposit("500");
      setInvExpectedReturn("10.75");
      setInvRiskLevel("BAIXO");
      setInvNotes("");
      setInvColor("#4F46E5");
    }
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || !invInitialAmount) return;

    try {
      const payload = {
        name: invName,
        type: invType,
        profile: invProfile,
        institution: invInstitution,
        initialAmount: parseFloat(invInitialAmount),
        currentAmount: parseFloat(invCurrentAmount) || parseFloat(invInitialAmount),
        monthlyDeposit: parseFloat(invMonthlyDeposit) || 0,
        expectedReturn: parseFloat(invExpectedReturn) || 0,
        riskLevel: invRiskLevel,
        notes: invNotes,
        color: invColor,
        isActive: true
      };

      if (editingInv) {
        await updateInv(editingInv.id, payload);
      } else {
        await createInv(payload);
      }

      setIsAssetModalOpen(false);
      refreshInv();
    } catch (err) {}
  };

  const handleDeleteAsset = async (id: string) => {
    if (confirm("Gostaria de deletar permanentemente este ativo?")) {
      try {
        await removeInv(id);
        refreshInv();
      } catch (err) {}
    }
  };

  // Movimentação aporte/saque
  const handleOpenTxModal = (inv: Investment) => {
    setSelectedInvForTx(inv);
    setTxType("DEPOSIT");
    setTxAmount("");
    setTxNotes("");
    setIsTxModalOpen(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvForTx || !txAmount) return;

    try {
      const amt = parseFloat(txAmount);
      const isDeposit = txType === "DEPOSIT";

      const url = `/api/investments/${selectedInvForTx.id}/log`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          deposit: isDeposit ? amt : 0,
          withdrawal: !isDeposit ? amt : 0,
          notes: txNotes || (isDeposit ? "Aporte Adicional" : "Saque Parcial"),
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsTxModalOpen(false);
        refreshInv();
      } else {
        alert("Erro ao realizar o lançamento.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metas handlers
  const handleOpenGoalModal = (g?: InvestmentGoal) => {
    if (g) {
      setEditingGoal(g);
      setGoalTitle(g.title);
      setGoalTargetAmount(String(g.targetAmount));
      setGoalCurrentAmount(String(g.currentAmount));
      setGoalTargetDate(g.targetDate ? g.targetDate.split("T")[0] : "");
      setGoalColor(g.color || "#00D2FF");
    } else {
      setEditingGoal(null);
      setGoalTitle("");
      setGoalTargetAmount("");
      setGoalCurrentAmount("");
      setGoalTargetDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]);
      setGoalColor("#00D2FF");
    }
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTargetAmount) return;

    try {
      const payload = {
        title: goalTitle,
        targetAmount: parseFloat(goalTargetAmount),
        currentAmount: parseFloat(goalCurrentAmount) || 0,
        targetDate: goalTargetDate,
        color: goalColor,
        isCompleted: (parseFloat(goalCurrentAmount) || 0) >= parseFloat(goalTargetAmount)
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, payload);
      } else {
        await createGoal(payload);
      }

      setIsGoalModalOpen(false);
      refreshGoals();
    } catch (err) {}
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm("Gostaria de deletar esta meta?")) {
      try {
        await removeGoal(id);
        refreshGoals();
      } catch (err) {}
    }
  };

  // Cálculos consolidados da carteira cadastrada do usuário
  const userMetrics = useMemo(() => {
    const list = investments || [];
    let totActual = 0;
    let totInvested = 0;
    let weightReturn = 0;

    list.forEach(i => {
      if (i.isActive) {
        totActual += i.currentAmount || 0;
        totInvested += i.initialAmount || 0;
        weightReturn += ((i.expectedReturn || 0) * (i.currentAmount || 0));
      }
    });

    const netProfit = totActual - totInvested;
    const profitPercentage = totInvested > 0 ? (netProfit / totInvested) * 100 : 0;
    const portfolioYield = totActual > 0 ? (weightReturn / totActual) : 10.75;

    return {
      totActual,
      totInvested,
      netProfit,
      profitPercentage,
      portfolioYield
    };
  }, [investments]);

  // Filtro de "Todos os Investimentos" cadastrados pelo usuário com Busca e Ordenação
  const filteredUserInvestments = useMemo(() => {
    let list = investments || [];
    
    // Filtro por Categoria de Ativo (Abas Rápidas)
    if (activeTypeTab === "RENDA_FIXA") {
      list = list.filter(i => i.type === "RENDA_FIXA" || i.type === "POUPANCA" || i.type === "PREVIDENCIA");
    } else if (activeTypeTab === "RENDA_VARIAVEL") {
      list = list.filter(i => i.type === "RENDA_VARIAVEL" || i.type === "CRIPTOMOEDAS" || i.type === "IMOVEIS" || i.type === "FUNDOS");
    }

    // Busca textual pelo nome do ativo ou pela corretora/banco
    if (tableSearch.trim() !== "") {
      const q = tableSearch.toLowerCase();
      list = list.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.institution && i.institution.toLowerCase().includes(q))
      );
    }

    // Ordenação dinâmica configurada
    return [...list].sort((a, b) => {
      if (tableSortBy === "NAME") {
        return a.name.localeCompare(b.name);
      }
      if (tableSortBy === "BALANCE") {
        return (b.currentAmount || 0) - (a.currentAmount || 0);
      }
      if (tableSortBy === "RETURN") {
        return (b.expectedReturn || 0) - (a.expectedReturn || 0);
      }
      if (tableSortBy === "RISK") {
        return b.riskLevel.localeCompare(a.riskLevel);
      }
      return 0;
    });
  }, [investments, activeTypeTab, tableSearch, tableSortBy]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans select-none text-[#E6EDF3] pb-12">
      
      {/* Banner / Header com Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#161B22] border border-[#30363D] rounded-2xl relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-3">
          <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <TrendingUp size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight flex items-center gap-1">
              <span>📈 Central de Investimentos</span>
            </h1>
            <p className="text-2xs text-slate-400 font-medium">Modelagem patrimonial inteligente, projeções futuras e mapeamento de juros.</p>
          </div>
        </div>

        {/* Tab Navigator Customizado */}
        <div className="flex items-center gap-1.5 bg-[#0D1117] p-1 border border-[#30363D] rounded-xl self-start sm:self-center">
          <button
            onClick={() => setGeneralTab("CENTRAL")}
            className={`text-2xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              generalTab === "CENTRAL" 
                ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-500 hover:text-white"
            }`}
          >
            Renda Fixa & Carteira
          </button>
          <button
            onClick={() => setGeneralTab("METAS")}
            className={`text-2xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              generalTab === "METAS" 
                ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-500 hover:text-white"
            }`}
          >
            Metas Patrimoniais ({goals?.length || 0})
          </button>
        </div>
      </div>

      {generalTab === "CENTRAL" ? (
        <>
          {/* Bento Grid - Indicadores macrofinanceiros em Renda Fixa conforme Modelos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Taxa Selic */}
            <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Taxa Selic</span>
                  <h3 className="text-xl font-bold tracking-tight font-display text-emerald-400 mt-1">10.75% a.a.</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <TrendingUpIcon size={16} />
                </div>
              </div>
              <p className="text-[9px] text-[#00D2FF] font-semibold uppercase tracking-wider mt-4">
                💎 Taxa básica da economia nacional
              </p>
            </Card>

            {/* Card 2: CDI */}
            <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">CDI</span>
                  <h3 className="text-xl font-bold tracking-tight font-display text-indigo-400 mt-1">10.65% a.a.</h3>
                </div>
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <Layers size={16} />
                </div>
              </div>
              <p className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider mt-4">
                ⚡ Referencial pós-fixado para renda fixa
              </p>
            </Card>

            {/* Card 3: IPCA */}
            <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">IPCA (proj.)</span>
                  <h3 className="text-xl font-bold tracking-tight font-display text-amber-500 mt-1">4.50% a.a.</h3>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <TrendingDown size={16} />
                </div>
              </div>
              <p className="text-[9px] text-amber-500 font-semibold uppercase tracking-wider mt-4">
                🔥 Indicador oficial de inflação acumulada
              </p>
            </Card>

            {/* Card 4: Poupança */}
            <Card hoverEffect className="border-[#30363D] bg-[#161B22] flex flex-col justify-between p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block">Poupança</span>
                  <h3 className="text-xl font-bold tracking-tight font-display text-rose-500 mt-1">
                    7.52% <span className="text-[10px] font-medium text-rose-400/80 uppercase">Evite!</span>
                  </h3>
                </div>
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <p className="text-[9px] text-rose-400 font-bold uppercase tracking-wider mt-4">
                🚨 Rendimento que perde para a inflação real
              </p>
            </Card>
          </div>

          {/* Área de Gráfico e Simulador Complexo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Simulador Interativo (12 Cols no Total: Card de Grid) */}
            <Card className="border-[#30363D] bg-[#161B22] p-5 lg:col-span-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D]/60 pb-4 mb-4">
                <div>
                  <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">📊 Simulador de Investimentos</CardTitle>
                  <CardDescription>Estime e projete a sua evolução patrimonial exponencial</CardDescription>
                </div>
                
                {/* Inputs do Simulador */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aporte Mensal:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-2xs font-mono">R$</span>
                      <input 
                        type="number"
                        step="100"
                        value={simMonthlyContribution}
                        onChange={(e) => setSimMonthlyContribution(Math.max(10, parseFloat(e.target.value) || 0))}
                        className="bg-[#0B0F1A] border border-[#30363D] rounded-xl text-2xs font-bold font-mono pl-7 pr-2 py-1.5 w-28 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Período:</span>
                    <select
                      value={simYears}
                      onChange={(e) => setSimYears(parseInt(e.target.value) || 10)}
                      className="bg-[#0B0F1A] border border-[#30363D] rounded-xl text-2xs font-bold py-1.5 px-3 outline-none cursor-pointer text-[#E6EDF3]"
                    >
                      <option value="1">1 Ano</option>
                      <option value="2">2 Anos</option>
                      <option value="3">3 Anos</option>
                      <option value="5">5 Anos</option>
                      <option value="10">10 Anos</option>
                      <option value="15">15 Anos</option>
                      <option value="20">20 Anos</option>
                      <option value="30">30 Anos</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid Interno: Gráfico SVG (Sete Colunas) e Projeções de Renda Fixa (Cinco Colunas) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* SVG Visual Growth Area (7 cols) */}
                <div className="md:col-span-7 flex flex-col justify-center h-full">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 font-mono text-center md:text-left">
                    Evolução Estimada • Total Investido: {formatMoney(simResults.totalInvested)}
                  </p>
                  
                  {/* Custom SVG Line Chart */}
                  <div className="w-full h-52 bg-[#0B0F1A]/85 border border-[#30363D] rounded-xl p-2 flex flex-col relative overflow-hidden justify-between">
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 py-8 pointer-events-none opacity-10">
                      <div className="border-t border-slate-400 w-full" />
                      <div className="border-t border-slate-400 w-full" />
                      <div className="border-t border-slate-400 w-full" />
                      <div className="border-t border-slate-400 w-full" />
                    </div>

                    {/* Chart Svg Curve drawing dynamically based on yields */}
                    <svg viewBox="0 0 500 200" className="w-full h-full absolute inset-0 p-1">
                      {/* CDB 120% line */}
                      <path 
                        d="M 20 180 Q 150 145, 300 100 T 480 25" 
                        fill="none" 
                        stroke="#00E676" 
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="drop-shadow-[0_2px_4px_rgba(0,230,118,0.2)]"
                      />
                      {/* CDB 100% line */}
                      <path 
                        d="M 20 180 Q 150 155, 300 120 T 480 55" 
                        fill="none" 
                        stroke="#00D2FF" 
                        strokeWidth="2" 
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                      />
                      {/* Total Invested line */}
                      <path 
                        d="M 20 180 L 480 90" 
                        fill="none" 
                        stroke="#4F46E5" 
                        strokeWidth="1.5"
                        strokeDasharray="3 4"
                      />
                      {/* Dot labels */}
                      <circle cx="20" cy="180" r="4.5" fill="#4F46E5" />
                      <circle cx="480" cy="25" r="4.5" fill="#00E676" />
                      <circle cx="480" cy="55" r="4" fill="#00D2FF" />
                    </svg>

                    {/* Y Axis Legend labels */}
                    <div className="flex justify-between items-end w-full px-4 text-[9px] font-mono text-slate-500 font-semibold select-none z-10 pt-40">
                      <span>Início</span>
                      <span>Ano 2</span>
                      <span>Ano 4</span>
                      <span>Ano 6</span>
                      <span>Ano 8</span>
                      <span>Ano {simYears} (Fim)</span>
                    </div>

                    {/* Legend badges */}
                    <div className="absolute top-2 left-3 flex items-center gap-3 text-[8.5px] font-mono font-bold text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/40 z-10">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 bg-[#00E676] block" /> CDB 120%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 border-t border-[#00D2FF] border-dashed block" /> CDB 100%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-0.5 border-t border-[#4F46E5] border-dotted block" /> Aporte Base
                      </span>
                    </div>
                  </div>
                </div>

                {/* Projeções Planas de Renda Fixa (5 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between py-1.5 space-y-3">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                    Projeção em {simYears} Anos ({simYears * 12} meses):
                  </h4>

                  <div className="space-y-2 flex-1">
                    {/* CDB 120 */}
                    <div className="flex items-center justify-between p-2 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl text-2xs leading-none">
                      <span className="font-bold text-[#E6EDF3] flex items-center gap-1">
                        <span>⭐</span> CDB 120% CDI <span className="text-[9px] text-slate-500 font-normal">(12.78% a.a.)</span>
                      </span>
                      <div className="text-right">
                        <p className="font-mono text-[#00E676] font-bold">{formatMoney(simResults.cdb120.total)}</p>
                        <p className="text-[9px] text-[#00D2FF] font-mono font-bold mt-1 text-[9px]">Lucro: {formatMoney(simResults.cdb120.profit)} ({simResults.cdb120.pct.toFixed(0)}%)</p>
                      </div>
                    </div>

                    {/* Tesouro Pref */}
                    <div className="flex items-center justify-between p-2 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl text-2xs leading-none">
                      <span className="font-bold text-[#E6EDF3]">
                        📈 Tesouro Prefixado <span className="text-[9px] text-slate-500 font-normal">(12.50% a.a.)</span>
                      </span>
                      <div className="text-right">
                        <p className="font-mono text-slate-300 font-bold">{formatMoney(simResults.pref2027.total)}</p>
                        <p className="text-slate-500 font-mono mt-1 text-[9px]">Lucro: {formatMoney(simResults.pref2027.profit)} ({simResults.pref2027.pct.toFixed(0)}%)</p>
                      </div>
                    </div>

                    {/* Tesouro IPCA */}
                    <div className="flex items-center justify-between p-2 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl text-2xs leading-none">
                      <span className="font-bold text-[#E6EDF3]">
                        🛡️ Tesouro IPCA+ <span className="text-[9px] text-slate-500 font-normal">(11.00% a.a.)</span>
                      </span>
                      <div className="text-right">
                        <p className="font-mono text-slate-300 font-bold">{formatMoney(simResults.ipca2029.total)}</p>
                        <p className="text-slate-500 font-mono mt-1 text-[9px]">Lucro: {formatMoney(simResults.ipca2029.profit)} ({simResults.ipca2029.pct.toFixed(0)}%)</p>
                      </div>
                    </div>

                    {/* Tesouro Selic */}
                    <div className="flex items-center justify-between p-2 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl text-2xs leading-none">
                      <span className="font-bold text-[#E6EDF3]">
                        🪙 Tesouro Selic <span className="text-[9px] text-slate-500 font-normal">(10.75% a.a.)</span>
                      </span>
                      <div className="text-right">
                        <p className="font-mono text-slate-300 font-bold">{formatMoney(simResults.selic.total)}</p>
                        <p className="text-slate-500 font-mono mt-1 text-[9px]">Lucro: {formatMoney(simResults.selic.profit)} ({simResults.selic.pct.toFixed(0)}%)</p>
                      </div>
                    </div>

                    {/* CDB 100 */}
                    <div className="flex items-center justify-between p-2 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl text-2xs leading-none">
                      <span className="font-bold text-[#E6EDF3]">
                        🧱 CDB 100% CDI <span className="text-[9px] text-slate-500 font-normal">(10.65% a.a.)</span>
                      </span>
                      <div className="text-right">
                        <p className="font-mono text-slate-300 font-bold">{formatMoney(simResults.cdb100.total)}</p>
                        <p className="text-slate-500 font-mono mt-1 text-[9px]">Lucro: {formatMoney(simResults.cdb100.profit)} ({simResults.cdb100.pct.toFixed(0)}%)</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* HUD de Cenário Financeiro (Brasil & Mundial) */}
            <Card className="border-[#30363D] bg-[#161B22] p-5 lg:col-span-12 relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <span>🌍 Cenário de Mercado & Alocação Inteligente</span>
                </CardTitle>
                <CardDescription>Configure o panorama global e doméstico para alinhar o conselheiro Dola AI às melhores opções vigentes</CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
                {/* Cenário 1: Selic Alta */}
                <button
                  type="button"
                  onClick={() => setActiveScenario("SELIC_ALTA")}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activeScenario === "SELIC_ALTA"
                      ? "bg-indigo-650/15 border-indigo-550 shadow-md shadow-indigo-600/5"
                      : "bg-[#0B0F1A]/40 border-[#30363D] hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🏦</span>
                    <h4 className={`text-xs font-bold ${activeScenario === "SELIC_ALTA" ? "text-indigo-400" : "text-slate-200"}`}>Selic Alta Brasil</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-2">Prêmio de juros elevados. Foco em pós-fixados CDI e Tesouro Direto Selic.</p>
                  <span className="text-[9px] text-[#00D2FF] font-bold font-mono block mt-1.5 uppercase">Selic @ 10.75% a.a.</span>
                </button>

                {/* Cenário 2: Corte de Juros */}
                <button
                  type="button"
                  onClick={() => setActiveScenario("SELIC_QUEDA")}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activeScenario === "SELIC_QUEDA"
                      ? "bg-indigo-650/15 border-indigo-550 shadow-md shadow-indigo-600/5"
                      : "bg-[#0B0F1A]/40 border-[#30363D] hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📉</span>
                    <h4 className={`text-xs font-bold ${activeScenario === "SELIC_QUEDA" ? "text-indigo-400" : "text-slate-200"}`}>Queda dos Juros</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-2">Ciclo de corte do Bacen. Ideal para Prefixados, FIIs de tijolo e ações.</p>
                  <span className="text-[9px] text-emerald-400 font-bold font-mono block mt-1.5 uppercase">Marcação a Mercado 🔥</span>
                </button>

                {/* Cenário 3: Inflação Global */}
                <button
                  type="button"
                  onClick={() => setActiveScenario("INFLACAO_GLOBAL")}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activeScenario === "INFLACAO_GLOBAL"
                      ? "bg-indigo-650/15 border-indigo-550 shadow-md shadow-indigo-600/5"
                      : "bg-[#0B0F1A]/40 border-[#30363D] hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🔥</span>
                    <h4 className={`text-xs font-bold ${activeScenario === "INFLACAO_GLOBAL" ? "text-indigo-400" : "text-slate-200"}`}>Inflação Forte</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-2">IPCA e IGPM em aceleração. Alocação em títulos IPCA+ e ativos reais.</p>
                  <span className="text-[9px] text-amber-500 font-bold font-mono block mt-1.5 uppercase">Blindagem de Custos 🛡️</span>
                </button>

                {/* Cenário 4: Crise Sistêmica */}
                <button
                  type="button"
                  onClick={() => setActiveScenario("CRISE_SISTEMICA")}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activeScenario === "CRISE_SISTEMICA"
                      ? "bg-indigo-650/15 border-indigo-550 shadow-md shadow-indigo-600/5"
                      : "bg-[#0B0F1A]/40 border-[#30363D] hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🚨</span>
                    <h4 className={`text-xs font-bold ${activeScenario === "CRISE_SISTEMICA" ? "text-indigo-400" : "text-slate-200"}`}>Instabilidade Global</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-2">Instabilidade e choques cambiais. Flight to safety em Dólar, Ouro e Web3 BTC.</p>
                  <span className="text-[9px] text-[#A55EEA] font-bold font-mono block mt-1.5 uppercase">Reserva Internacional 🌌</span>
                </button>
              </div>

              {/* Caixa Dola AI inteligente contextual */}
              <div className="bg-[#0B0F1A]/60 border border-slate-800 p-3.5 rounded-xl flex items-start gap-3">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                  <BookOpen size={15} />
                </span>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-200 font-bold">🤖 Análise Exclusiva DOLA AI:</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {activeScenario === "SELIC_ALTA" && "Recomendamos cautela em renda variável pura. Aproveite a taxa básica rentabilizando reservas contratuais com CDBs paridade CDI que ofereçam o anteparo soberano do Fundo Garantidor de Crédito até R$ 250k."}
                    {activeScenario === "SELIC_QUEDA" && "As taxas pré-fixadas atuais representam excelentes focos de captura de lucros antes que as novas captações reflitam as taxas mais baratas. Os fundos imobiliários começam a pagar maiores proventos relativos."}
                    {activeScenario === "INFLACAO_GLOBAL" && "Preserve custos de vida atrelando o capital aos indexadores IPCA+ que asseguram prêmio real. Isso impede a erosão silenciosa provocada pela emissão monetária continuada."}
                    {activeScenario === "CRISE_SISTEMICA" && "O momento exige cautela extrema e liquidez imediata. Títulos dolarizados e o Ouro atuam de forma contra-cíclica amortecendo as oscilações cambiais locais da carteira física."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recomendados para Você - Renda Fixa conforme Modelos */}
            <Card className="border-[#30363D] bg-[#161B22] p-5 lg:col-span-12">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">⭐ Recomendações Atualizadas DOLA IA</CardTitle>
                <CardDescription>Oportunidades mapeadas especificamente para o cenário macroeconômico escolhido</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendedFixedIncome.map((rec) => {
                    const isModerado = rec.risk === "MEDIO" || rec.risk === "ALTO" || rec.risk === "MUITO_ALTO";
                    return (
                      <div 
                        key={rec.id}
                        className="bg-[#0B0F1A]/40 border border-[#30363D] hover:border-slate-500 rounded-xl p-4 flex flex-col justify-between text-2xs transition-all shadow-md relative group"
                      >
                        {rec.isFreeTax && (
                          <span className="absolute top-2 right-2.5 bg-indigo-500/15 border border-indigo-500/20 text-[#A55EEA] text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full leading-none">
                            Isento IR 💸
                          </span>
                        )}

                        <div className="space-y-3">
                          <div className="space-y-0.5">
                            <p className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">{rec.category}</p>
                            <h4 className="font-bold text-[#E6EDF3] text-xs flex items-center gap-1 mt-0.5 group-hover:text-indigo-400 transition-colors">{rec.name}</h4>
                          </div>

                          <div className="flex justify-between items-end bg-[#161B22]/50 p-2 border border-slate-800/80 rounded-lg">
                            <div>
                              <p className="text-slate-500 font-bold text-[8px] uppercase">Rendimento</p>
                              <p className="text-emerald-400 font-bold mt-0.5 font-mono text-[11px]">{rec.rate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-500 font-bold text-[8px] uppercase">Risco</p>
                              <p className={`font-bold mt-0.5 ${isModerado ? "text-amber-500" : "text-emerald-400"}`}>
                                {rec.risk === "MUITO_ALTO" ? "Alto/Crítico" : rec.risk === "MEDIO" ? "Moderado" : "Baixo Risco"}
                              </p>
                            </div>
                          </div>

                          <p className="text-slate-400 leading-normal text-[10px] mt-2 h-10 overflow-hidden line-clamp-3">
                            {rec.notes}
                          </p>
                        </div>

                        <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
                          <span>Carência: {rec.delay}</span>
                          <span className="text-[#00D2FF]">A partir de {formatMoney(rec.min)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quadro de Custom Assets do Usuário */}
            <div className="lg:col-span-12">
              <Card className="border-[#30363D] bg-[#161B22] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D]/60 pb-4 mb-4">
                  <div>
                    <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">📁 Carteira de Ativos Cadastrados ({filteredUserInvestments.length})</CardTitle>
                    <CardDescription>Gerencie suas posições físicas, ordens em corretoras e filtre ativos cadastrados</CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Botão de Alternar Visualização */}
                    <div className="flex items-center gap-1 bg-[#0D1117] p-1 border border-[#30363D] rounded-xl text-3xs font-bold h-8">
                      <button
                        type="button"
                        onClick={() => setPortfolioViewMode("TABLE")}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${portfolioViewMode === "TABLE" ? "bg-indigo-600 font-semibold text-white" : "text-slate-500 hover:text-[#E6EDF3]"}`}
                      >
                        📋 Tabela
                      </button>
                      <button
                        type="button"
                        onClick={() => setPortfolioViewMode("GRID")}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${portfolioViewMode === "GRID" ? "bg-indigo-600 font-semibold text-white" : "text-slate-500 hover:text-[#E6EDF3]"}`}
                      >
                        🔲 Grid Cards
                      </button>
                    </div>

                    {/* Campo de Busca Livre por Ativo ou Brokers */}
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="🔎 Buscar ativo..."
                      className="bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium pl-3 pr-2 py-1.5 w-32 outline-none h-8 text-slate-300"
                    />

                    {/* Ordenação Rápida */}
                    <select
                      value={tableSortBy}
                      onChange={(e) => setTableSortBy(e.target.value as any)}
                      className="bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-bold py-1.5 px-2.5 h-8 outline-none cursor-pointer text-slate-300"
                    >
                      <option value="NAME">Ordenar: Nome</option>
                      <option value="BALANCE">Ordenar: Saldo</option>
                      <option value="RETURN">Ordenar: Taxa Retorno</option>
                      <option value="RISK">Ordenar: Grau Risco</option>
                    </select>

                    {/* Filtros rápidos de tabela base */}
                    <div className="flex items-center gap-1 bg-[#0D1117] p-1 border border-[#30363D] rounded-xl text-[9px] font-bold h-8">
                      <button 
                        onClick={() => setActiveTypeTab("TODOS")}
                        className={`px-2.5 py-1 rounded-lg ${activeTypeTab === "TODOS" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"}`}
                      >
                        Todos
                      </button>
                      <button 
                        onClick={() => setActiveTypeTab("RENDA_FIXA")}
                        className={`px-2.5 py-1 rounded-lg ${activeTypeTab === "RENDA_FIXA" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"}`}
                      >
                        Renda Fixa
                      </button>
                      <button 
                        onClick={() => setActiveTypeTab("RENDA_VARIAVEL")}
                        className={`px-2.5 py-1 rounded-lg ${activeTypeTab === "RENDA_VARIAVEL" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"}`}
                      >
                        Ações & Variável
                      </button>
                    </div>

                    <Button 
                      onClick={() => handleOpenAssetModal()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 text-2xs font-bold cursor-pointer py-1.5 px-3 rounded-xl border-none transition h-8"
                    >
                      <Plus size={12} />
                      Novo Ativo
                    </Button>
                  </div>
                </div>

                <CardContent className="p-0">
                  {loadingInv ? (
                    <div className="p-8 text-center text-xs text-slate-500">Sincronizando carteira patrimonial...</div>
                  ) : filteredUserInvestments.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-500 italic border border-[#30363D] border-dashed rounded-xl">
                      Nenhum registro de custódia própria atende a este filtro. Clique em "Novo Ativo" para lançar!
                    </div>
                  ) : portfolioViewMode === "TABLE" ? (
                    /* TABELA COMPLETA TODOS OS INVESTIMENTOS (Fase 7) */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-2xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#30363D]/70 bg-indigo-900/5 text-slate-400">
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Ativo / Corretora</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Classificação</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Retorno Estimado</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Grau de Risco</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Aporte Inicial</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Saldo Atual</th>
                            <th className="p-3 font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Rendimento Real</th>
                            <th className="p-3 text-right font-bold uppercase tracking-wider text-[8px] md:text-[8.5px]">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {filteredUserInvestments.map((inv) => {
                            const typeInfo = INVESTMENT_TYPES[inv.type] || { label: inv.type, color: "#8E9EAB", icon: "💎" };
                            const riskInfo = RISK_LABELS[inv.riskLevel] || { label: inv.riskLevel, variant: "info" };
                            const profit = inv.currentAmount - inv.initialAmount;

                            return (
                              <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-3 font-semibold text-[#E6EDF3] whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: inv.color || "#4F46E5" }} />
                                    <div>
                                      <p className="font-bold text-slate-200">{inv.name}</p>
                                      <p className="text-[9px] text-slate-500 font-semibold font-mono">{inv.institution || "Custódia física"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-400 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <span>{typeInfo.icon}</span>
                                    <span>{typeInfo.label}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-indigo-400 font-bold whitespace-nowrap">
                                  {inv.expectedReturn ? `${inv.expectedReturn}% a.a.` : "Não Informado"}
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <Badge variant={riskInfo.variant} className="text-[8px] md:text-[8.5px] font-bold py-0.5 px-2 leading-none border-none">
                                    {riskInfo.label}
                                  </Badge>
                                </td>
                                <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                                  {formatMoney(inv.initialAmount)}
                                </td>
                                <td className="p-3 font-mono font-bold whitespace-nowrap text-emerald-400" style={{ color: inv.color }}>
                                  {formatMoney(inv.currentAmount)}
                                </td>
                                <td className="p-3 font-mono whitespace-nowrap">
                                  {profit === 0 ? (
                                    <span className="text-slate-500">—</span>
                                  ) : (
                                    <span className={`font-bold flex items-center gap-0.5 ${profit > 0 ? "text-emerald-400" : "text-rose-500"}`}>
                                      {profit > 0 ? `+${formatMoney(profit)}` : formatMoney(profit)}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenTxModal(inv)}
                                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-3xs font-sans uppercase flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <PlusCircle size={10} className="text-indigo-450" />
                                      Aporte
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAssetModal(inv)}
                                      className="p-1 bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                                      title="Editar Ativo"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAsset(inv.id)}
                                      className="p-1 bg-slate-800/50 text-rose-500 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                      title="Remover Ativo"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* CARDS GRID DE INVESTIMENTOS (Antigo layout mantido como opção de toggle) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUserInvestments.map((inv) => {
                        const typeInfo = INVESTMENT_TYPES[inv.type] || { label: inv.type, color: "#8E9EAB", icon: "💎" };
                        const riskInfo = RISK_LABELS[inv.riskLevel] || { label: inv.riskLevel, variant: "info" };
                        const profit = inv.currentAmount - inv.initialAmount;

                        return (
                          <div 
                            key={inv.id}
                            className="bg-[#0B0F1A]/60 border border-[#30363D] hover:border-slate-500 rounded-xl p-4 flex flex-col justify-between text-2xs transition-all shadow-md"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inv.color || "#4F46E5" }} />
                                    <h4 className="font-bold text-[#E6EDF3] text-xs">{inv.name}</h4>
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-semibold font-mono">Broker: {inv.institution || "Custo próprio"}</p>
                                </div>
                                <Badge variant={riskInfo.variant} className="text-[8.5px] border-none font-bold py-0.5 px-1.5 leading-none">{riskInfo.label}</Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-3 py-1.5 border-t border-b border-slate-800/40 font-mono">
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase">Aportes</p>
                                  <p className="font-bold text-slate-300 mt-0.5">{formatMoney(inv.initialAmount)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] text-slate-500 font-bold uppercase">Saldo Atualizado</p>
                                  <p className="font-bold text-emerald-400 mt-0.5" style={{ color: inv.color }}>{formatMoney(inv.currentAmount)}</p>
                                </div>
                              </div>

                              {profit !== 0 && (
                                <div className="flex items-center gap-1 mt-2.5 text-2xs font-bold leading-none bg-slate-900/40 p-1.5 rounded-lg border border-slate-800">
                                  {profit > 0 ? (
                                    <TrendingUp size={11} className="text-emerald-400" />
                                  ) : (
                                    <TrendingDown size={11} className="text-rose-400" />
                                  )}
                                  <span className={profit > 0 ? "text-emerald-400" : "text-rose-450"}>
                                    Rentabilidade Líquida: {profit > 0 ? `+${formatMoney(profit)}` : formatMoney(profit)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-slate-800/50 pt-3 mt-4 flex items-center justify-between font-bold text-[10px]">
                              <button
                                type="button"
                                onClick={() => handleOpenTxModal(inv)}
                                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer text-2xs font-semibold"
                              >
                                <PlusCircle size={12} />
                                Lançar Aporte
                              </button>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssetModal(inv)}
                                  className="p-1 px-1.5 bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                                  title="Editar Ativo"
                                >
                                  <Edit3 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAsset(inv.id)}
                                  className="p-1 px-1.5 bg-slate-800/50 text-rose-500 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                  title="Remover Ativo"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </>
      ) : (
        /* Seção Avançada de Metas Patrimoniais */
        <div className="space-y-6 animate-fadeIn">
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Target size={14} className="text-indigo-450" />
                  🎯 Objetivos & Metas Estruturais Patrimoniais
                </CardTitle>
                <CardDescription>Atrele seus propósitos de vida a limites mensais recomendados de poupança</CardDescription>
              </div>

              <Button 
                onClick={() => handleOpenGoalModal()}
                className="bg-[#A55EEA] hover:bg-[#8E44AD] text-white flex items-center gap-1 text-2xs font-bold cursor-pointer py-1.5 px-3.5 rounded-xl border-none transition"
              >
                <Plus size={12} />
                Nova Meta
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {loadingGoals ? (
                <div className="text-center text-xs text-slate-500 py-10">Calculando taxas de metas...</div>
              ) : !goals || goals.length === 0 ? (
                <div className="p-16 text-center text-xs text-slate-500 italic border border-[#30363D] border-dashed rounded-2xl">
                  Nenhum propósito macro modelado. Defina sua primeira meta focada de aportes acima!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.map((g) => {
                    const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                    const isCompleted = pct >= 100;
                    
                    // Cálculo de quanto falta e parcelas aproximadas se o vencimento for no futuro
                    const diffVal = Math.max(0, g.targetAmount - g.currentAmount);
                    const MonthsDiff = useMemo(() => {
                      if (!g.targetDate) return 12;
                      const d1 = new Date();
                      const d2 = new Date(g.targetDate);
                      const m = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
                      return m > 0 ? m : 1;
                    }, [g.targetDate]);
                    const neededMonthly = diffVal / MonthsDiff;

                    return (
                      <div 
                        key={g.id}
                        className="bg-[#0B0F1A]/60 border border-[#30363D] rounded-xl p-4 flex flex-col justify-between text-2xs space-y-4"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color || "#0BC5EA" }} />
                              <h4 className="font-bold text-[#E6EDF3] text-xs">{g.title}</h4>
                            </div>
                            {isCompleted && (
                              <Badge variant="success" className="text-[8px] font-bold border-none py-0.5 px-1.5 leading-none">Atingida ✔️</Badge>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-end text-[10px] font-mono leading-none">
                              <span className="text-slate-500 font-bold uppercase text-[9px]">Atingido</span>
                              <span className="font-bold text-indigo-400">{pct}%</span>
                            </div>
                            <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden border border-[#30363D]">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%`, backgroundColor: g.color || "#0BC5EA" }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-2xs leading-none py-2 bg-slate-900/50 border border-slate-800 rounded-lg px-2.5 font-mono">
                            <div>
                              <p className="text-slate-500 font-bold text-[8px] uppercase">Acumulado</p>
                              <p className="text-slate-300 font-bold mt-1">{formatMoney(g.currentAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-500 font-bold text-[8px] uppercase">Alvo</p>
                              <p className="text-indigo-400 font-bold mt-1">{formatMoney(g.targetAmount)}</p>
                            </div>
                          </div>
                        </div>

                        {!isCompleted && neededMonthly > 0 && (
                          <div className="bg-indigo-600/[0.03] border border-indigo-500/15 p-3 rounded-lg space-y-1.5">
                            <p className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 uppercase tracking-wider leading-none">
                              <Info size={11} /> Projeção de Captação
                            </p>
                            <p className="text-slate-400 leading-normal">
                              Prazo de <span className="font-bold text-slate-300">{MonthsDiff} meses</span> para atingir o objetivo planejado.
                            </p>
                            <p className="text-slate-400 leading-normal">
                              Recomenda-se realizar aportes extras mensais de <span className="font-mono text-emerald-400 font-bold">{formatMoney(neededMonthly)}</span>.
                            </p>
                          </div>
                        )}

                        <div className="border-t border-[#30363D] pt-3.5 flex items-center justify-between text-slate-500 font-mono text-[9px] font-semibold">
                          <span>Data Alvo: {new Date(g.targetDate).toLocaleDateString("pt-BR")}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenGoalModal(g)}
                              className="p-1 bg-slate-800 hover:text-white rounded transition cursor-pointer"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(g.id)}
                              className="p-1 bg-slate-800 text-rose-500 hover:bg-rose-500/10 rounded transition cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL DE CADASTRAR/EDITAR ATIVO */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-2xs md:text-xs">
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-xs font-bold font-display text-[#E6EDF3] tracking-tight uppercase flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-400" />
                {editingInv ? "Modelagem e Ajuste de Ativo" : "Modelar Novo Ativo de Carteira"}
              </h2>
              <button 
                onClick={() => setIsAssetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-[#30363D] rounded transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Identificação do Ativo</label>
                  <input
                    type="text"
                    required
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    placeholder="Ex: CDB Daycoval, FII MXRF11"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] placeholder:text-slate-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Broker / Instituição</label>
                  <input
                    type="text"
                    value={invInstitution}
                    onChange={(e) => setInvInstitution(e.target.value)}
                    placeholder="Ex: XP, BTG, Daycoval"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] placeholder:text-slate-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Categoria do Ativo</label>
                  <select
                    value={invType}
                    onChange={(e) => setInvType(e.target.value as InvestmentType)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] cursor-pointer outline-none"
                  >
                    {Object.entries(INVESTMENT_TYPES).map(([key, t]) => (
                      <option key={key} value={key}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Identidade de Cor</label>
                  <input
                    type="color"
                    value={invColor}
                    onChange={(e) => setInvColor(e.target.value)}
                    className="w-full h-7 bg-[#0B0F1A] border border-[#30363D] rounded-xl cursor-pointer p-0.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Rendimento Esperado (% a.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invExpectedReturn}
                    onChange={(e) => setInvExpectedReturn(e.target.value)}
                    placeholder="Ex: 10.75"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Aporte Recorrente Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invMonthlyDeposit}
                    onChange={(e) => setInvMonthlyDeposit(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Aporte Inicial Custodiado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={invInitialAmount}
                    onChange={(e) => setInvInitialAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Saldo Convertido Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invCurrentAmount}
                    onChange={(e) => setInvCurrentAmount(e.target.value)}
                    placeholder="Deixe vazio para herdar inicial"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Grau de Risco</label>
                  <select
                    value={invRiskLevel}
                    onChange={(e) => setInvRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] cursor-pointer outline-none"
                  >
                    <option value="BAIXO">Baixo Risco</option>
                    <option value="MEDIO">Moderado / Médio</option>
                    <option value="ALTO">Alto Risco</option>
                    <option value="MUITO_ALTO">Extremo / Crítico</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Perfil de Investidor</label>
                  <select
                    value={invProfile}
                    onChange={(e) => setInvProfile(e.target.value as InvestorProfile)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] cursor-pointer outline-none"
                  >
                    <option value="CONSERVADOR">Conservador</option>
                    <option value="MODERADO">Moderado</option>
                    <option value="ARROJADO">Arrojado</option>
                    <option value="SOFISTICADO">Sofisticado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Notas Complementares & Prazos</label>
                <textarea
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="Ex: Resgate D+1, isento de IR, sob garantia do FGC..."
                  className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] h-12 h-14 resize-none outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  variant="outline"
                  className="border-[#30363D] text-slate-400 hover:text-white cursor-pointer py-1.5 px-4 rounded-xl text-2xs hover:bg-[#30363D]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer py-1.5 px-4 rounded-xl text-2xs font-bold border-none transition shadow"
                >
                  Salvar Ativo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DEPOSITAR / SACAR RÁPIDO */}
      {isTxModalOpen && selectedInvForTx && (
        <div className="fixed inset-0 bg-[#0B0F1A]/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-xs text-2xs">
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-xs font-bold font-display text-[#E6EDF3] uppercase tracking-tight">
                Movimentar: {selectedInvForTx.name}
              </h2>
              <button 
                onClick={() => setIsTxModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-[#30363D] rounded transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType("DEPOSIT")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    txType === "DEPOSIT" ? "bg-emerald-600 text-white border-none shadow" : "bg-slate-900 text-slate-500 border-[#30363D]"
                  }`}
                >
                  ▲ Depósito / Aporte
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("WITHDRAWAL")}
                  className={`py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    txType === "WITHDRAWAL" ? "bg-rose-600 text-white border-none shadow" : "bg-slate-900 text-slate-500 border-[#30363D]"
                  }`}
                >
                  ▼ Resgate / Saque
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Valor do Lançamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Observação</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Ex: Aporte programado XP"
                  className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] placeholder:text-slate-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  variant="outline"
                  className="border-[#30363D] text-slate-400 hover:text-white cursor-pointer py-1.5 px-3.5 rounded-lg text-2xs hover:bg-[#30363D]"
                >
                  Fechar
                </Button>
                <Button
                  type="submit"
                  className={`cursor-pointer py-1.5 px-3.5 rounded-lg text-2xs font-bold text-white border-[#30363D] ${
                    txType === "DEPOSIT" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE METAS */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-2xs md:text-xs">
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-xs font-bold font-display text-[#E6EDF3] uppercase tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-purple-400" />
                {editingGoal ? "Ajustar Objetivo" : "Definir Nova Meta Patrimonial"}
              </h2>
              <button 
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-[#30363D] rounded transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Título da Meta</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Ex: Comprar Apartamento"
                  className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-medium text-[#E6EDF3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goalTargetAmount}
                    onChange={(e) => setGoalTargetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Valor Acumulado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalCurrentAmount}
                    onChange={(e) => setGoalCurrentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Data Alvo</label>
                  <input
                    type="date"
                    required
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#30363D] rounded-xl text-3xs font-mono font-medium text-[#E6EDF3] outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-[#8B949E] font-bold uppercase tracking-wider block">Tom de Destaque</label>
                  <input
                    type="color"
                    value={goalColor}
                    onChange={(e) => setGoalColor(e.target.value)}
                    className="w-full h-8 bg-[#0B0F1A] border border-[#30363D] rounded-xl cursor-pointer p-0.5 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2.5">
                <Button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  variant="outline"
                  className="border-[#30363D] text-slate-400 hover:text-white cursor-pointer py-1.5 px-4 rounded-xl text-2xs hover:bg-[#30363D]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer py-1.5 px-4 rounded-xl text-2xs font-bold border-none transition shadow"
                >
                  Salvar Meta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
