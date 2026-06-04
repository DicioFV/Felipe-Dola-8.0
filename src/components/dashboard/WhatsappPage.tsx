// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/WhatsappPage.tsx
// Fase: 7 — WhatsApp Notification & Reminders Hub (100% Grátis)
// ============================================

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Calendar, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  User,
  Bell,
  BadgeAlert
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  role: "Pessoal" | "Familiar" | "Sócio" | "Outro";
  active: boolean;
}

interface AlertTemplate {
  id: string;
  title: string;
  triggerEvent: string;
  messagePattern: string;
  lastSent?: string;
}

export function WhatsappPage() {
  const { toast } = useToast();

  // Contatos salvos localmente
  const [contacts, setContacts] = useState<WhatsAppContact[]>([
    { id: "1", name: "Minha Linha DOLA ME", phone: "+55 (11) 99999-1234", role: "Pessoal", active: true },
    { id: "2", name: "Cônjuge (Família)", phone: "+55 (11) 98888-5678", role: "Familiar", active: true },
    { id: "3", name: "Sócio Comercial", phone: "+55 (11) 97777-4321", role: "Sócio", active: false }
  ]);

  // Alertas padrão predefinidos
  const [templates, setTemplates] = useState<AlertTemplate[]>([
    { 
      id: "tpl_1", 
      title: "🚨 Boleto Vence Amanhã", 
      triggerEvent: "24h antes do vencimento", 
      messagePattern: "Olá {nome}! O DOLA AI informa que a fatura do {servico} no valor de {valor} vence AMANHÃ ({data}). Evite juros de atraso! Clique para pagar." 
    },
    { 
      id: "tpl_2", 
      title: "⏰ Alerta de Vencimento (Dia)", 
      triggerEvent: "Dia do vencimento (Manhã/Tarde/Noite)", 
      messagePattern: "⚠️ ATENÇÃO {nome}! Seu compromisso {servico} vence HOJE. Pague antes das 20h para evitar multas. Retorne com 'OK Pago' para desativar." 
    },
    { 
      id: "tpl_3", 
      title: "🎯 Meta Patrimonial Atingida", 
      triggerEvent: "Incremento de aportes", 
      messagePattern: "🚀 Parabéns {nome}! Sua meta patrimonial '{meta}' recebeu um novo aporte e atingiu {progresso}% do objetivo consolidado! Continue firme." 
    },
    { 
      id: "tpl_4", 
      title: "🎲 Roleta Inteligente — Pendente", 
      triggerEvent: "Atividade atrasada há 3+ dias", 
      messagePattern: "🧠 DOLA AI: Oi {nome}, notei que a atividade '{tarefa}' está acumulando poeira. Que tal resolver isso agora e manter seu foco intacto?" 
    }
  ]);

  // Estados de formulário de contato
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRole, setNewContactRole] = useState<"Pessoal" | "Familiar" | "Sócio" | "Outro">("Pessoal");

  // Estados do simulador ativo
  const [selectedContact, setSelectedContact] = useState<string>("1");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tpl_2");
  
  // Customizadores da simulação do preview
  const [customServico, setCustomServico] = useState("Cartão Nubank");
  const [customValor, setCustomValor] = useState("R$ 1.849,50");
  const [customData, setCustomData] = useState("12/10");
  const [customMeta, setCustomMeta] = useState("Compra do Carro");
  const [customProgresso, setCustomProgresso] = useState("75");
  const [customTarefa, setCustomTarefa] = useState("Revisar Planilha de Custos");

  // Carregar contatos customizados se existirem
  useEffect(() => {
    const cached = localStorage.getItem("dola_whatsapp_contacts");
    if (cached) {
      try {
        setContacts(JSON.parse(cached));
      } catch (e) {
        console.error("Erro restaurando contatos", e);
      }
    }
  }, []);

  const saveContacts = (newList: WhatsAppContact[]) => {
    setContacts(newList);
    localStorage.setItem("dola_whatsapp_contacts", JSON.stringify(newList));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) {
      toast("Preencha o nome e o celular de destino!", "warning");
      return;
    }

    const cleanPhone = newContactPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast("O número precisa ter DDD e formato válido!", "warning");
      return;
    }

    const formattedPhone = `+55 (${cleanPhone.slice(2, 4)}) ${cleanPhone.slice(4, 9)}-${cleanPhone.slice(9)}`;
    const newContact: WhatsAppContact = {
      id: String(Date.now()),
      name: newContactName,
      phone: newContactPhone.startsWith("+") ? newContactPhone : `+55 ${cleanPhone}`,
      role: newContactRole,
      active: true
    };

    saveContacts([...contacts, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    toast("Contato de WhatsApp registrado com sucesso!", "success");
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
    toast("Contato removido do Hub.", "info");
  };

  const handleToggleContact = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, active: !c.active } : c);
    saveContacts(updated);
    toast("Estado do contato alterado.", "success");
  };

  // Processamento do Template dinâmico
  const activeContact = contacts.find(c => c.id === selectedContact) || contacts[0];
  const activeTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const processedMessage = React.useMemo(() => {
    if (!activeTemplate || !activeContact) return "";
    let msg = activeTemplate.messagePattern;
    msg = msg.replace(/{nome}/g, activeContact.name);
    msg = msg.replace(/{servico}/g, customServico);
    msg = msg.replace(/{valor}/g, customValor);
    msg = msg.replace(/{data}/g, customData);
    msg = msg.replace(/{meta}/g, customMeta);
    msg = msg.replace(/{progresso}/g, customProgresso);
    msg = msg.replace(/{tarefa}/g, customTarefa);
    return msg;
  }, [activeContact, activeTemplate, customServico, customValor, customData, customMeta, customProgresso, customTarefa]);

  // Função core de disparo 100% Grátis: Abre interface do WhatsApp Web ou Mobile com texto preenchido
  const handleTriggerFreeMessage = () => {
    if (!activeContact) {
      toast("Não há contatos válidos configurados!", "warning");
      return;
    }
    
    const rawNumber = activeContact.phone.replace(/\D/g, "");
    const encodedText = encodeURIComponent(processedMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${encodedText}`;
    
    // Atualiza estatística de envio
    const updatedTpls = templates.map(t => t.id === activeTemplate.id ? { ...t, lastSent: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) } : t);
    setTemplates(updatedTpls);
    
    // Abrir em uma nova aba
    window.open(whatsappUrl, "_blank");
    toast(`Mensagem gratuita gerada para ${activeContact.name}!`, "success");
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] p-6">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-200 flex items-center gap-2">
              <MessageSquare size={22} className="text-emerald-400 animate-pulse" />
              Notificações & Alertas WhatsApp <span className="text-2xs bg-emerald-500/15 text-emerald-400 py-0.5 px-2.5 rounded-full font-mono uppercase font-black">100% Grátis</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Envie lembretes ilimitados sem custos atrelando os gatilhos inteligentes à sua conta do WhatsApp
            </p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold py-1 px-3 text-2xs uppercase">
            Canal Direto Ativo 🟩
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Esquerdo: Cadastro de Contatos e Lista de Templates (7 Colunas) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cadastro de Alvos */}
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">👥 Contatos e Alvos Cadastrados</CardTitle>
              <CardDescription>Cadastre as pessoas autorizadas a receber os lembretes ou configure seu próprio número</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              
              {/* Formulário In-line */}
              <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0B0F1A]/40 p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Nome do contato (Ex: João Escritório)"
                  className="bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-xl px-3 py-1.5 outline-none text-slate-300"
                />
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="DDD + Celular (Ex: 11988881234)"
                  className="bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-xl px-3 py-1.5 outline-none text-slate-300 font-mono"
                />
                <div className="flex gap-1.5">
                  <select
                    value={newContactRole}
                    onChange={(e: any) => setNewContactRole(e.target.value)}
                    className="bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-xl px-2 py-1.5 outline-none cursor-pointer text-slate-400 flex-1"
                  >
                    <option value="Pessoal">Pessoal</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Sócio">Sócio</option>
                    <option value="Outro">Outro</option>
                  </select>
                  <Button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-3xs py-1.5 px-3 rounded-xl transition"
                  >
                    <Plus size={12} />
                  </Button>
                </div>
              </form>

              {/* Lista de Contatos */}
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div 
                    key={c.id} 
                    className="flex justify-between items-center p-3 rounded-xl bg-[#0B0F1A]/45 border border-[#30363D] hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-900 rounded-lg text-slate-400 shrink-0">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-2xs font-bold text-slate-200">{c.name}</p>
                          <Badge variant={c.role === "Pessoal" ? "success" : c.role === "Familiar" ? "info" : "warning"} className="text-[7.5px] uppercase py-0 px-1 border-none leading-none">
                            {c.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleContact(c.id)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border cursor-pointer select-none ${
                          c.active 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {c.active ? "Ativo" : "Pausado"}
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        disabled={contacts.length <= 1}
                        className="p-1 px-1.5 bg-slate-800 text-rose-500 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-25 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Regra de Envio */}
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">⚙️ Gatilhos & Eventos Mapeados</CardTitle>
              <CardDescription>Estes são os tipos de notificações que o DOLA AI monta de forma contextual</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-3 rounded-xl bg-[#0B0F1A]/40 border border-[#30363D] flex justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-2xs font-bold text-slate-200">{tpl.title}</h4>
                      <Badge className="bg-indigo-500/10 text-indigo-400 text-[8px] uppercase tracking-wider border-none leading-none">
                        Gatidho: {tpl.triggerEvent}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium bg-slate-900/30 p-2 border border-slate-800/60 rounded-lg">
                      {tpl.messagePattern}
                    </p>
                  </div>
                  {tpl.lastSent && (
                    <span className="text-[8px] font-mono font-bold text-emerald-400 shrink-0 self-start mt-0.5">
                      Enviado: {tpl.lastSent}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: simulador e Disparador de Alertas (5 Colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">⚡ Testador & Simulador de Mensagem</CardTitle>
              <CardDescription>Formate e envie uma mensagem teste instantaneamente</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              
              {/* Selecionar Alvo */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Destinatário:</label>
                <select
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-2xs rounded-xl p-2 h-9 outline-none cursor-pointer text-slate-300"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Selecionar Template */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Tipo de Alerta:</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-[#0B0F1A] border border-[#30363D] text-2xs rounded-xl p-2 h-9 outline-none cursor-pointer text-slate-300"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Parâmetros do Lembrete */}
              <div className="border-t border-[#30363D]/60 pt-4 space-y-3">
                <p className="text-[10px] font-bold text-[#A55EEA] uppercase tracking-wide">🔧 Variáveis de Texto:</p>
                
                {/* Gatilho Vencimento de Boletos */}
                {(selectedTemplate === "tpl_1" || selectedTemplate === "tpl_2") && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold">Cobrança/Serviço</span>
                      <input 
                        type="text" 
                        value={customServico}
                        onChange={(e) => setCustomServico(e.target.value)}
                        className="w-full bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-lg px-2.5 py-1 text-slate-300 h-8"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold">Valor Mensal</span>
                      <input 
                        type="text" 
                        value={customValor}
                        onChange={(e) => setCustomValor(e.target.value)}
                        className="w-full bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-lg px-2.5 py-1 text-slate-300 h-8"
                      />
                    </div>
                  </div>
                )}

                {/* Gatilho Metas */}
                {selectedTemplate === "tpl_3" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold">Nome do Objetivo</span>
                      <input 
                        type="text" 
                        value={customMeta}
                        onChange={(e) => setCustomMeta(e.target.value)}
                        className="w-full bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-lg px-2.5 py-1 text-slate-300 h-8"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold">Progresso (%)</span>
                      <input 
                        type="number" 
                        value={customProgresso}
                        onChange={(e) => setCustomProgresso(e.target.value)}
                        className="w-full bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-lg px-2.5 py-1 text-slate-300 h-8 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Gatilho Roleta */}
                {selectedTemplate === "tpl_4" && (
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold">Atividade/Tarefa da Roleta</span>
                    <input 
                      type="text" 
                      value={customTarefa}
                      onChange={(e) => setCustomTarefa(e.target.value)}
                      className="w-full bg-[#0B0F1A] border border-[#30363D] text-3xs rounded-lg px-2.5 py-1 text-slate-300 h-8"
                    />
                  </div>
                )}
              </div>

              {/* Botão de Disparo */}
              <div className="border-t border-[#30363D]/60 pt-4">
                <Button 
                  onClick={handleTriggerFreeMessage}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-2xs flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-none shadow-md transition cursor-pointer"
                >
                  <Send size={13} />
                  Enviar Teste via WhatsApp Web API
                </Button>
                <div className="flex items-start gap-1 text-[9px] text-slate-500 mt-2 font-medium leading-normal">
                  <ShieldCheck size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Método seguro recomendado: O DOLA preenche sua mensagem automaticamente e encaminha para conversas individuais. 100% livre de bloqueios.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Celular Mockup Preview Interactive */}
          <div className="bg-[#0B0F1A] border-4 border-[#30363D] rounded-[2rem] p-4 shadow-xl aspect-[9/16] relative overflow-hidden flex flex-col justify-between max-w-[280px] mx-auto">
            
            {/* Top Speaker Notch Block */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#30363D] h-4 w-28 rounded-b-xl flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Smartphone Header info */}
            <div className="pt-2 flex justify-between items-center text-[8px] font-mono font-bold text-slate-405 text-slate-500 select-none px-2">
              <span>DolaNet</span>
              <span className="text-slate-400">10:42 PM</span>
              <div className="flex items-center gap-0.5">
                <span>94%</span>
                <div className="w-4 h-2 bg-[#30363D] border border-slate-550 rounded-sm" />
              </div>
            </div>

            {/* Dynamic Smartphone Notification Preview Body */}
            <div className="flex-1 flex flex-col justify-center items-center p-3">
              <div className="bg-[#161B22]/95 border border-emerald-500/25 rounded-2xl p-3.5 w-full shadow-lg relative animate-pulse">
                
                {/* App icon line */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center font-bold text-white text-[9px] italic">
                      Ω
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#E6EDF3] leading-none">DOLA AI</p>
                      <p className="text-[7.5px] text-slate-500 font-semibold font-mono uppercase mt-0.5">Gatilho de Alerta</p>
                    </div>
                  </div>
                  <Badge className="bg-[#25D366]/10 text-[#25D366] text-[7px] font-bold border-none py-0.5 px-1.5 leading-none font-mono">
                    WA-SMS 💬
                  </Badge>
                </div>

                {/* Message Bubble content */}
                <p className="text-[9.5px] text-slate-305 text-slate-300 leading-relaxed font-semibold">
                  {processedMessage || "Preencha as variáveis para gerar o bônus de previsão..."}
                </p>

                {/* Micro Actions Block Mockup */}
                <div className="border-t border-slate-800/80 pt-2.5 mt-2.5 flex justify-between text-[8px] font-bold uppercase text-slate-400 font-sans">
                  <span className="text-emerald-400 cursor-pointer">OK PAGO 👍</span>
                  <span className="text-slate-500">Adiar</span>
                  <span className="text-slate-500">Mais Tarde</span>
                </div>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="h-1 w-20 bg-[#30363D] rounded-full mx-auto" />
          </div>
        </div>

      </div>
    </div>
  );
}
