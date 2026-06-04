// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/App.tsx
// Fase: 1
// ============================================

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./components/ui/Toast";
import { LoginPage } from "./components/auth/LoginPage";
import { Sidebar } from "./components/layout/Sidebar";
import { OverviewPage } from "./components/dashboard/OverviewPage";
import { AgendaPage } from "./components/productivity/AgendaPage";
import { TasksPage } from "./components/productivity/TasksPage";
import { NotesPage } from "./components/productivity/NotesPage";
import { AlarmsPage } from "./components/productivity/AlarmsPage";
import { HabitsPage } from "./components/productivity/HabitsPage";
import { UsersPage } from "./components/admin/UsersPage";
import { FinancesPage } from "./components/financial/FinancesPage";
import { InvestmentsPage } from "./components/financial/InvestmentsPage";
import { LoansPage } from "./components/financial/LoansPage";
import { SmartCalculatorPage } from "./components/financial/SmartCalculatorPage";
import { AssistentePage } from "./components/dashboard/AssistentePage";
import { RelatoriosPage } from "./components/dashboard/RelatoriosPage";
import { FamiliaPage } from "./components/dashboard/FamiliaPage";
import { PerfilPage } from "./components/dashboard/PerfilPage";
import { ConfiguracoesPage } from "./components/dashboard/ConfiguracoesPage";
import { AuditoriaPage } from "./components/dashboard/AuditoriaPage";
import { SmartRoulettePage } from "./components/productivity/SmartRoulettePage";
import { WhatsappPage } from "./components/dashboard/WhatsappPage";
import { NotificationsDropdown } from "./components/layout/NotificationsDropdown";
import { Key, Sparkles, User as UserIcon } from "lucide-react";

function MainAppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState("/dashboard");

  // Loading indicator for authentication check
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-4 select-none">
        <div className="h-10 w-10 relative">
          <div className="absolute inset-0 rounded-xl bg-indigo-600 p-2 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
            <span className="text-white text-xs font-bold font-display italic">Ω</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold font-display text-[#E6EDF3] tracking-widest uppercase">Dola AI</p>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">Sincronizando Sistema...</p>
        </div>
      </div>
    );
  }

  // Not authenticated? Show the stunning LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#E6EDF3] font-sans antialiased overflow-hidden flex">
      {/* Dynamic backdrop accent */}
      <div className="glow-spot top-[10%] right-[10%] pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Panel */}
      <div className="flex-1 min-h-screen flex flex-col ml-64 overflow-y-auto h-screen relative">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-[#30363D] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#A55EEA] font-bold uppercase tracking-widest font-display animate-pulse">Fase 7 — Auditoria & Segurança</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#A55EEA] animate-pulse" />
          </div>

          <div className="flex items-center gap-4">
            {user.role === "SUPERADMIN" && (
              <button
                id="admin-header-btn"
                onClick={() => setCurrentTab("/usuarios")}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-lg shadow-purple-500/20 active:scale-95 transition-all cursor-pointer border border-purple-500/20"
              >
                <span>👑 Admin</span>
              </button>
            )}

            {/* Notifications Dropdown Component */}
            <NotificationsDropdown onNavigate={(href) => setCurrentTab(href)} />

            {/* Profile Avatar Trigger Button */}
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-2xs font-semibold text-[#E6EDF3] leading-none">{user.name}</p>
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
              </div>
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-[#30363D]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 p-8">
          {currentTab === "/dashboard" ? <OverviewPage setCurrentTab={setCurrentTab} /> : null}
          {currentTab === "/agenda" ? <AgendaPage /> : null}
          {currentTab === "/tarefas" ? <TasksPage /> : null}
          {currentTab === "/notas" ? <NotesPage /> : null}
          {currentTab === "/alarmes" ? <AlarmsPage /> : null}
          {currentTab === "/habitos" ? <HabitsPage /> : null}
          {currentTab === "/roleta" ? <SmartRoulettePage /> : null}
          {currentTab === "/usuarios" ? <UsersPage /> : null}
          {currentTab === "/financeiro" ? <FinancesPage /> : null}
          {currentTab === "/investimentos" ? <InvestmentsPage /> : null}
          {currentTab === "/emprestimos" ? <LoansPage /> : null}
          {currentTab === "/calculadora" ? <SmartCalculatorPage /> : null}
          {currentTab === "/assistente" ? <AssistentePage /> : null}
          {currentTab === "/relatorios" ? <RelatoriosPage /> : null}
          {currentTab === "/familia" ? <FamiliaPage /> : null}
          {currentTab === "/perfil" ? <PerfilPage /> : null}
          {currentTab === "/configuracoes" ? <ConfiguracoesPage /> : null}
          {currentTab === "/auditoria" ? <AuditoriaPage /> : null}
          {currentTab === "/whatsapp" ? <WhatsappPage /> : null}
        </main>

        {/* Status System footer matching Bento Grid template footer */}
        <footer className="px-8 py-4 bg-[#161B22]/40 border-t border-[#30363D] text-[10px] text-slate-500 font-medium flex justify-between items-center">
          <div className="flex gap-4">
            <span>Sessão Ativa: SEC-9283-F7</span>
            <span>API Stable v7.0.0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#A55EEA] rounded-full animate-pulse"></div>
            <span>Cognitive, security, productivity & wealth engine live</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
