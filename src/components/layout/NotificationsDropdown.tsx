// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/layout/NotificationsDropdown.tsx
// Fase: 5 — Central de Alertas e Lembretes Ativos
// ============================================

import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  RefreshCw, 
  X, 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  AlertOctagon,
  Plus,
  Compass
} from "lucide-react";
import { Notification } from "../../types";
import { useToast } from "../ui/Toast";

interface NotificationsDropdownProps {
  onNavigate: (href: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationsDropdown({ onNavigate, onUnreadCountChange }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Custom notification simulator state
  const [showSimulator, setShowSimulator] = useState(false);
  const [simTitle, setSimTitle] = useState("");
  const [simMessage, setSimMessage] = useState("");
  const [simType, setSimType] = useState("INFO");

  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user sessions token
  const getHeaders = () => {
    const token = localStorage.getItem("dola_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Erro ao buscar notificações:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateReminders = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/notifications/generate-reminders", {
        method: "POST",
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        toast("Varredura concluída! Alertas e prazos em dia.", "success");
      } else {
        toast("Falha ao sincronizar rotinas.", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Sem conexão com a engine de alertas.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: getHeaders()
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: getHeaders()
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast("Todas as notificações marcadas como lidas.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast("Alerta removido com sucesso.", "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerCustomNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle.trim()) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: simTitle,
          message: simMessage,
          type: simType,
          actionUrl: "/dashboard"
        })
      });

      if (response.ok) {
        const newNotif = await response.json();
        setNotifications(prev => [newNotif, ...prev]);
        setSimTitle("");
        setSimMessage("");
        setShowSimulator(false);
        toast("Alerta personalizado emitido!", "success");
      }
    } catch (err) {
      console.error(err);
      toast("Erro ao emitir alerta.", "error");
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Autoclose click-outside listener
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const getAlertIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "DANGER":
        return <AlertOctagon className="text-rose-500 shrink-0" size={16} />;
      case "WARNING":
        return <AlertTriangle className="text-amber-500 shrink-0" size={16} />;
      case "SUCCESS":
        return <CheckCircle className="text-[#20BF6B] shrink-0" size={16} />;
      case "INFO":
      default:
        return <Info className="text-indigo-400 shrink-0" size={16} />;
    }
  };

  const getBorderColor = (type: string, isRead: boolean) => {
    if (isRead) return "border-[#30363D] hover:bg-slate-800/40";
    switch (type.toUpperCase()) {
      case "DANGER":
        return "border-l-4 border-l-rose-500 border-y-[#30363D] border-r-[#30363D] bg-rose-950/10 hover:bg-rose-950/25";
      case "WARNING":
        return "border-l-4 border-l-amber-500 border-y-[#30363D] border-r-[#30363D] bg-amber-950/10 hover:bg-amber-950/20";
      case "SUCCESS":
        return "border-l-4 border-l-[#20BF6B] border-y-[#30363D] border-r-[#30363D] bg-[#20BF6B]/5 hover:bg-[#20BF6B]/10";
      case "INFO":
      default:
        return "border-l-4 border-l-indigo-500 border-y-[#30363D] border-r-[#30363D] bg-indigo-950/10 hover:bg-indigo-950/20";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button with Glowing Unread Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 bg-slate-900 border border-[#30363D] hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer relative flex items-center justify-center"
        title="Central de Alertas e Lembretes Executivos"
        id="bell-icon-trigger"
      >
        <Bell size={16} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#A811DA] rounded-full border border-[#0B0F1A] text-[9px] font-bold text-white flex items-center justify-center animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Main Notifications Popover Box */}
      {isOpen && (
        <div className="absolute right-0 mt-3.5 w-96 bg-[#161B22]/95 backdrop-blur-md rounded-2xl border border-[#30363D] shadow-2xl z-50 overflow-hidden font-sans select-none flex flex-col max-h-[550px] animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-[#30363D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#E6EDF3]">Notificações Executivas</span>
              {unreadCount > 0 && (
                <span className="bg-[#A811DA]/20 text-[#A811DA] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {unreadCount} novas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={generateReminders}
                disabled={syncing}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Sincronizar Inteligência de Rotinas"
              >
                <RefreshCw size={13} className={syncing ? "animate-spin text-indigo-400" : ""} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel: Simulator Trigger */}
          <div className="px-4 py-2 bg-[#0B0F1A]/40 border-b border-[#30363D] flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Inspeção de Alertas</span>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={11} /> Emitir Alerta Customizado
            </button>
          </div>

          {/* Simulated Customized Notification Form */}
          {showSimulator && (
            <form onSubmit={triggerCustomNotification} className="p-4 bg-[#0B0F1A]/85 border-b border-[#30363D] space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Título (ex: Alerta Patrimonial)"
                  required
                  value={simTitle}
                  onChange={e => setSimTitle(e.target.value)}
                  className="bg-slate-900 border border-[#30363D] text-[#E6EDF3] rounded px-2.5 py-1 text-xs flex-1 outline-none focus:border-indigo-500"
                />
                
                <select
                  value={simType}
                  onChange={e => setSimType(e.target.value)}
                  className="bg-slate-900 border border-[#30363D] text-[#E6EDF3] rounded px-1.5 py-1 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="INFO">INFO</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="WARNING">WARNING</option>
                  <option value="DANGER">DANGER</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mensagem detalhada..."
                  value={simMessage}
                  required
                  onChange={e => setSimMessage(e.target.value)}
                  className="bg-slate-900 border border-[#30363D] text-[#E6EDF3] rounded px-2.5 py-1 text-xs flex-1 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded px-3 py-1 transition-colors"
                >
                  Enviar
                </button>
              </div>
            </form>
          )}

          {/* List Content */}
          <div className="overflow-y-auto flex-1 max-h-[380px] divide-y divide-[#30363D]/50 custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={20} className="animate-spin text-indigo-400" />
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Buscando inteligência ativa...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900/60 flex items-center justify-center border border-[#30363D] text-slate-400 relative">
                  <Bell size={18} />
                  <span className="absolute inset-0 bg-indigo-500/10 blur rounded-full animate-ping" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#E6EDF3]">Central Silenciosa</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] mx-auto">
                    Nenhum lembrete ativado. Clique no botão de atualização acima para auditar tarefas, hábitos e prazos ativos do sistema!
                  </p>
                </div>
                <button
                  onClick={generateReminders}
                  disabled={syncing}
                  className="mt-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider rounded-lg px-4 py-1.5 transition-colors flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                  Escanear Pendências
                </button>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    if (notif.actionUrl) {
                      onNavigate(notif.actionUrl);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition-all text-left relative group cursor-pointer flex gap-3 ${getBorderColor(notif.type, notif.isRead)}`}
                >
                  {/* Status Circle / Icon */}
                  {getAlertIcon(notif.type)}

                  {/* Body text */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className={`text-xs font-bold leading-tight ${notif.isRead ? "text-slate-400" : "text-[#E6EDF3]"}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[8px] text-slate-500 font-mono font-medium whitespace-nowrap shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className={`text-[10px] mt-1 leading-snug ${notif.isRead ? "text-slate-500" : "text-slate-300"}`}>
                      {notif.message}
                    </p>
                    
                    {notif.actionUrl && (
                      <span className="inline-flex items-center gap-1 text-[8px] text-indigo-400 font-bold uppercase mt-1.5 tracking-wider">
                        <Compass size={8} /> Ir para módulo <ExternalLink size={8} />
                      </span>
                    )}
                  </div>

                  {/* Remove alert button */}
                  <button
                    onClick={(e) => deleteNotification(notif.id, e)}
                    className="absolute right-2.5 top-3.5 p-1 text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover alerta"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* Footer stats */}
          {notifications.length > 0 && (
            <div className="p-3 bg-[#0B0F1A]/80 border-t border-[#30363D] text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest flex justify-between items-center px-4">
              <span>Fase 5 • Alertas Inteligentes</span>
              <button
                onClick={generateReminders}
                disabled={syncing}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
              >
                {syncing ? "Sincronizando..." : "Escanear Contratos"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
