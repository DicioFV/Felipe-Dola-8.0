// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/types/index.ts
// Fase: 1
// ============================================

export type Role = "SUPERADMIN" | "ADMIN" | "USER";

export type TaskStatus = "TODO" | "DOING" | "DONE";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type EventType = "PERSONAL" | "BUSINESS" | "FAMILY" | "FINANCIAL" | "HEALTH";

export type HabitFrequency = "DAILY" | "WEEKLY";

export type FinanceType = "INCOME" | "EXPENSE" | "PAYABLE" | "RECEIVABLE";

export type InvestmentType =
  | "RENDA_FIXA"
  | "RENDA_VARIAVEL"
  | "FUNDOS"
  | "CRIPTOMOEDAS"
  | "IMOVEIS"
  | "PREVIDENCIA"
  | "POUPANCA"
  | "OUTRO";

export type InvestorProfile = "CONSERVADOR" | "MODERADO" | "ARROJADO" | "SOFISTICADO";

export type RiskLevel = "BAIXO" | "MEDIO" | "ALTO" | "MUITO_ALTO";

export type LoanType =
  | "PESSOAL"
  | "CONSIGNADO"
  | "CARTAO_CREDITO"
  | "FINANCIAMENTO_AUTO"
  | "FINANCIAMENTO_IMOVEL"
  | "CHEQUE_ESPECIAL"
  | "EMPRESARIAL"
  | "OUTRO";

export type LoanStatus = "ACTIVE" | "OVERDUE" | "PAID" | "RENEGOCIATED";

export type StrategyType =
  | "AMORTIZACAO_EXTRA"
  | "PORTABILIDADE"
  | "REFINANCIAMENTO"
  | "BOLA_DE_NEVE"
  | "AVALANCHE"
  | "ANTECIPACAO_PARCELAS"
  | "FGTS"
  | "RENEGOCIACAO";

// ---- MODELS ----

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category?: string;
  dueDate?: string;
  completedAt?: string;
  parentId?: string;
  subtasks?: Task[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type: EventType;
  isRecurring: boolean;
  recurrenceRule?: string;
  reminder?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alarm {
  id: string;
  userId: string;
  title: string;
  description?: string;
  datetime: string;
  repeat?: "DAILY" | "WEEKLY" | "CUSTOM";
  sound?: string;
  priority: Priority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  category?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  logs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Finance {
  id: string;
  userId: string;
  type: FinanceType;
  title: string;
  amount: number;
  category?: string;
  dueDate?: string;
  paidAt?: string;
  isPaid: boolean;
  recurrence?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  type?: string;
  participants: string[];
  reminder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content?: string;
  category?: string;
  isPinned: boolean;
  color?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  profile: InvestorProfile;
  institution?: string;
  initialAmount: number;
  currentAmount: number;
  monthlyDeposit?: number;
  startDate: string;
  maturityDate?: string;
  expectedReturn?: number;
  actualReturn?: number;
  riskLevel: RiskLevel;
  isActive: boolean;
  notes?: string;
  color?: string;
  icon?: string;
  logs?: InvestmentLog[];
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentLog {
  id: string;
  investmentId: string;
  date: string;
  amount: number;
  deposit?: number;
  withdrawal?: number;
  returnRate?: number;
  notes?: string;
  createdAt: string;
}

export interface InvestmentGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyNeeded?: number;
  color?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  institution: string;
  type: LoanType;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  interestRateYear: number;
  installmentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: string;
  endDate: string;
  nextDueDate: string;
  status: LoanStatus;
  hasPortability: boolean;
  penaltyAmount?: number;
  earlyPaymentFee?: number;
  notes?: string;
  color?: string;
  payments?: LoanPayment[];
  strategies?: LoanStrategy[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  installmentNum: number;
  dueDate: string;
  paidDate?: string;
  scheduledAmount: number;
  paidAmount?: number;
  fineAmount?: number;
  isPaid: boolean;
  isExtraPayment: boolean;
  notes?: string;
  createdAt: string;
}

export interface LoanStrategy {
  id: string;
  loanId: string;
  strategyType: StrategyType;
  title: string;
  description: string;
  potentialSaving?: number;
  monthsSaved?: number;
  priority: number;
  isApplied: boolean;
  appliedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
