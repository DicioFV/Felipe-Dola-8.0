// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/productivity/HabitsPage.tsx
// Fase: 2 — Gestão e Rastreamento de Hábitos
// ============================================

import React, { useState } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Habit, HabitFrequency } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Flame, 
  Calendar, 
  Activity, 
  Volume2, 
  X,
  Loader2,
  TrendingUp,
  Award
} from "lucide-react";
import { useToast } from "@/src/components/ui/Toast";

export function HabitsPage() {
  const { data: habits, loading, create, update, remove, refresh, setData } = useCrud<Habit>("/api/habits");
  const { toast } = useToast();
  
  // Modal toggles & edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("DAILY");
  const [category, setCategory] = useState("Saúde");
  const [icon, setIcon] = useState("💪");
  const [color, setColor] = useState("#6C5CE7");

  const startCreate = () => {
    setEditingHabit(null);
    setName("");
    setDescription("");
    setFrequency("DAILY");
    setCategory("Saúde");
    setIcon("💪");
    setColor("#6C5CE7");
    setIsModalOpen(true);
  };

  const startEdit = (h: Habit) => {
    setEditingHabit(h);
    setName(h.name);
    setDescription(h.description || "");
    setFrequency(h.frequency || "DAILY");
    setCategory(h.category || "Saúde");
    setIcon(h.icon || "💪");
    setColor(h.color || "#6C5CE7");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        frequency,
        category,
        icon,
        color
      };

      if (editingHabit) {
        await update(editingHabit.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // Handled
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este hábito e todos os seus históricos de progresso?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        // Handled
      }
    }
  };

  // Toggle completion for today
  const handleToggleToday = async (habit: Habit) => {
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const token = localStorage.getItem("dola_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/habits/${habit.id}/toggle`, {
        method: "POST",
        headers,
        body: JSON.stringify({ date: todayStr })
      });

      if (!response.ok) throw new Error("Erro ao alternar progresso.");

      const updatedHabit = await response.json();
      
      // Update local data state cleanly
      setData(prev => prev.map(h => h.id === habit.id ? updatedHabit : h));
      toast("Progresso do hábito atualizado!", "success");
    } catch (err: any) {
      toast(err.message || "Erro de sincronização", "error");
    }
  };

  // Helper calculating streaks
  const getStreakAndCompletion = (habit: Habit) => {
    const logs = habit.logs || [];
    const todayStr = new Date().toISOString().split("T")[0];
    const isCompletedToday = logs.some(log => log.date.split("T")[0] === todayStr && log.completed);

    // Calculate maximum successive completed days (streak)
    let streak = 0;
    const sortedDates = logs
      .filter(log => log.completed)
      .map(log => log.date.split("T")[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Newest first

    if (sortedDates.length > 0) {
      let checkDate = new Date();
      // If not completed today, check if yesterday was completed to preserve streak, else streak is broke
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const hasToday = sortedDates.includes(todayStr);
      const hasYesterday = sortedDates.includes(yesterdayStr);

      if (hasToday || hasYesterday) {
        let currentIdx = hasToday ? 0 : 0;
        let iteratorDate = hasToday ? new Date() : new Date(Date.now() - 86400000);
        
        while (true) {
          const dateStr = iteratorDate.toISOString().split("T")[0];
          if (sortedDates.includes(dateStr)) {
            streak++;
            iteratorDate.setDate(iteratorDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return { streak, isCompletedToday };
  };

  // Helper to get last 7 days visual tracking list
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Highlight icons available
  const emojiIcons = ["💪", "💧", "🧘", "📚", "🍎", "🏃", "🛌", "🚶", "📈", "🔌", "🎨"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#E6EDF3] tracking-tight">Rastreador de Hábitos</h1>
          <p className="text-xs text-slate-400 mt-1"> Defina rotinas executivas sólidas, impulsione disciplina diária e visualize sua consistência. </p>
        </div>
        
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Criar Novo Hábito
        </button>
      </div>

      {loading && habits.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : habits.length === 0 ? (
        <div className="py-16 bg-[#161B22]/30 border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center">
          <Activity className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-[#E6EDF3] font-display uppercase tracking-widest">Nenhum hábito rastreado</h3>
          <p className="text-2xs text-slate-500 mt-1 max-w-xs px-4 leading-relaxed">
            Nenhuma rotina cadastrada de momento. Comece registrando um hábito básico como Beber Água, Ler ou Dieta Saudável clicando acima.
          </p>
        </div>
      ) : (
        /* Habits list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map(h => {
            const { streak, isCompletedToday } = getStreakAndCompletion(h);
            const logs = h.logs || [];

            return (
              <div
                key={h.id}
                className="p-5 bg-[#161B22]/80 border border-[#30363D] hover:border-slate-500 transition-colors rounded-xl flex flex-col justify-between space-y-5"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                      style={{ backgroundColor: `${h.color}15`, border: `1px solid ${h.color}25` }}
                    >
                      {h.icon || "💪"}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#E6EDF3] font-display">{h.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-64">{h.description || "Sem descrição operacional."}</p>
                    </div>
                  </div>

                  {/* Streak & Edit/Delete actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#21262D] border border-[#30363D] rounded-lg text-[10px] font-bold text-orange-400">
                      <Flame size={12} className="fill-orange-400 animate-pulse" />
                      <span>{streak}d</span>
                    </div>

                    <button
                      onClick={() => startEdit(h)}
                      className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1 text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Tracking bar and check Today */}
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#30363D]/60">
                  {/* Last 7 Days Visual tracking bubbles */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Histórico dos Últimos 7 dias:</span>
                    <div className="flex items-center gap-1.5 select-none pt-0.5">
                      {last7Days.map((day, idx) => {
                        const dayStr = day.toISOString().split("T")[0];
                        const wasCompleted = logs.some(log => log.date.split("T")[0] === dayStr && log.completed);
                        const isToday = idx === 6;

                        return (
                          <div 
                            key={idx} 
                            className="flex flex-col items-center gap-0.5"
                            title={`${day.toLocaleDateString("pt-BR")}: ${wasCompleted ? "Completo" : "Pendente"}`}
                          >
                            <span className="text-[7.5px] scale-90 font-semibold text-slate-600 uppercase block">
                              {day.toLocaleDateString("pt-BR", { weekday: "narrow" })}
                            </span>
                            <div 
                              className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                                wasCompleted 
                                  ? "bg-indigo-650 border-indigo-500 text-white shadow"
                                  : isToday 
                                  ? "bg-transparent border-[#30363D] border-dashed" 
                                  : "bg-[#0D1117] border-[#30363D]"
                              }`}
                            >
                              {wasCompleted && <Check size={8} strokeWidth={4} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BIG Today Toggle Checkbox Button */}
                  <button
                    onClick={() => handleToggleToday(h)}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center gap-2 ${
                      isCompletedToday 
                        ? "bg-emerald-600/15 border border-emerald-500/25 text-emerald-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/15"
                    }`}
                  >
                    <Check size={11} strokeWidth={3} />
                    {isCompletedToday ? "Feito Hoje" : "Marcar Hoje"}
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
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingHabit ? "Editar Rotina de Hábito" : "Modelar Novo Hábito"}
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
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Nome do Hábito</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Praticar Meditação, Beber Água"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Descrição Operacional</label>
                <input 
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Tomar 3 litros ao longo do expediente"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Frequência</label>
                  <select 
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="DAILY">Diário</option>
                    <option value="WEEKLY">Semanal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Setor / Categoria</label>
                  <input 
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Saúde, Trabalho, Mental"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Icon select */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Selo Representativo (Emoji)</label>
                <div className="flex items-center gap-1 flex-wrap mt-1 border border-[#30363D] bg-[#0D1117] p-2 rounded-lg">
                  {emojiIcons.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIcon(item)}
                      className={`w-7 h-7 flex items-center justify-center text-sm select-none rounded cursor-pointer transition-all ${
                        icon === item ? "bg-indigo-600 text-white scale-110" : "hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color color picker */}
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
                  {editingHabit ? "Salvar Alterações" : "Ativar Hábito"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
