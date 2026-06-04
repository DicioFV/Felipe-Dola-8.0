// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/productivity/TasksPage.tsx
// Fase: 2 — Gestão de Tarefas
// ============================================

import React, { useState } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Task, TaskStatus, Priority } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square,
  Calendar, 
  AlertTriangle, 
  Tag, 
  CheckCircle2, 
  Inbox, 
  ChevronRight,
  Filter,
  X,
  Loader2,
  Clock
} from "lucide-react";

export function TasksPage() {
  const { data: tasks, loading, create, update, remove, refresh } = useCrud<Task>("/api/tasks");
  
  // States for filters & creation
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TODO" | "DOING" | "DONE">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | Priority>("ALL");
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [category, setCategory] = useState("Geral");
  const [dueDate, setDueDate] = useState("");

  const startCreate = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("MEDIUM");
    setCategory("Geral");
    setDueDate("");
    setIsModalOpen(true);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setCategory(task.category || "Geral");
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        status,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      };

      if (editingTask) {
        await update(editingTask.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // Handled by toast
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await update(task.id, { status: newStatus });
      refresh();
    } catch (err) {
      // Handled by toast
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja deletar esta tarefa permanentemente?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        // Handled
      }
    }
  };

  // Filters logic
  const filteredTasks = tasks.filter(t => {
    const statusMatch = statusFilter === "ALL" || t.status === statusFilter;
    const priorityMatch = priorityFilter === "ALL" || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getPriorityBadgeColors = (p: Priority) => {
    switch (p) {
      case "URGENT": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "HIGH": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "MEDIUM": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "LOW": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#E6EDF3] tracking-tight">Painel de Tarefas</h1>
          <p className="text-xs text-slate-400 mt-1"> Organize, agende e priorize suas metas de alto executivo com facilidade. </p>
        </div>
        
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Nova Tarefa
        </button>
      </div>

      {/* Filter and Stats controls */}
      <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters buttons */}
          <div className="flex bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            {(["ALL", "TODO", "DOING", "DONE"] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  statusFilter === f 
                    ? "bg-[#21262D] text-indigo-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {f === "ALL" ? "Todas" : f === "TODO" ? "A Fazer" : f === "DOING" ? "Fazendo" : "Concluídas"}
              </button>
            ))}
          </div>

          {/* Priority Filters Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0D1117] px-3 py-1 rounded-lg border border-[#30363D] text-[10px] font-bold uppercase text-slate-400">
            <Filter size={10} />
            Prioridade:
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="bg-transparent text-indigo-400 focus:outline-none border-none pl-1 cursor-pointer font-bold"
            >
              <option value="ALL" className="bg-[#161B22] text-slate-300">Todas</option>
              <option value="LOW" className="bg-[#161B22] text-[#00E676]">LOW</option>
              <option value="MEDIUM" className="bg-[#161B22] text-[#FFB300]">MEDIUM</option>
              <option value="HIGH" className="bg-[#161B22] text-[#FB8C00]">HIGH</option>
              <option value="URGENT" className="bg-[#161B22] text-[#FF5252]">URGENT</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Mini bento */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-pulse" />
            Pendentes: <b>{tasks.filter(t => t.status !== "DONE").length}</b>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Concluídas: <b>{tasks.filter(t => t.status === "DONE").length}</b>
          </div>
        </div>
      </div>

      {loading && filteredTasks.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 bg-[#161B22]/30 border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center">
          <Inbox className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-[#E6EDF3] font-display uppercase tracking-widest">Nenhuma tarefa encontrada</h3>
          <p className="text-2xs text-slate-500 mt-1 max-w-xs px-4 leading-relaxed">
            Nenhuma tarefa pendente com os filtros informados. Clique no botão "Nova Tarefa" no topo para inserir uma atividade.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map(t => (
            <div
              key={t.id}
              className={`p-4 bg-[#161B22]/80 border rounded-xl flex items-center justify-between gap-4 group transition-colors ${
                t.status === "DONE" 
                  ? "border-[#30363D]/60 opacity-60 hover:bg-[#161B22]/90" 
                  : "border-[#30363D] hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Standard Toggle Checkbox */}
                <button
                  onClick={() => handleToggleComplete(t)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer shrink-0"
                >
                  {t.status === "DONE" ? (
                    <CheckSquare size={18} className="text-indigo-400" />
                  ) : (
                    <Square size={18} className="text-slate-500" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      getPriorityBadgeColors(t.priority)
                    }`}>
                      {t.priority}
                    </span>
                    
                    {t.category && (
                      <span className="flex items-center gap-1 text-[8.5px] font-bold text-indigo-400 bg-indigo-900/10 border border-indigo-950 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        <Tag size={8} />
                        {t.category}
                      </span>
                    )}

                    {t.dueDate && (
                      <span className="flex items-center gap-1 text-[8.5px] text-slate-500">
                        <Clock size={8} />
                        Limite: {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xs font-semibold text-[#E6EDF3] leading-normal truncate ${
                    t.status === "DONE" ? "line-through text-slate-500" : ""
                  }`}>
                    {t.title}
                  </h3>
                  
                  {t.description && (
                    <p className={`text-[10px] text-slate-400 mt-0.5 leading-relaxed truncate max-w-xl ${
                      t.status === "DONE" ? "line-through text-slate-600" : ""
                    }`}>
                      {t.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(t)}
                  className="p-1.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Editar Tarefa"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 bg-[#21262D] hover:bg-rose-550 border border-[#30363D] text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Apagar Tarefa"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insert or Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#04060A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingTask ? "Editar Parâmetros de Tarefa" : "Criar Nova Atividade"}
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
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Título da Tarefa</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Revisar faturamento mensal Q2"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Descrição Operacional</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais e ações estratégicas..."
                  rows={3}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Status Corrente</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="TODO">TODO (A Fazer)</option>
                    <option value="DOING">DOING (Em progresso)</option>
                    <option value="DONE">DONE (Concluído)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Prioridade</label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="LOW">LOW (Baixa)</option>
                    <option value="MEDIUM">MEDIUM (Média)</option>
                    <option value="HIGH">HIGH (Alta)</option>
                    <option value="URGENT">URGENT (Crítica)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Categoria / Tag</label>
                  <input 
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Trabalho, Finanças, Saúde"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Data de Vencimento</label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
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
                  {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
