// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/productivity/NotesPage.tsx
// Fase: 2 — Gestão de Notas e Pensamentos
// ============================================

import React, { useState } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { Note } from "@/src/types";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Pin, 
  Search, 
  Tag, 
  Hash, 
  FolderOpen,
  X,
  Loader2,
  Inbox,
  CheckCircle2,
  Calendar
} from "lucide-react";

export function NotesPage() {
  const { data: notes, loading, create, update, remove, refresh } = useCrud<Note>("/api/notes");
  
  // State variables for searching/filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  
  // Modal & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Geral");
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState("#161B22");
  const [tagsInput, setTagsInput] = useState("");

  const startCreate = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setCategory("Geral");
    setIsPinned(false);
    setColor("#161B22");
    setTagsInput("");
    setIsModalOpen(true);
  };

  const startEdit = (n: Note) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content || "");
    setCategory(n.category || "Geral");
    setIsPinned(n.isPinned);
    setColor(n.color || "#161B22");
    setTagsInput(n.tags ? n.tags.join(", ") : "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse tags by comma & whitespace
      const tags = tagsInput
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title,
        content,
        category,
        isPinned,
        color,
        tags
      };

      if (editingNote) {
        await update(editingNote.id, payload);
      } else {
        await create(payload);
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // Handled
    }
  };

  const handleTogglePin = async (n: Note) => {
    try {
      await update(n.id, { isPinned: !n.isPinned });
      refresh();
    } catch (err) {
      // Handled
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja deletar esta nota permanentemente?")) {
      try {
        await remove(id);
        refresh();
      } catch (err) {
        // Handled
      }
    }
  };

  // Categories list extraction
  const categories = ["ALL", ...Array.from(new Set(notes.map(n => n.category || "Geral")))];

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(query) || (n.content || "").toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "ALL" || (n.category || "Geral") === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Pins go first, then newest
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Color options
  const colorOptions = [
    { value: "#161B22", label: "Charcoal" },
    { value: "#1A2333", label: "Midnight Blue" },
    { value: "#152E20", label: "Forest" },
    { value: "#2B1D1D", label: "Wine" },
    { value: "#2D1D3A", label: "Royal Amethyst" },
    { value: "#262312", label: "Bronze" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#E6EDF3] tracking-tight">Executive Vault (Notas)</h1>
          <p className="text-xs text-slate-400 mt-1 font-display"> Memorandos confidenciais, notas fiscais, pensamentos rápidos e pautas estratégicas. </p>
        </div>
        
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          Nova Nota / Memo
        </button>
      </div>

      {/* Control Box: Search and category filters */}
      <div className="bg-[#161B22]/60 border border-[#30363D] rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar títulos ou conteúdos das notas..."
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto select-none no-scrollbar py-0.5">
          <FolderOpen size={13} className="text-slate-500 shrink-0" />
          <div className="flex gap-1 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  categoryFilter === cat 
                    ? "bg-[#21262D] text-indigo-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {cat === "ALL" ? "Todas" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && filteredNotes.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 bg-[#161B22]/30 border border-[#30363D] rounded-xl flex flex-col items-center justify-center text-center">
          <Inbox className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-[#E6EDF3] font-display uppercase tracking-widest">Nenhuma nota encontrada</h3>
          <p className="text-2xs text-slate-500 mt-1 max-w-xs px-4 leading-relaxed">
            Nenhum registro confencial ou de rascunhos. Comece criando uma nota estratégica utilizando o botão superior.
          </p>
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredNotes.map(n => (
            <div
              key={n.id}
              style={{ backgroundColor: n.color || "#161B22" }}
              className="border border-[#30363D] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-500 transition-colors duration-150 shadow relative"
            >
              {/* Note Content */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-indigo-400">
                    {n.category || "Geral"}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Pin button */}
                    <button
                      onClick={() => handleTogglePin(n)}
                      className={`p-1 hover:bg-white/10 rounded transition-colors cursor-pointer ${
                        n.isPinned ? "text-[#FFB300]" : "text-slate-500 hover:text-slate-300"
                      }`}
                      title={n.isPinned ? "Desafixar" : "Fixar Nota"}
                    >
                      <Pin size={12} className={n.isPinned ? "fill-[#FFB300]" : ""} />
                    </button>
                    
                    <button
                      onClick={() => startEdit(n)}
                      className="p-1 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 size={12} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 hover:bg-white/10 text-rose-500/85 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-[#E6EDF3] font-display tracking-tight leading-tight">
                  {n.title}
                </h3>

                {n.content && (
                  <p className="text-[10px] text-slate-300 font-medium leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {n.content}
                  </p>
                )}
              </div>

              {/* Tags footer */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                {n.tags && n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 leading-none">
                    {n.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-0.5 text-[8.5px] font-bold text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded capitalize leading-none">
                        <Hash size={7} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-[8px] text-slate-500 leading-none">
                  <span className="flex items-center gap-1">
                    <Calendar size={10} className="text-slate-600" />
                    {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insert or Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#04060A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 font-sans">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingNote ? "Editar Memorando e Anotações" : "Criar Novo Registo Confidencial"}
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
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Título do Memorando</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Estatuto Social - Novas Metas Q3"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Anotações / Conteúdo</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Seu rascunho de forma estritamente confidencial..."
                  rows={5}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Pasta / Categoria</label>
                  <input 
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Geral, Pessoal, Board"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Tags (Separadas por vírgula)</label>
                  <input 
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="ideia, finanças, board"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Color options selection */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-display">Estilo / Cor Temática</label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {colorOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      style={{ backgroundColor: opt.value }}
                      className={`w-6 w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        color === opt.value ? "border-indigo-500 scale-110" : "border-[#30363D] hover:scale-105"
                      }`}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1.5">
                <input 
                  type="checkbox"
                  id="not-pinned-chk"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="h-4 w-4 bg-[#0D1117] border border-[#30363D] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 rounded cursor-pointer"
                />
                <label htmlFor="not-pinned-chk" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                  Manter no topo (Fixar Memo)
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
                  {editingNote ? "Salvar Alterações" : "Segurar no Cofre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
