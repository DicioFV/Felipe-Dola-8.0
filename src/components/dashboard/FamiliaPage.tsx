// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/FamiliaPage.tsx
// Fase: 6 — Inteligência Executiva Central
// ============================================

import React, { useState } from "react";
import { Users, Plus, Bell, MessageSquare, Flame } from "lucide-react";
import { useToast } from "../ui/Toast";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  status: string;
  streak: number;
}

export function FamiliaPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: "f1",
      name: "Mariana Silva",
      relation: "Cônjuge",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      status: "Foco total na apresentação de amanhã",
      streak: 12
    },
    {
      id: "f2",
      name: "Pedro Silva",
      relation: "Filho",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      status: "Em aula de inglês online",
      streak: 5
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, author: "Mariana", text: "Compras de supermercado agendadas para as 18:30 hoje.", time: "Há 2 horas" },
    { id: 2, author: "Você", text: "Registrei o novo investimento de médio prazo em tesouro.", time: "Há 4 horas" }
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRelation, setMemberRelation] = useState("");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberRelation) {
      toast("Preencha todos os dados corporativos do membro da família.", "warning");
      return;
    }

    const newM: FamilyMember = {
      id: `memb-${Date.now()}`,
      name: memberName,
      relation: memberRelation,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      status: "Pronto para sincronizar hábitos",
      streak: 1
    };

    setMembers([...members, newM]);
    setMemberName("");
    setMemberRelation("");
    toast("Membro da família adicionado ao ecossistema compartilhado!", "success");
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    setAnnouncements([
      {
        id: Date.now(),
        author: "Você",
        text: newAnnouncement,
        time: "Agora mesmo"
      },
      ...announcements
    ]);
    setNewAnnouncement("");
    toast("Aviso postado na central compartilhada!", "success");
  };

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      {/* Description header */}
      <div>
        <h1 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2 font-display uppercase tracking-tight">
          <Users className="text-indigo-400" size={16} /> Central de Compartilhamento Familiar
        </h1>
        <p className="text-[10px] text-slate-400 mt-1">Conecte sua conta com pessoas de sua confiança para compartilhar orçamentos, tarefas conjuntas e objetivos de vida.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column member grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl">
            <h2 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-widest font-display mb-4">Integrantes do Círculo</h2>
            
            <div className="space-y-4">
              {members.map((memb) => (
                <div key={memb.id} className="p-4 bg-[#0B0F1A]/50 border border-[#30363D] hover:border-slate-700 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3">
                    <img src={memb.avatar} alt={memb.name} className="w-10 h-10 rounded-full border border-[#30363D]" referrerPolicy="no-referrer" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-100">{memb.name}</h3>
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-indigo-600/10 text-indigo-400 rounded border border-indigo-500/10 uppercase font-mono">{memb.relation}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">"{memb.status}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-orange-400 bg-orange-500/15 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono">
                    <Flame size={12} className="animate-pulse" />
                    <span>{memb.streak} d</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Form to add family members */}
            <form onSubmit={handleAddMember} className="mt-6 pt-5 border-t border-[#30363D]/60 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Nome do integrante"
                className="flex-1 bg-[#0B0F1A]/80 text-2xs px-3 py-2 border border-[#30363D] focus:border-indigo-500/80 focus:outline-none rounded-xl text-slate-100"
              />
              <input
                type="text"
                value={memberRelation}
                onChange={(e) => setMemberRelation(e.target.value)}
                placeholder="Parentesco (Cônjuge, Filho, etc.)"
                className="flex-1 bg-[#0B0F1A]/80 text-2xs px-3 py-2 border border-[#30363D] focus:border-indigo-500/80 focus:outline-none rounded-xl text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-2xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={12} /> Integrar
              </button>
            </form>
          </div>
        </div>

        {/* Right column announcements and budget */}
        <div className="space-y-6">
          <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl">
            <h2 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-widest font-display mb-4 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-indigo-400" /> Quadro de Avisos
            </h2>

            <form onSubmit={handlePostAnnouncement} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Deixar aviso no painel..."
                className="flex-1 bg-[#0B0F1A]/80 text-2xs px-3 py-2 border border-[#30363D] focus:border-indigo-500/80 focus:outline-none rounded-xl text-slate-100"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </form>

            <div className="space-y-3.5 max-h-[250px] overflow-y-auto">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-[#0B0F1A]/40 border border-[#30363D] rounded-xl text-left">
                  <div className="flex justify-between items-center text-[9px] font-bold text-indigo-400 mb-1">
                    <span>{ann.author}</span>
                    <span className="text-slate-500 font-mono">{ann.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">{ann.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
