// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/admin/UsersPage.tsx
// Fase: 2 — Administração de Usuários
// ============================================

import React, { useState } from "react";
import { useCrud } from "@/src/hooks/useCrud";
import { User, Role } from "@/src/types";
import { useAuth } from "@/src/hooks/useAuth";
import { Badge } from "@/src/components/ui/Badge";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  User as UserIcon,
  X,
  Loader2
} from "lucide-react";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, loading, create, update, remove, refresh } = useCrud<User>("/api/users");
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"GRID" | "PLANILHA">("PLANILHA");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isActive, setIsActive] = useState(true);

  const startCreate = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    setPhone("");
    setAvatar("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Do not prefill password for safety
    setRole(user.role);
    setPhone(user.phone || "");
    setAvatar(user.avatar || "");
    setIsActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updatePayload: any = {
          name,
          email,
          role,
          phone,
          avatar,
          isActive
        };
        if (password) updatePayload.password = password; // Only update password if provided
        
        await update(editingUser.id, updatePayload);
      } else {
        await create({
          name,
          email,
          password: password || "123456",
          role,
          phone,
          avatar,
          isActive: true
        });
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      // Error handles inside useCrud toast
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Deseja realmente remover este usuário do sistema? Esta ação apagará em cascata todas as suas tarefas, eventos, notas, alarmes e outros recursos de forma definitiva.")) {
      try {
        await remove(userId);
        refresh();
      } catch (err) {
        // Error already handled
      }
    }
  };

  if (currentUser?.role !== "SUPERADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-md text-center">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-lg font-bold text-rose-400 mb-2 font-display">Acesso Restrito</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seu nível de acesso ({currentUser?.role}) não possui permissão para visualizar ou gerenciar a base de usuários do sistema. Apenas o <strong className="text-slate-200">Super Admin</strong> pode acessar este painel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#E6EDF3] tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de usuários autorizados a acessar o Dola AI Executive Assistant (Máximo 6 contas).
          </p>
        </div>
        
        {users.length < 6 && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
          >
            <UserPlus size={14} />
            Adicionar Usuário
          </button>
        )}
      </div>

      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Dashboard Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#161B22]/60 border border-[#30363D] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total de Contas</span>
                <p className="text-2xl font-black text-[#E6EDF3] mt-1">{users.length} <span className="text-xs text-slate-500 font-normal">/ 6</span></p>
              </div>
              <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-lg">
                <UserIcon size={18} />
              </div>
            </div>
            
            <div className="p-4 bg-[#161B22]/60 border border-[#30363D] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Administradores</span>
                <p className="text-2xl font-black text-[#E6EDF3] mt-1">
                  {users.filter(u => u.role === "SUPERADMIN" || u.role === "ADMIN").length}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-lg">
                <Shield size={18} />
              </div>
            </div>

            <div className="p-4 bg-[#161B22]/60 border border-[#30363D] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contas Ativas</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="p-2.5 bg-teal-600/10 text-teal-400 rounded-lg">
                <CheckCircle size={18} />
              </div>
            </div>
          </div>

          {/* Alternador de Visualização em Planilha / Grid */}
          <div className="flex justify-between items-center gap-2 bg-[#161B22]/30 p-2.5 border border-[#30363D] rounded-xl mb-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">
              💼 Administrador: Registro Geral do DOLA AI
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("PLANILHA")}
                className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  viewMode === "PLANILHA"
                    ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/20"
                    : "bg-[#0F141F] text-slate-500 border-slate-800"
                }`}
              >
                📊 Planilha Executiva (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  viewMode === "GRID"
                    ? "bg-indigo-600/15 text-indigo-400 border-indigo-500/20"
                    : "bg-[#0F141F] text-slate-500 border-slate-800"
                }`}
              >
                🗂️ Cards de Perfil
              </button>
            </div>
          </div>

          {viewMode === "GRID" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map(u => (
              <div 
                key={u.id}
                className="bg-[#161B22]/80 border border-[#30363D] rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                {/* User Info Section */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                          alt={u.name} 
                          className="w-12 h-12 rounded-full border border-[#30363D] object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#161B22] ${u.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#E6EDF3] font-display">{u.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            u.role === "SUPERADMIN" 
                              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" 
                              : u.role === "ADMIN" 
                              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEdit(u)}
                        className="p-1.5 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] hover:text-[#E6EDF3] rounded-lg transition-colors cursor-pointer"
                        title="Editar Usuário"
                      >
                        <Edit3 size={12} />
                      </button>
                      
                      {u.id !== "superadmin-01" && u.id !== currentUser.id && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 bg-[#21262D] hover:bg-rose-550 border border-rose-900/40 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Remover Usuário"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1.5 pt-2 border-t border-[#30363D]/65 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-500 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-500 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="px-5 py-2.5 bg-[#0D1117]/60 border-t border-[#30363D]/65 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Última atualização: {new Date(u.updatedAt).toLocaleDateString("pt-BR")}</span>
                  <span className={`font-bold uppercase tracking-widest flex items-center gap-1 ${u.isActive ? "text-emerald-500" : "text-rose-500"}`}>
                    {u.isActive ? (
                      <>
                        <CheckCircle size={10} />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle size={10} />
                        Inativo
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
          ) : (
            /* Planilha Spreadsheet View */
            <div className="border border-[#30363D] bg-[#0E1117] rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
              {/* Spreadsheet Bar Accent */}
              <div className="bg-[#107C41] text-white p-3.5 flex justify-between items-center text-xs font-semibold select-none border-b border-[#30363D]">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">📄</span>
                  <span className="font-sans font-bold tracking-tight text-white">DolaAI_Privacidade_Usuarios_Master.xlsx</span>
                </div>
                <Badge className="bg-white/10 text-emerald-200 border-none text-[8px] uppercase tracking-wider py-0.5 px-2.5 font-mono select-none">
                  Planilha Excel Live Sync via LocalDB (Contas de Acesso Máx: 5)
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-[#161B22]/90 border-b border-[#30363D] divide-x divide-[#30363D]">
                      <th className="p-2.5 text-slate-500 text-center w-10 bg-[#0B0F1A]/50 font-bold">#</th>
                      <th className="p-2.5 text-slate-305 text-slate-300 font-bold uppercase tracking-wider pl-3">A - Nome Completo / Login</th>
                      <th className="p-2.5 text-slate-305 text-slate-300 font-bold uppercase tracking-wider pl-3">B - E-mail Cadastrado</th>
                      <th className="p-2.5 text-slate-305 text-slate-300 font-bold uppercase tracking-wider pl-3">C - Nível Administrativo</th>
                      <th className="p-2.5 text-slate-305 text-slate-300 font-bold uppercase tracking-wider pl-3">D - Registro Telefônico</th>
                      <th className="p-2.5 text-slate-305 text-slate-300 font-bold uppercase tracking-wider pl-3">E - Estado da Conta</th>
                      <th className="p-3 text-slate-305 text-slate-300 font-bold uppercase tracking-wider text-center w-28">F - Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D]/65 divide-x divide-[#30363D]/65 bg-[#060811]/40">
                    {users.map((u, idx) => (
                      <tr key={u.id} className="hover:bg-slate-800/10 transition-colors divide-x divide-[#30363D]/40">
                        <td className="p-2.5 text-center text-slate-600 font-bold select-none bg-[#161B22]/30">{idx + 1}</td>
                        <td className="p-2.5 text-[#E6EDF3] font-sans font-bold pl-3">{u.name}</td>
                        <td className="p-2.5 text-indigo-400 pl-3 font-mono text-[10.5px] font-semibold">{u.email}</td>
                        <td className="p-2.5 pl-3">
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            u.role === "SUPERADMIN" 
                              ? "bg-indigo-650/30 text-indigo-400 border border-indigo-500/10" 
                              : u.role === "ADMIN" 
                              ? "bg-emerald-650/30 text-emerald-400 border border-emerald-500/10"
                              : "bg-[#161B22] text-slate-400 border border-slate-700/50"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 font-mono pl-3">{u.phone || "---"}</td>
                        <td className="p-2.5 pl-3">
                          <span className={`font-sans font-bold text-[8.5px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-900/40 ${u.isActive ? "text-emerald-400" : "text-rose-500"}`}>
                            {u.isActive ? "● ATIVO (OK)" : "○ INATIVO"}
                          </span>
                        </td>
                        <td className="p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => startEdit(u)}
                              className="p-1 bg-[#161B22] hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] hover:text-[#E6EDF3] rounded transition cursor-pointer"
                              title="Editar Linha"
                            >
                              <Edit3 size={11} />
                            </button>
                            {u.id !== "superadmin-01" && u.id !== currentUser.id && (
                              <button 
                                type="button"
                                onClick={() => handleDelete(u.id)}
                                className="p-1 bg-[#161B22] hover:bg-rose-500/15 border border-[#30363D] text-rose-450 hover:text-white rounded transition cursor-pointer"
                                title="Excluir Linha"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Preenche com linhas vazias para obter o visual autêntico de planilha */}
                    {Array.from({ length: Math.max(0, 8 - users.length) }).map((_, emptyIdx) => (
                      <tr key={`empty-${emptyIdx}`} className="divide-x divide-[#30363D]/40 bg-transparent opacity-10 font-sans">
                        <td className="p-2 text-center text-slate-700 select-none bg-slate-900/20 font-mono">{users.length + emptyIdx + 1}</td>
                        <td className="p-2 text-slate-600 pl-3">---</td>
                        <td className="p-2 text-slate-600 pl-3">---</td>
                        <td className="p-2 text-slate-600 pl-3">---</td>
                        <td className="p-2 text-slate-600 pl-3">---</td>
                        <td className="p-2 text-slate-600 pl-3">---</td>
                        <td className="p-2 text-slate-600 text-center">---</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* modal - Insert or Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#04060A]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h2 className="text-sm font-bold font-display text-[#E6EDF3] tracking-tight uppercase">
                {editingUser ? "Editar Configurações de Usuário" : "Criar Nova Credencial"}
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
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Dr. Roberto Alencar"
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">E-mail</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@dominio.com"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Contato Telefonico</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+55 (11) 99999-9999"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Senha {editingUser && <span className="text-[9px] text-[#FF5252] font-normal leading-none">(Deixe vazio para não alterar)</span>}
                </label>
                <input 
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={editingUser ? "Nova senha secreta..." : "Mínimo 6 caracteres"}
                  className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Nível de Permissão</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="USER">USER (Padrão)</option>
                    <option value="ADMIN">ADMIN (Moderador)</option>
                    <option value="SUPERADMIN">SUPERADMIN (Controle Total)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">URL da Imagem / Avatar</label>
                  <input 
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {editingUser && editingUser.id !== "superadmin-01" && (
                <div className="flex items-center gap-2.5 pt-1.5">
                  <input 
                    type="checkbox"
                    id="user-active-chk"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="h-4 w-4 bg-[#0D1117] border border-[#30363D] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 rounded cursor-pointer"
                  />
                  <label htmlFor="user-active-chk" className="text-xs text-slate-300 font-medium select-none cursor-pointer">
                    Conta Habilitada e Ativa (Permite Acesso)
                  </label>
                </div>
              )}

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
                  {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
