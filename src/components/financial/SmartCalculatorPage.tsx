// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/financial/SmartCalculatorPage.tsx
// Fase: Relação Avançada de Cálculos e Planejamentos Financeiros
// ============================================

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Percent, 
  ArrowRightLeft, 
  Coins, 
  BookOpen, 
  Info, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ChevronRight,
  ArrowUpRight,
  ListFilter
} from "lucide-react";
import { motion } from "motion/react";

// Types for results
interface CDBResult {
  multiplier: number; // rate e.g. 1.10 (110%)
  cdiRate: number; // e.g. 10.40 (10.40%)
  finalRate: number; // e.g. 11.44 (11.44%)
  grossTotal: number;
  netTotal: number;
  totalEarnings: number;
  netEarnings: number;
  taxAmount: number;
  taxPercentage: number;
  
  // Projections averages
  dailyGross: number;
  dailyNet: number;
  monthlyGross: number;
  monthlyNet: number;
  yearlyGross: number;
  yearlyNet: number;
}

interface AmortizationRow {
  month: number;
  payment: number;
  amortization: number;
  interest: number;
  balance: number;
}

interface LoanResult {
  totalPaid: number;
  totalInterest: number;
  firstPayment: number;
  lastPayment: number;
  rows: AmortizationRow[];
}

export function SmartCalculatorPage() {
  const [activeSubTab, setActiveSubTab] = useState<"CDB" | "COMPARATOR" | "LOANS">("CDB");

  // Common CDI/Selic references
  const [cdiRate, setCdiRate] = useState<number>(10.40); // 10.40% a.a. default realistic CDI
  const [selicRate, setSelicRate] = useState<number>(10.50); // 10.50% a.a. default Selic

  // 1. CDB State
  const [cdbCapital, setCdbCapital] = useState<number>(10000);
  const [cdbPercent, setCdbPercent] = useState<number>(110); // 110% of CDI
  const [cdbMonths, setCdbMonths] = useState<number>(12); // 12 months runtime
  const [cdbResults, setCdbResults] = useState<CDBResult | null>(null);

  // 2. Asset Comparator State
  const [compCapital, setCompCapital] = useState<number>(20000);
  const [compMonths, setCompMonths] = useState<number>(24);
  const [lcaPercent, setLcaPercent] = useState<number>(90); // LCA/LCI default e.g. 90% of CDI

  // 3. Loans State
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanInterest, setLoanInterest] = useState<number>(1.8); // 1.8% a.m.
  const [loanMonths, setLoanMonths] = useState<number>(36);
  const [loanDetailMonth, setLoanDetailMonth] = useState<number>(1);

  // Calculate CDB Results
  useEffect(() => {
    if (cdbCapital <= 0 || cdiRate <= 0 || cdbPercent <= 0 || cdbMonths <= 0) return;

    const realCdbRateYear = (cdiRate * (cdbPercent / 100)) / 100; // e.g. 0.1144 for 11.44% a.a.
    const monthlyRate = Math.pow(1 + realCdbRateYear, 1 / 12) - 1;
    
    // Brazilian standard business days: 252 per year, 21 per month on average.
    const dailyRate_252 = Math.pow(1 + realCdbRateYear, 1 / 252) - 1;

    // Calculate elapsed gross
    const grossTotal = cdbCapital * Math.pow(1 + realCdbRateYear, cdbMonths / 12);
    const totalEarnings = grossTotal - cdbCapital;

    // Days determination for Tax Bracket
    const approxDays = cdbMonths * 30;
    let taxPercentage = 22.5;
    if (approxDays > 180 && approxDays <= 360) {
      taxPercentage = 20.0;
    } else if (approxDays > 360 && approxDays <= 720) {
      taxPercentage = 17.5;
    } else if (approxDays > 720) {
      taxPercentage = 15.0;
    }

    const taxAmount = totalEarnings * (taxPercentage / 100);
    const netEarnings = totalEarnings - taxAmount;
    const netTotal = cdbCapital + netEarnings;

    // Multi-period averages (First month / first year projection helper)
    const monthlyGross = cdbCapital * monthlyRate;
    const monthlyNet = monthlyGross * (1 - taxPercentage / 100);

    const dailyGross = cdbCapital * dailyRate_252;
    const dailyNet = dailyGross * (1 - taxPercentage / 100);

    const yearlyGross = cdbCapital * realCdbRateYear;
    const yearlyNet = yearlyGross * (1 - taxPercentage / 100);

    setCdbResults({
      multiplier: cdbPercent / 100,
      cdiRate,
      finalRate: realCdbRateYear * 100,
      grossTotal,
      netTotal,
      totalEarnings,
      netEarnings,
      taxAmount,
      taxPercentage,
      dailyGross,
      dailyNet,
      monthlyGross,
      monthlyNet,
      yearlyGross,
      yearlyNet
    });
  }, [cdbCapital, cdiRate, cdbPercent, cdbMonths]);

  // Asset Comparator calculations helper function
  const calculateAsset = (type: "CDB" | "POUPANCA" | "LCI_LCA" | "TESOURO", capital: number, months: number) => {
    let rateYear = 0;
    let isTaxFree = false;

    if (type === "CDB") {
      rateYear = (cdiRate * (cdbPercent / 100)) / 100;
    } else if (type === "POUPANCA") {
      // Poupança realistic rate: 6.17% flat + hypothetical 1.2% TR = ~7.37% a.a.
      rateYear = 0.0737;
      isTaxFree = true;
    } else if (type === "LCI_LCA") {
      rateYear = (cdiRate * (lcaPercent / 100)) / 100;
      isTaxFree = true;
    } else if (type === "TESOURO") {
      // Selic flat (e.g. 10.5%) + 0.05% premium
      rateYear = (selicRate + 0.05) / 100;
    }

    const grossTotal = capital * Math.pow(1 + rateYear, months / 12);
    const earnings = grossTotal - capital;

    let taxRate = 22.5;
    const days = months * 30;
    if (days > 180 && days <= 360) taxRate = 20.0;
    else if (days > 360 && days <= 720) taxRate = 17.5;
    else if (days > 720) taxRate = 15.0;

    const taxAmount = isTaxFree ? 0 : earnings * (taxRate / 100);
    const netEarnings = earnings - taxAmount;
    const netTotal = capital + netEarnings;

    return {
      grossTotal,
      taxAmount,
      netEarnings,
      netTotal,
      effectiveRateAn: rateYear * 100,
      isTaxFree
    };
  };

  const cdbComp = calculateAsset("CDB", compCapital, compMonths);
  const poupComp = calculateAsset("POUPANCA", compCapital, compMonths);
  const lcaComp = calculateAsset("LCI_LCA", compCapital, compMonths);
  const selicComp = calculateAsset("TESOURO", compCapital, compMonths);

  const comparatorItems = [
    { title: `CDB (${cdbPercent}% CDI)`, type: "CDB", data: cdbComp, color: "from-indigo-500 to-violet-600" },
    { title: `Coleção Poupança (TR + 0.5% m.m.)`, type: "POUPANCA", data: poupComp, color: "from-amber-400 to-amber-600" },
    { title: `LCI / LCA (${lcaPercent}% CDI) [Livre de IR]`, type: "LCI_LCA", data: lcaComp, color: "from-emerald-400 to-emerald-600" },
    { title: `Tesouro Direto Selic +0,05%`, type: "TESOURO", data: selicComp, color: "from-sky-450 to-sky-600" }
  ].sort((a, b) => b.data.netTotal - a.data.netTotal); // Best performer on top

  // Equivalent interest rate calculation:
  // Since LCI/LCA is tax-free, what % of CDI an LCA needs to yield to equal a taxable CDB yielding X%?
  // Or vice-versa: what % of CDI does a taxable CDB need to yield to beat an LCA yielding Y%?
  let equivalentCdbPercent = 0;
  let equivalentLcaPercent = 0;
  const currentDays = compMonths * 30;
  let currentTax = 22.5;
  if (currentDays > 180 && currentDays <= 360) currentTax = 20.0;
  else if (currentDays > 360 && currentDays <= 720) currentTax = 17.5;
  else if (currentDays > 720) currentTax = 15.0;

  // Formula: LCI = CDB * (1 - IR)  =>  CDB = LCI / (1 - IR)
  equivalentCdbPercent = parseFloat((lcaPercent / (1 - currentTax / 100)).toFixed(1));
  equivalentLcaPercent = parseFloat((cdbPercent * (1 - currentTax / 100)).toFixed(1));

  // Amortization (SAC vs PRICE)
  const calculateSAC = (): LoanResult => {
    const r = loanInterest / 100;
    const amortization = loanAmount / loanMonths;
    const rows: AmortizationRow[] = [];
    let balance = loanAmount;
    let totalPaid = 0;
    let totalInterest = 0;

    for (let m = 1; m <= loanMonths; m++) {
      const interest = balance * r;
      const payment = amortization + interest;
      balance -= amortization;
      totalPaid += payment;
      totalInterest += interest;

      rows.push({
        month: m,
        payment,
        amortization,
        interest,
        balance: Math.max(0, balance)
      });
    }

    return {
      totalPaid,
      totalInterest,
      firstPayment: rows[0]?.payment || 0,
      lastPayment: rows[rows.length - 1]?.payment || 0,
      rows
    };
  };

  const calculatePrice = (): LoanResult => {
    const r = loanInterest / 100;
    const payment = loanAmount * (r * Math.pow(1 + r, loanMonths)) / (Math.pow(1 + r, loanMonths) - 1);
    const rows: AmortizationRow[] = [];
    let balance = loanAmount;
    let totalPaid = 0;
    let totalInterest = 0;

    for (let m = 1; m <= loanMonths; m++) {
      const interest = balance * r;
      const amortization = payment - interest;
      balance -= amortization;
      totalPaid += payment;
      totalInterest += interest;

      rows.push({
        month: m,
        payment,
        amortization,
        interest,
        balance: Math.max(0, balance)
      });
    }

    return {
      totalPaid,
      totalInterest,
      firstPayment: payment,
      lastPayment: payment,
      rows
    };
  };

  const sacResult = calculateSAC();
  const priceResult = calculatePrice();

  return (
    <div className="space-y-6 select-none text-left max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Prime brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161B22]/35 border border-[#30363D] p-5 rounded-2xl">
        <div>
          <h1 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2 font-display uppercase tracking-tight">
            <Calculator className="text-indigo-400 animate-pulse" size={16} /> Calculadora Financeira Inteligente
          </h1>
          <p className="text-[10px] text-slate-400 mt-1">
            Simulador de portfólio, CDB de alta performance, comparativos de ativos tributáveis e análise de juros de empréstimo (SAC x PRICE).
          </p>
        </div>

        {/* Global Reference Parameters */}
        <div className="flex flex-wrap items-center gap-4 bg-[#0B0F1A]/80 border border-[#30363D]/60 p-2.5 rounded-xl font-mono text-[10px]">
          <div className="flex items-center gap-1.5 border-r border-[#30363D] pr-3">
            <Percent size={11} className="text-indigo-400" />
            <span className="text-slate-400">CDI de Referência:</span>
            <input 
              type="number" 
              value={cdiRate} 
              step="0.05"
              onChange={(e) => setCdiRate(Math.max(0.1, parseFloat(e.target.value) || 10.40))}
              className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 font-bold text-indigo-300 text-center focus:outline-none"
            />
            <span className="text-slate-500">%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Coins size={11} className="text-amber-400" />
            <span className="text-slate-400">SELIC Referência:</span>
            <input 
              type="number" 
              value={selicRate} 
              step="0.05"
              onChange={(e) => setSelicRate(Math.max(0.1, parseFloat(e.target.value) || 10.50))}
              className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 font-bold text-amber-300 text-center focus:outline-none"
            />
            <span className="text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* Sub-tab selection row */}
      <div className="flex border-b border-[#30363D] gap-1 select-none">
        <button
          onClick={() => setActiveSubTab("CDB")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider transition-all border-b-2 shrink-0 ${
            activeSubTab === "CDB" 
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          📈 Simulador de CDB & CDI
        </button>
        <button
          onClick={() => setActiveSubTab("COMPARATOR")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider transition-all border-b-2 shrink-0 ${
            activeSubTab === "COMPARATOR" 
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          🔄 Comparador de Ativos
        </button>
        <button
          onClick={() => setActiveSubTab("LOANS")}
          className={`px-4 py-2 text-xs font-bold font-display uppercase tracking-wider transition-all border-b-2 shrink-0 ${
            activeSubTab === "LOANS" 
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          🏦 Amortização e Juros (SAC vs PRICE)
        </button>
      </div>

      {/* TAB CONTENT: CDB & CDI SIMULATOR */}
      {activeSubTab === "CDB" && cdbResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <div className="md:col-span-1 p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display border-b border-[#30363D] pb-2">
              Parâmetros de Simulação
            </h3>

            <div className="space-y-4 pt-1">
              {/* Parameter 1: Capital */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold block">
                  Valor do Aporte Inicial (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
                  <input
                    type="number"
                    value={cdbCapital}
                    onChange={(e) => setCdbCapital(Math.max(10, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-indigo-300 font-bold focus:outline-none pl-9 pr-4 py-2.5 rounded-xl border-dashed"
                  />
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={cdbCapital}
                  onChange={(e) => setCdbCapital(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Parameter 2: % CDI rate */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold flex justify-between">
                  <span>Rendimento do CDB</span>
                  <span className="text-indigo-400">{cdbPercent}% do CDI</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cdbPercent}
                    onChange={(e) => setCdbPercent(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-slate-300 font-bold focus:outline-none px-4 py-2.5 rounded-xl text-right pr-8"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="200"
                  step="5"
                  value={cdbPercent}
                  onChange={(e) => setCdbPercent(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Parameter 3: Months */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold flex justify-between">
                  <span>Período de Permanência</span>
                  <span className="text-indigo-400">{cdbMonths} Meses (~{cdbMonths * 30} dias)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cdbMonths}
                    onChange={(e) => setCdbMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-slate-300 font-bold focus:outline-none px-4 py-2.5 rounded-xl text-right pr-14"
                  />
                  <span className="absolute right-3 top-2.5 text-2xs text-slate-500 font-mono font-bold">MESES</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  step="1"
                  value={cdbMonths}
                  onChange={(e) => setCdbMonths(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* IR Informational banner */}
            <div className="bg-[#161B22] p-3 rounded-xl border border-[#30363D]/50 text-[10px] space-y-1 text-slate-400">
              <span className="font-bold text-amber-450 uppercase flex items-center gap-1">
                <Info size={11} /> Imposto Regressivo Aplicado
              </span>
              <p className="leading-tight">
                CDBs estão sujeitos ao imposto de renda sobre o lucro: <br />
                • Até 180 dias: <span className="font-bold text-slate-200">22.5%</span> <br />
                • 181 a 360 dias: <span className="font-bold text-slate-200">20.0%</span> (alíquota ativa) <br />
                • 361 a 720 dias: <span className="font-bold text-slate-200">17.5%</span> <br />
                • Acima de 720 dias: <span className="font-bold text-slate-200">15.0%</span>
              </p>
            </div>
          </div>

          {/* Outputs and Breakdown Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Net vs Gross Highlight block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#161B22]/30 border border-[#30363D] rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Total Bruto Estimado</span>
                  <p className="text-base font-bold text-slate-300 font-mono mt-1">
                    R$ {cdbResults.grossTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1 font-mono bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 w-fit">
                  <ArrowUpRight size={10} /> + R$ {cdbResults.totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} brutos
                </div>
              </div>

              <div className="p-4 bg-[#107C41]/10 border border-[#107C41]/30 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-[#2db969] uppercase font-mono tracking-wider font-bold">Total Líquido Estimado</span>
                  <p className="text-base font-bold text-emerald-400 font-mono mt-1">
                    R$ {cdbResults.netTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-[10px] text-emerald-300 font-bold mt-2 flex items-center gap-1 font-mono bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                  Lucro Real: R$ {cdbResults.netEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-4 bg-[#161B22]/30 border border-[#30363D] rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">Imposto de Renda (IR)</span>
                  <p className="text-base font-bold text-rose-450 font-mono mt-1">
                    R$ {cdbResults.taxAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-[10px] text-rose-400 font-bold mt-2 flex items-center gap-1 font-mono bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 w-fit">
                  Alíquota: {cdbResults.taxPercentage}%
                </div>
              </div>
            </div>

            {/* Earnings Breakdown per unit of time (Day, Month, Year) */}
            <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#30363D] pb-2">
                <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Coins className="text-indigo-400" size={13} /> Rendimento Médio Projetado
                </h3>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                  CDI Líquido Equivalente: {(cdbResults.finalRate * (1 - cdbResults.taxPercentage / 100)).toFixed(2)}% a.a.
                </span>
              </div>

              <div className="divide-y divide-[#30363D]/40">
                {/* Daily Income */}
                <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                      <span className="text-sm">📅</span> Rendimento por Dia Útil <span className="text-[9px] font-normal text-slate-500 lowercase">(base 252 dias)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Média estimada baseada no compounding comercial do CDI.</p>
                  </div>
                  <div className="text-right flex items-center gap-2.5 font-mono">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-500 block">Bruto: + R$ {cdbResults.dailyGross.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-400 block font-sans">Líquido: + R$ {cdbResults.dailyNet.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Income */}
                <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                      <span className="text-sm">🗓️</span> Rendimento por Mês <span className="text-[9px] font-normal text-slate-500 lowercase">(médio)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Aporte capitalizado gerando cupons virtuais mensalmente.</p>
                  </div>
                  <div className="text-right flex items-center gap-2.5 font-mono">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-500 block">Bruto: + R$ {cdbResults.monthlyGross.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-400 block font-sans">Líquido: + R$ {cdbResults.monthlyNet.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Yearly Income */}
                <div className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                      <span className="text-sm">🌟</span> Rendimento por Ano <span className="text-[9px] font-normal text-slate-500 lowercase">(anualizado)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Acúmulo composto ao longo de um ciclo financeiro de 12 meses.</p>
                  </div>
                  <div className="text-right flex items-center gap-2.5 font-mono">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-slate-500 block">Bruto: + R$ {cdbResults.yearlyGross.toFixed(2)}</span>
                      <span className="text-xs font-bold text-emerald-400 block font-sans">Líquido: + R$ {cdbResults.yearlyNet.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart CDB Recommendation Banner */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-4.5 rounded-2xl flex items-start gap-3">
              <span className="text-sm">🧠</span>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-300 font-display uppercase tracking-wider block">Insight Inteligente Dola AI</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Ao investir R$ <b>{cdbCapital.toLocaleString("pt-BR")}</b> a <b>{cdbPercent}%</b> do CDI, você terá uma rentabilidade anualizada bruta de <b>{cdbResults.finalRate.toFixed(2)}% a.a.</b> 
                  Se você resgatar o valor no final de <b>{cdbMonths} meses</b>, sua rentabilidade terá gerado um retorno líquido limpo equivalente a <b>R$ {cdbResults.netEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> em juros.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSET COMPARATOR */}
      {activeSubTab === "COMPARATOR" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column Settings */}
          <div className="md:col-span-1 p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display border-b border-[#30363D] pb-2">
              Configurar Confronto
            </h3>

            {/* Parameter: Capital */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold block">
                Valor para Comparação (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  value={compCapital}
                  onChange={(e) => setCompCapital(Math.max(10, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-indigo-300 font-bold focus:outline-none pl-9 pr-4 py-2.5 rounded-xl block"
                />
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={compCapital}
                onChange={(e) => setCompCapital(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Parameter: Duration Months */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold flex justify-between">
                <span>Prazo Comparado</span>
                <span className="text-indigo-400">{compMonths} Meses</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={compMonths}
                  onChange={(e) => setCompMonths(Math.max(1, parseInt(e.target.value) || 12))}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-slate-300 font-bold focus:outline-none px-4 py-2.5 rounded-xl block text-right pr-14"
                />
                <span className="absolute right-3 top-2.5 text-2xs text-slate-500 font-mono font-bold">MESES</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={compMonths}
                onChange={(e) => setCompMonths(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Parameter: LCI/LCA Specific target */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold flex justify-between">
                <span>Rentabilidade da LCI/LCA</span>
                <span className="text-emerald-400">{lcaPercent}% do CDI</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lcaPercent}
                  onChange={(e) => setLcaPercent(Math.max(10, parseInt(e.target.value) || 80))}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-slate-300 font-bold focus:outline-none px-4 py-2.5 rounded-xl block text-right pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">%</span>
              </div>
              <input
                type="range"
                min="70"
                max="120"
                step="1"
                value={lcaPercent}
                onChange={(e) => setLcaPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Educational advice column */}
            <div className="bg-[#161B22]/60 p-4 border border-[#30363D] rounded-xl text-[10px] text-slate-400 space-y-1">
              <span className="font-bold text-emerald-400 uppercase block">Isenção Fiscal (LCI/LCA)</span>
              <p className="leading-relaxed">
                LCIs e LCAs são isentos de IR para pessoas físicas. Por isso, uma LCA de 90% costuma render mais que um CDB de 100% no curto prazo. Veja a equivalência simulada no bloco ao lado!
              </p>
            </div>
          </div>

          {/* Right Column: Comparative Chart Listing */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display flex items-center justify-between border-b border-[#30363D] pb-3">
                <span>Placar de Rentabilidade Líquida (Do Melhor para o Pior)</span>
                <span className="text-[9px] text-[#A55EEA] font-mono tracking-wider">TRIBUTAÇÃO INTEGRADA</span>
              </h3>

              {/* Dynamic simulated bar chart list */}
              <div className="space-y-4 pt-1">
                {comparatorItems.map((item, idx) => {
                  const isWinner = idx === 0;
                  const ratio = (item.data.netTotal / comparatorItems[0].data.netTotal) * 100;

                  return (
                    <div key={item.type} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                            isWinner ? "bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20 animate-pulse" : "bg-[#161B22] text-slate-400 font-bold"
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="text-slate-350">{item.title}</span>
                          {!item.data.isTaxFree && (
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">(IR retido)</span>
                          )}
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-200 pr-2">
                            Total: R$ {item.data.netTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                            +{item.data.effectiveRateAn.toFixed(2)}% a.a.
                          </span>
                        </div>
                      </div>

                      {/* Styled Visual Progress Bar */}
                      <div className="w-full h-3.5 bg-slate-900 rounded-lg overflow-hidden border border-[#30363D]/50 relative">
                        <div 
                          className={`h-full rounded-lg bg-gradient-to-r ${item.color} transition-all duration-500`}
                          style={{ width: `${ratio}%` }}
                        />
                        <span className="absolute right-2.5 top-0.5 text-[8.5px] font-mono text-slate-500 font-bold">
                          Lucro: R$ {item.data.netEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equivalence Conversions Box */}
            <div className="p-5 bg-indigo-650/10 border border-indigo-500/20 rounded-2xl">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-display flex items-center gap-2 mb-3">
                <ArrowRightLeft size={13} /> Régua de Equivalência de Isenção
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0B0F1A]/80 border border-[#30363D] p-4.5 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">LCA/LCI equivalendo a CDB</span>
                  <p className="text-[#E6EDF3] leading-tight">
                    Para igualar o saldo de uma LCI/LCA rendendo <b>{lcaPercent}% do CDI</b>, um CDB sujeito a impostos precisará render pelo menos:
                  </p>
                  <p className="font-mono text-lg font-extrabold text-indigo-400 pt-1">
                    {equivalentCdbPercent}% do CDI
                  </p>
                </div>

                <div className="bg-[#0B0F1A]/80 border border-[#30363D] p-4.5 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">CDB equivalendo a LCA/LCI</span>
                  <p className="text-[#E6EDF3] leading-tight">
                    O seu CDB ativo de <b>{cdbPercent}% do CDI</b> renderá o equivalente líquido em mãos a uma LCI ou LCA sem impostos rendendo:
                  </p>
                  <p className="font-mono text-lg font-extrabold text-emerald-450 pt-1">
                    {equivalentLcaPercent}% do CDI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOANS AMORTIZATION (SAC VS PRICE) */}
      {activeSubTab === "LOANS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parameter Side Panels */}
          <div className="md:col-span-1 p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display border-b border-[#30363D] pb-2">
              Contrato de Empréstimo
            </h3>

            {/* Input: Amount */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold block">
                Valor Total Financiado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(10, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-indigo-300 font-bold focus:outline-none pl-9 pr-4 py-2.5 rounded-xl block"
                />
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Input: Juros */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold flex justify-between">
                <span>Taxa de Juros Mensal</span>
                <span className="text-indigo-400">{loanInterest}% a.m.</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={loanInterest}
                  step="0.05"
                  onChange={(e) => setLoanInterest(Math.max(0.01, parseFloat(e.target.value) || 1.8))}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-slate-300 font-bold focus:outline-none px-4 py-2.5 rounded-xl block text-right pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">% a.m.</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="8.0"
                step="0.1"
                value={loanInterest}
                onChange={(e) => setLoanInterest(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Input: Months */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold flex justify-between">
                <span>Período de Amortização</span>
                <span className="text-indigo-400">{loanMonths} Meses</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={loanMonths}
                  onChange={(e) => setLoanMonths(Math.max(1, parseInt(e.target.value) || 12))}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-xs text-slate-300 font-bold focus:outline-none px-4 py-2.5 rounded-xl block text-right pr-14"
                />
                <span className="absolute right-3 top-2.5 text-2xs text-slate-500 font-mono font-bold">PARCELAS</span>
              </div>
              <input
                type="range"
                min="3"
                max="120"
                step="3"
                value={loanMonths}
                onChange={(e) => setLoanMonths(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Quick SAC vs PRICE definition list */}
            <div className="bg-[#161B22]/60 p-4 border border-[#30363D] rounded-xl text-[10px] text-slate-400 space-y-2">
              <div>
                <span className="font-bold text-indigo-400 block uppercase">Regime SAC</span>
                <p className="leading-relaxed">A amortização é fixa. As parcelas começam mais altas e vão caindo gradualmente com o abatimento do saldo devedor.</p>
              </div>
              <div>
                <span className="font-bold text-amber-500 block uppercase">Regime PRICE</span>
                <p className="leading-relaxed">As parcelas permanecem exatamente iguais ao longo de todo o financiamento. O total pago em juros tende a ser maior que no SAC.</p>
              </div>
            </div>
          </div>

          {/* Right Comparison Box Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Split Comparison block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SAC Block */}
              <div className="p-5 bg-gradient-to-br from-[#161B22]/40 to-[#1e2531]/20 border border-[#30363D] rounded-2xl space-y-3.5 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-indigo-500/10 text-indigo-400 font-mono text-[8px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full">
                  Amortização Constante
                </div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest font-display">
                  🏢 Tabela SAC
                </h4>

                <div className="space-y-2 pt-1 font-mono">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Total Pago Acumulado:</span>
                    <span className="font-bold text-slate-200">
                      R$ {sacResult.totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Total Pago de Juros:</span>
                    <span className="font-bold text-rose-400">
                      R$ {sacResult.totalInterest.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] border-t border-[#30363D]/40 pt-1.5">
                    <span className="text-slate-400">Primeira Parcela (Mês 1):</span>
                    <span className="font-bold text-emerald-400 font-sans">
                      R$ {sacResult.firstPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Última Parcela (Mês {loanMonths}):</span>
                    <span className="font-bold text-emerald-450 font-sans">
                      R$ {sacResult.lastPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRICE Block */}
              <div className="p-5 bg-gradient-to-br from-[#161B22]/40 to-[#1e2531]/20 border border-[#30363D] rounded-2xl space-y-3.5 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-amber-500/10 text-amber-500 font-mono text-[8px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full">
                  Prestações Constantes
                </div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-display">
                  🇫🇷 Tabela PRICE
                </h4>

                <div className="space-y-2 pt-1 font-mono">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Total Pago Acumulado:</span>
                    <span className="font-bold text-slate-200">
                      R$ {priceResult.totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Total Pago de Juros:</span>
                    <span className="font-bold text-rose-400">
                      R$ {priceResult.totalInterest.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px] border-t border-[#30363D]/40 pt-1.5">
                    <span className="text-slate-400">Prestação Fixa Mensal:</span>
                    <span className="font-bold text-emerald-400 font-sans">
                      R$ {priceResult.firstPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-500">Amortização acumulada:</span>
                    <span className="font-sans text-slate-400 text-[10px]">
                      Mensalidades Lineares
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Confrontation evaluation */}
            <div className={`p-4.5 rounded-2xl border flex items-start gap-3 ${
              sacResult.totalPaid < priceResult.totalPaid 
                ? "bg-emerald-600/5 border-emerald-500/20" 
                : "bg-indigo-600/5 border-indigo-500/10"
            }`}>
              <span className="text-sm">⚖️</span>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 font-display uppercase tracking-wider block">Confronto Executivo Inteligente</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  O sistema de amortização <b>SAC</b> é financeiramente mais vantajoso! Ele gerará uma redução real de <b>R$ {(priceResult.totalInterest - sacResult.totalInterest).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> nos juros do contrato em relação à tabela PRICE, resultando numa economia consolidada na quitação.
                </p>
              </div>
            </div>

            {/* Dynamic visual slider to scroll month by month comparison of both schedules */}
            <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#30363D] pb-2">
                <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Calendar size={13} className="text-indigo-400" /> Detalhamento do Fluxo Mensal
                </h3>
                <span className="text-[9.5px] font-mono text-indigo-400 font-bold uppercase bg-indigo-550/10 px-2 py-0.5 rounded border border-indigo-500/10">
                  Visualizar Mês {loanDetailMonth}
                </span>
              </div>

              {/* Slider for monthly control */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="1"
                  max={loanMonths}
                  step="1"
                  value={loanDetailMonth}
                  onChange={(e) => setLoanDetailMonth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[8px] font-mono font-bold text-slate-500">
                  <span>MÊS 1</span>
                  <span>MÊS {Math.floor(loanMonths / 2)} (Metade)</span>
                  <span>MÊS {loanMonths} (Quitação)</span>
                </div>
              </div>

              {/* Interactive side by side month simulation row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono text-[10px]">
                {/* SAC Month Details */}
                <div className="bg-[#0B0F1A] border border-[#30363D] p-3.5 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-indigo-300 block border-b border-[#30363D]/60 pb-1 uppercase tracking-wide">📅 Mês {loanDetailMonth} - SAC</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parcela:</span>
                    <span className="font-bold text-white">R$ {(sacResult.rows[loanDetailMonth - 1]?.payment || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Abatimento:</span>
                    <span className="text-slate-200">R$ {(sacResult.rows[loanDetailMonth - 1]?.amortization || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Juros pagos:</span>
                    <span className="text-rose-400">R$ {(sacResult.rows[loanDetailMonth - 1]?.interest || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[9px] border-t border-[#30363D]/40 pt-1.5">
                    <span className="text-slate-500">Saldo Devedor:</span>
                    <span className="text-slate-400">R$ {(sacResult.rows[loanDetailMonth - 1]?.balance || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* PRICE Month Details */}
                <div className="bg-[#0B0F1A] border border-[#30363D] p-3.5 rounded-xl space-y-2">
                  <span className="text-[9px] font-bold text-amber-450 block border-b border-[#30363D]/60 pb-1 uppercase tracking-wide">📅 Mês {loanDetailMonth} - PRICE</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parcela:</span>
                    <span className="font-bold text-white">R$ {(priceResult.rows[loanDetailMonth - 1]?.payment || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Abatimento:</span>
                    <span className="text-slate-200">R$ {(priceResult.rows[loanDetailMonth - 1]?.amortization || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Juros pagos:</span>
                    <span className="text-rose-400">R$ {(priceResult.rows[loanDetailMonth - 1]?.interest || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[9px] border-t border-[#30363D]/40 pt-1.5">
                    <span className="text-slate-500">Saldo Devedor:</span>
                    <span className="text-slate-400">R$ {(priceResult.rows[loanDetailMonth - 1]?.balance || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
