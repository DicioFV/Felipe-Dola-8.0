// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/productivity/AgendaPage.tsx
// Fase: 2 — Gestão da Agenda
// ============================================

import React, { useState } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Event, EventType } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  MapPin, 
  Clock, 
  Flag,
  User, 
  Briefcase,
  Heart,
  DollarSign,
  Users,
  X,
  Loader2,
  ChevronRight
} from "lucide-react";

export function AgendaPage() {
  const { data: events, loading, create, update, remove, refresh } = useCrud<Event>("/api/events");
  
  // Filters & creation
  const [typeFilter, setTypeFilter] = useState<"ALL" | EventType>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<EventType>("PERSONAL");
  const [color, setColor] = useState("#6C5CE7");
  const [isRecurring, setIsRecurring] = useState(false);

  const startCreate = () => {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setStartDate(new Date().toISOString().slice(0, 16)); // Today
    setEndDate("");
    setLocation("");
    setType("PERSONAL");
    setColor("#6C5CE7");
    setIsRecurring(false);
    setIsModalOpen(true);
  };

  const startEdit = (ev: Event) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDescription(ev.description || "");
    setStartDate(ev.startDate ? ev.startDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
    setEndDate(ev.endDate ? ev.endDate.slice(0, 16) : "");
    setLocation(ev.location || "");
    setType(ev.type);
    setColor(ev.color || "#6C5CE7");
    setIsRecurring(ev.isRecurring);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        location,
        type,
        color,
        isRecurring
      };

      if (editingEvent) {
        await update(editingEvent.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // Handled by toast inside useCrud
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este compromisso da sua agenda permanentemente?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        // Handled
      }
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "BUSINESS": return <Briefcase size={14} className="text-blue-400" />;
      case "PERSONAL": return <User size={14} className="text-purple-400" />;
      case "FAMILY": return <Users size={14} className="text-pink-400" />;
      case "FINANCIAL": return <DollarSign size={14} className="text-emerald-400" />;
      case "HEALTH": return <Heart size={14} className="text-[#FF5252]" />;
    }
  };

  const getEventTypeName = (type: EventType) => {
    switch (type) {
      case "BUSINESS": return "Negócios";
      case "PERSONAL": return "Pessoal";
      case "FAMILY": return "Família";
      case "FINANCIAL": return "Financeiro";
      case "HEALTH": return "Saúde";
    }
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    return typeFilter === "ALL" || e.type === typeFilter;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#E6EDF3] tracking-tight">Agenda Integrada</h1>
          <p className="text-xs text-slate-400 mt-1"> Reuniões corporativas, auditorias financeiras e cuidados com a saúde pessoal. </p>
        </div>
        
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Novo Compromisso
        </button>
      </div>

      {/* Filter and stats */}
      <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1 mr-1">Filtrar por Tipo:</div>
          <div className="flex flex-wrap gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                typeFilter === "ALL" 
                  ? "bg-[#21262D] text-indigo-400 font-extrabold"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              Todos
            </button>
            {(["PERSONAL", "BUSINESS", "FAMILY", "FINANCIAL", "HEALTH"] as EventType[]).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  typeFilter === t 
                    ? "bg-[#21262D] text-indigo-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {getEventIcon(t)}
                <span>{getEventTypeName(t)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic event count */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium pr-1">
          <Calendar size={14} className="text-indigo-500" />
          Compromissos agendados: <b>{filteredEvents.length}</b>
        </div>
      </div>

      {loading && filteredEvents.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 bg-[#161B22]/30 border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center">
          <Calendar className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-[#E6EDF3] font-display uppercase tracking-widest">Nenhum compromisso agendado</h3>
          <p className="text-2xs text-slate-500 mt-1 max-w-xs px-4 leading-relaxed">
            Sua agenda está livre. Adicione compromissos importantes como reuniões, pagamentos ou treinos clicando no botão acima.
          </p>
        </div>
      ) : (
        /* Event timeline styled list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(ev => {
            const evDate = new Date(ev.startDate);
            const dateStr = evDate.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
            const timeStr = evDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={ev.id}
                className="p-5 bg-[#161B22]/80 border border-[#30363D] hover:border-slate-600 transition-colors rounded-xl flex items-start gap-4"
              >
                {/* Visual Left Badge reflecting event dates */}
                <div className="text-center bg-[#0D1117] border border-[#30363D] rounded-lg p-2 min-w-16 select-none shadow">
                  <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{dateStr.split(" ")[0]}</span>
                  <span className="block text-sm font-extrabold text-[#E6EDF3] mt-0.5">{dateStr.split(" ")[1]}</span>
                  <span className="block text-[8px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">{dateStr.split(" ")[2]}</span>
                </div>

                {/* Event core info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span 
                      className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1"
                      style={{ backgroundColor: `${ev.color}15`, color: ev.color }}
                    >
                      {getEventTypeName(ev.type)}
                    </span>
                    {ev.isRecurring && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                        Recorrente
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-[#E6EDF3] truncate pr-1">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed truncate max-w-sm">
                      {ev.description}
                    </p>
                  )}

                  {/* Foot metadata */}
                  <div className="flex flex-wrap gap-2.5 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-600" />
                      {timeStr}
                    </span>
                    {ev.location && (
                      <span className="flex items-center gap-1 truncate max-w-36">
                        <MapPin size={11} className="text-slate-600 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(ev)}
                    className="p-1.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Editar Compromisso"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 bg-[#21262D] hover:bg-rose-550 border border-[#30363D] text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Remover Compromisso"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insert or Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#04060A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingEvent ? "Editar Parâmetros de Evento" : "Instanciar Novo Evento"}
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
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Título do Compromisso</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Reunião do Conselho Adm"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Descrição Executiva</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Pauta da reunião, links de acesso ou pormenores..."
                  rows={2}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Início do Evento</label>
                  <input 
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Previsão Fim</label>
                  <input 
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Localização / Link de Conexão</label>
                <input 
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex: Google Meet, Sala Executiva 3B"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Classificação</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as EventType)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="PERSONAL">Pessoal</option>
                    <option value="BUSINESS">Negócios</option>
                    <option value="FAMILY">Família</option>
                    <option value="FINANCIAL">Financeiro</option>
                    <option value="HEALTH">Saúde</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Cor Temática</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-8 h-8 rounded border border-[#30363D] bg-transparent cursor-pointer"
                    />
                    <span className="text-2xs text-slate-450 uppercase font-mono">{color}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1.5">
                <input 
                  type="checkbox"
                  id="evt-recurring-chk"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 bg-[#0D1117] border border-[#30363D] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 rounded cursor-pointer"
                />
                <label htmlFor="evt-recurring-chk" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                  Evento Recorrente (Semanal / Mensal)
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
                  {editingEvent ? "Salvar Alterações" : "Iniciar Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
