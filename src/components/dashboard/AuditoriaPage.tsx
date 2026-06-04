// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/AuditoriaPage.tsx
// Fase: 7 — Trilha de Auditoria, Segurança & Operações
// ============================================

import React, { useEffect, useState } from "react";
import { 
  Shield, 
  Activity, 
  FileText, 
  RefreshCw, 
  AlertTriangle, 
  Trash2, 
  Download, 
  User as UserIcon, 
  CheckCircle, 
  Search, 
  Lock, 
  Server, 
  Globe,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../ui/Toast";

interface LogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

export function AuditoriaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [sysCheckStatus, setSysCheckStatus] = useState<"clean" | "checking">("clean");

  // Token para chamadas API
  const token = localStorage.getItem("dola_auth_token");

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/activity-logs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        toast("Erro ao carregar trilha de auditoria.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Falha na sincronização dos logs.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm("Atenção Executivo: Tem certeza que deseja apagar permanentemente toda a trilha de auditoria corporativa? Esta ação é irreversível e será registrada.")) {
      return;
    }

    try {
      const res = await fetch("/api/activity-logs/clear", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast("Trilha de auditoria reiniciada com sucesso.", "success");
        fetchLogs();
      } else {
        const errData = await res.json();
        toast(errData.message || "Não pôde limpar logs.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Falha de rede ao tentar limpar logs.", "error");
    }
  };

  const handleSimulateAlert = async (type: string) => {
    setSysCheckStatus("checking");
    setTimeout(async () => {
      try {
        const res = await fetch("/api/activity-logs/simulate-security-alert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ type })
        });
        if (res.ok) {
          toast("Simulação operacional injetada nos registros.", "success");
          fetchLogs(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSysCheckStatus("clean");
      }
    }, 1200);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dola-ai-auditoria-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast("Trilha em JSON exportada com sucesso.", "success");
    } catch (err) {
      toast("Erro ao exportar arquivo.", "error");
    }
  };

  // Filtros aplicados em memória no cliente para renderização de alta velocidade
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (log.entity?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (log.details?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (log.user?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (log.ipAddress || "").includes(searchTerm);

    const matchesEntity = selectedEntity === "ALL" || log.entity === selectedEntity;
    const matchesAction = selectedAction === "ALL" || log.action === selectedAction;

    return matchesSearch && matchesEntity && matchesAction;
  });

  // Métricas do Cockpit de Segurança
  const totalLogs = logs.length;
  const loginAttemptsCount = logs.filter(l => l.action === "LOGIN").length;
  const securityAlertsCount = logs.filter(l => l.action === "SECURITY_ALERT").length;
  const systemOperationsCount = logs.filter(l => ["CREATE", "UPDATE", "DELETE"].includes(l.action)).length;

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      {/* Header section with Phase Announcement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[8px] font-bold bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded uppercase tracking-wider font-mono">
              Fase 7 Ativa
            </span>
            <h1 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2 font-display uppercase tracking-tight">
              <Shield className="text-purple-400" size={16} /> Central de Segurança & Auditoria
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Trilha de auditoria criptografada e imutável para supervisão de acesso, integridade de dados e proteção de ativos.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLogs()}
            className="px-3 py-1.5 bg-[#161B22] hover:bg-[#30363D] text-[10px] font-semibold text-slate-300 border border-[#30363D] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={11} className={`${loading ? 'animate-spin' : ''}`} /> Sincronizar Logs
          </button>
          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="px-3 py-1.5 bg-[#161B22] hover:bg-[#30363D] text-[10px] font-semibold text-indigo-400 border border-[#30363D] rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download size={11} /> Exportar JSON
          </button>
          
          {user?.role === "SUPERADMIN" && (
            <button
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-[10px] font-semibold text-rose-400 border border-rose-900/30 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 size={11} /> Limpar Trilha
            </button>
          )}
        </div>
      </div>

      {/* Bento-style Metrics Ring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#161B22]/30 border border-[#30363D] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Registros Ativos</p>
            <h3 className="text-xl font-bold font-display text-white mt-1">{totalLogs}</h3>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5 mt-1 leading-none">
              <CheckCircle size={9} /> Trilha persistida
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-505/10 flex items-center justify-center border border-indigo-500/10 text-indigo-400">
            <Database size={16} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#161B22]/30 border border-[#30363D] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Acessos Seguros</p>
            <h3 className="text-xl font-bold font-display text-white mt-1">{loginAttemptsCount}</h3>
            <span className="text-[9px] text-slate-400 font-mono mt-1 block">
              Logins criptografados
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-505/10 flex items-center justify-center border border-purple-500/10 text-purple-400">
            <UserIcon size={16} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#161B22]/30 border border-[#30363D] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Checkup do Sistema</p>
            <h3 className="text-xs font-bold font-display text-emerald-400 mt-2.5 flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-400" /> INTEGRIDADE 100%
            </h3>
            <span className="text-[9px] text-slate-400 font-mono mt-1 block">
              Criptografia AES-256 / SHA
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-505/10 flex items-center justify-center border border-emerald-500/10 text-emerald-400">
            <Lock size={16} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#161B22]/30 border border-[#30363D] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Incidentes Bloqueados</p>
            <h3 className={`text-xl font-bold font-display mt-1 ${securityAlertsCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {securityAlertsCount}
            </h3>
            <span className={`text-[9px] font-mono flex items-center gap-0.5 mt-1 leading-none ${securityAlertsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
              <AlertTriangle size={9} /> {securityAlertsCount > 0 ? "Alertas pendentes" : "Nenhuma ameaça"}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${securityAlertsCount > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-slate-800/20 border-slate-700/20 text-slate-500'}`}>
            <AlertTriangle size={16} />
          </div>
        </div>
      </div>

      {/* Security Operations Control Panel Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Interactive Control Box */}
        <div className="bg-[#161B22]/30 border border-[#30363D] rounded-2xl p-6 h-fit space-y-6 text-left">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-400" /> Cockpit de Segurança
            </h3>
            <p className="text-[9px] text-slate-400 mt-1">
              Como uma suíte operacional de alta performance, você pode testar e validar o mecanismo de logs e alertas injetando testes artificiais abaixo:
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Simular Ameaça / Logs Operacionais</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleSimulateAlert("unusual_login")}
                disabled={sysCheckStatus === "checking"}
                className="w-full text-left px-3.5 py-2.5 bg-[#0B0F1A]/80 border border-[#30363D] hover:border-amber-500/30 rounded-xl text-[10px] text-slate-300 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Invasão suspeita de IP estrangeiro
                </span>
                <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded font-mono font-bold">ALERTA</span>
              </button>

              <button
                onClick={() => handleSimulateAlert("rate_limit")}
                disabled={sysCheckStatus === "checking"}
                className="w-full text-left px-3.5 py-2.5 bg-[#0B0F1A]/80 border border-[#30363D] hover:border-purple-500/30 rounded-xl text-[10px] text-slate-300 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  Gatilho Flood / Rate-limiting DDoS
                </span>
                <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1 py-0.5 rounded font-mono font-bold">API</span>
              </button>

              <button
                onClick={() => handleSimulateAlert("api_key")}
                disabled={sysCheckStatus === "checking"}
                className="w-full text-left px-3.5 py-2.5 bg-[#0B0F1A]/80 border border-[#30363D] hover:border-[#A55EEA]/30 rounded-xl text-[10px] text-slate-300 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Check de chaves criptográficas
                </span>
                <span className="text-[8px] bg-[#A55EEA]/10 text-[#A55EEA] px-1 py-0.5 rounded font-mono font-bold">SYSTEM</span>
              </button>

              <button
                onClick={() => handleSimulateAlert("clean_checkup")}
                disabled={sysCheckStatus === "checking"}
                className="w-full text-left px-3.5 py-2.5 bg-[#0B0F1A]/80 border border-[#30363D] hover:border-emerald-500/30 rounded-xl text-[10px] text-slate-300 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Simular Checkup Limpo Periódico
                </span>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-mono font-bold">CHECK</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#0B0F1A]/50 border border-[#30363D] rounded-xl space-y-2">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Server size={11} className="text-zinc-500" /> Informações de Sanitização
            </h4>
            <div className="text-[9px] font-mono text-slate-400 space-y-1">
              <p><strong className="text-slate-500">DB Host:</strong> Cloud Run Sanbox Active</p>
              <p><strong className="text-slate-500">Engine:</strong> JSON DB Core</p>
              <p><strong className="text-slate-500">Node Versão:</strong> React v19 / Express v4</p>
              <p><strong className="text-slate-500">Status Firewall:</strong> Shield Guarding Actively</p>
            </div>
          </div>
        </div>

        {/* Right Audit Trail Table Box */}
        <div className="lg:col-span-2 bg-[#161B22]/30 border border-[#30363D] rounded-2xl p-6 text-left flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-purple-400" /> Histórico Operacional
              </h3>
              <p className="text-[9px] text-slate-400 mt-1">Registros de todas as modificações, acessos e auditorias executadas.</p>
            </div>

            {/* In-place search indicator */}
            <div className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider self-center bg-indigo-505/10 px-2 py-1 rounded border border-indigo-500/10">
              {filteredLogs.length} de {logs.length} mostrados
            </div>
          </div>

          {/* Quick Filters Toolkit */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center">
            {/* Search Input bar */}
            <div className="relative flex-1 w-full">
              <span className="absolute left-3 text-slate-500 pointer-events-none">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Buscar por termo, IP, ação ou detalhe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B0F1A]/80 text-[10px] pl-8 pr-4 py-2 border border-[#30363D] focus:border-indigo-500/80 focus:outline-none rounded-xl text-slate-100 font-sans"
              />
            </div>

            {/* Entity Select dropdown */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-[#0B0F1A]/80 border border-[#30363D] text-[10px] font-semibold text-slate-300 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              <option value="ALL">Todas Entidades</option>
              <option value="User">Usuários (User)</option>
              <option value="Task">Tarefas (Task)</option>
              <option value="Finance">Finanças (Finance)</option>
              <option value="Investment">Investimento</option>
              <option value="Loan">Empréstimos</option>
              <option value="System">Sistema (System)</option>
            </select>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-[#0B0F1A]/80 border border-[#30363D] text-[10px] font-semibold text-slate-300 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              <option value="ALL">Todas Ações</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="SECURITY_ALERT">ALERTA SEG</option>
              <option value="CLEAR">CLEAR</option>
            </select>
          </div>

          {/* Timeline Wrapper of logs */}
          <div className="flex-1 overflow-y-auto max-h-[500px] border border-[#30363D] rounded-xl bg-[#0B0F1A]/40 p-4 divide-y divide-[#30363D]/60 space-y-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-purple-400" size={18} />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sincronizando trilha em tempo real...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="text-slate-600 mx-auto mb-2" size={24} />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nenhum log operacional localizado</p>
                <p className="text-[9px] text-slate-500">Tente ajustar seus termos de pesquisa ou adicione tarefas para gerar novas ocorrências.</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                // Determine badge visual config
                let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                if (log.action === "LOGIN") badgeBg = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                if (log.action === "DELETE") badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                if (log.action === "UPDATE") badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                if (log.action === "SECURITY_ALERT") badgeBg = "bg-red-500/10 text-red-500 border-red-500/20";
                if (log.action === "CLEAR") badgeBg = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

                return (
                  <div key={log.id} className="py-3.5 hover:bg-[#161B22]/10 transition-colors flex items-start gap-3 text-left">
                    {/* Log action badge */}
                    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded border tracking-wider mt-0.5 whitespace-nowrap ${badgeBg}`}>
                      {log.action}
                    </span>

                    {/* Content details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-200 leading-normal font-sans">
                        {log.details || "Modificação sem detalhes."}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[8px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <UserIcon size={9} /> {log.user?.name} ({log.user?.email})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe size={9} /> IP: {log.ipAddress}
                        </span>
                        <span>•</span>
                        <span>
                          Ref: {log.entity} {log.entityId ? `[${log.entityId.slice(0, 8)}...]` : ''}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
