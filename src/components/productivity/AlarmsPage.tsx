// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/productivity/AlarmsPage.tsx
// Fase: 2 — Gestão de Alarmes e Despertadores
// ============================================

import React, { useState } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Alarm, Priority } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Bell, 
  BellOff, 
  Volume2, 
  RefreshCw, 
  X,
  Loader2,
  AlertOctagon,
  CalendarDays
} from "lucide-react";

export function AlarmsPage() {
  const { data: alarms, loading, create, update, remove, refresh } = useCrud<Alarm>("/api/alarms");
  
  // Modal states & editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  // Form states
  const [title, setTitle] = useState("Despertar");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");
  const [repeat, setRepeat] = useState<"DAILY" | "WEEKLY" | "CUSTOM">("DAILY");
  const [sound, setSound] = useState("default");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [isActive, setIsActive] = useState(true);

  const startCreate = () => {
    setEditingAlarm(null);
    setTitle("Despertar");
    setDescription("");
    // Default tomorrow at 07:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    setDatetime(tomorrow.toISOString().slice(0, 16));
    setRepeat("DAILY");
    setSound("default");
    setPriority("MEDIUM");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const startEdit = (al: Alarm) => {
    setEditingAlarm(al);
    setTitle(al.title);
    setDescription(al.description || "");
    setDatetime(al.datetime ? al.datetime.slice(0, 16) : new Date().toISOString().slice(0, 16));
    setRepeat(al.repeat || "DAILY");
    setSound(al.sound || "default");
    setPriority(al.priority);
    setIsActive(al.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        datetime: new Date(datetime).toISOString(),
        repeat,
        sound,
        priority,
        isActive
      };

      if (editingAlarm) {
        await update(editingAlarm.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // Handled
    }
  };

  const handleToggleActive = async (al: Alarm) => {
    try {
      await update(al.id, { isActive: !al.isActive });
      refresh();
    } catch (err) {
      // Handled
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este alarme permanentemente?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        // Handled
      }
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case "URGENT": return "text-rose-400";
      case "HIGH": return "text-orange-400";
      case "MEDIUM": return "text-amber-400";
      case "LOW": return "text-emerald-400";
    }
  };

  const getRepeatLabel = (r: string) => {
    switch (r) {
      case "DAILY": return "Diariamente";
      case "WEEKLY": return "Semanalmente";
      case "CUSTOM": return "Uso único";
      default: return r;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#E6EDF3] tracking-tight">Despertadores & Alertas</h1>
          <p className="text-xs text-slate-400 mt-1"> Lembretes cronometrados e alarmes matinais de alta prioridade. </p>
        </div>
        
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Configurar Alarme
        </button>
      </div>

      {loading && alarms.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : alarms.length === 0 ? (
        <div className="py-16 bg-[#161B22]/30 border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center">
          <Clock className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-[#E6EDF3] font-display uppercase tracking-widest">Nenhum alarme configurado</h3>
          <p className="text-2xs text-slate-500 mt-1 max-w-xs px-4 leading-relaxed">
            Nenhum alarme ou despertar agendado. Configure seu alarme executivo matinal clicando no botão acima.
          </p>
        </div>
      ) : (
        /* Alarms list grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alarms.map(al => {
            const dateObj = new Date(al.datetime);
            const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const dateStr = dateObj.toLocaleDateString("pt-BR");

            return (
              <div
                key={al.id}
                className={`p-5 rounded-xl border flex items-center justify-between gap-4 transition-colors relative ${
                  al.isActive 
                    ? "bg-[#161B22]/80 border-[#30363D] hover:border-slate-500" 
                    : "bg-[#161B22]/45 border-[#30363D]/65 opacity-60"
                }`}
              >
                {/* Time section */}
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-[#E6EDF3] font-mono leading-none tracking-tight">
                      {timeStr}
                    </span>
                    
                    <button
                      onClick={() => handleToggleActive(al)}
                      className={`p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer text-slate-400 hover:text-white shrink-0`}
                      title={al.isActive ? "Desativar" : "Ativar"}
                    >
                      {al.isActive ? (
                        <Bell size={13} className="text-[#00E676] animate-swing" />
                      ) : (
                        <BellOff size={13} className="text-slate-500" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-xs font-semibold text-[#E6EDF3] leading-none truncate">
                    {al.title}
                  </h3>

                  {al.description && (
                    <p className="text-[10px] text-slate-400 truncate max-w-44 mt-0.5">
                      {al.description}
                    </p>
                  )}

                  {/* Metadata Indicators info */}
                  <div className="flex items-center gap-2 pt-1.5 text-[9px] font-bold text-slate-500">
                    <span className="flex items-center gap-0.5 uppercase tracking-wider text-indigo-400 bg-indigo-900/5 px-1.5 py-0.5 border border-indigo-950 rounded">
                      <RefreshCw size={8} />
                      {getRepeatLabel(al.repeat || "")}
                    </span>
                    <span className={`capitalize flex items-center gap-0.5 font-bold ${getPriorityColor(al.priority)}`}>
                      <AlertOctagon size={8} />
                      {al.priority}
                    </span>
                  </div>
                </div>

                {/* Edit/delete block */}
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <div className="text-[9px] text-slate-500 font-medium mb-1.5 font-mono select-none">
                    {dateStr}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(al)}
                      className="p-1.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(al.id)}
                      className="p-1.5 bg-[#21262D] hover:bg-rose-550 border border-[#30363D] text-rose-450 hover:text-white rounded-lg transition-colors cursor-pointer"
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

      {/* Insert or Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#04060A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingAlarm ? "Editar Alarme Executivo" : "Criar Novo Despertador"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Identificador do Alarme</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Reunião do Conselho, Despertar"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Nota de Despertar</label>
                <input 
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Acordar cedo para yoga"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Data / Hora</label>
                  <input 
                    type="datetime-local"
                    required
                    value={datetime}
                    onChange={e => setDatetime(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Frequência</label>
                  <select 
                    value={repeat}
                    onChange={e => setRepeat(e.target.value as any)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="DAILY">Diariamente</option>
                    <option value="WEEKLY">Semanalmente</option>
                    <option value="CUSTOM">Uso único</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Alarme Som</label>
                  <select 
                    value={sound}
                    onChange={e => setSound(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="default">Corporativo Clássico</option>
                    <option value="pulse">Digital Pulsante</option>
                    <option value="gentle">Zen Suave</option>
                    <option value="urgent">Urgente Alarm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Prioridade / Alerta</label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="LOW">LOW (Silencioso)</option>
                    <option value="MEDIUM">MEDIUM (Padrão)</option>
                    <option value="HIGH">HIGH (Alto impacto)</option>
                    <option value="URGENT">URGENT (Crítico)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1.5">
                <input 
                  type="checkbox"
                  id="alarm-active-chk"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="h-4 w-4 bg-[#0D1117] border border-[#30363D] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 rounded cursor-pointer"
                />
                <label htmlFor="alarm-active-chk" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                  Módulo de Alarme Ativo
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#30363D] mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent hover:bg-slate-800 text-[#C9D1D9] hover:text-[#E6EDF3] border border-[#30363D] font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingAlarm ? "Salvar Alterações" : "Ativar Alarme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
