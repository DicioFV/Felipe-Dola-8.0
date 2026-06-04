// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/productivity/SmartRoulettePage.tsx
// Função: Roleta Inteligente de Produtividade (Fase 7)
// ============================================

import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Play, 
  CheckCircle, 
  HelpCircle, 
  RefreshCw, 
  AlertCircle, 
  Smile, 
  Sliders, 
  Calendar, 
  CheckSquare, 
  Zap, 
  Flame,
  Award,
  BookOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";

interface RouletteItem {
  id: string;
  title: string;
  type: "TASK" | "HABIT" | "ALARM" | "DEFAULT";
  originText?: string;
  overdue?: boolean;
}

const DEFAULT_ACTIVITIES: RouletteItem[] = [
  { id: "def-water", title: "Beber 500ml de Água", type: "DEFAULT", originText: "Hábito de Hidratação Saudável" },
  { id: "def-stretch", title: "Alongamento Rápido de 3 min", type: "DEFAULT", originText: "Foco e Alívio Corporal" },
  { id: "def-breath", title: "Meditação e Respiração Consciente", type: "DEFAULT", originText: "Redução de Estresse DOLA" },
  { id: "def-cleanup", title: "Organizar Mesa de Trabalho", type: "DEFAULT", originText: "Produtividade Limpa" },
  { id: "def-walk", title: "Caminhar 5 Minutos ao Ar Livre", type: "DEFAULT", originText: "Recarregar Energias" },
  { id: "def-read", title: "Ler 2 Páginas de um Artigo", type: "DEFAULT", originText: "Aprendizado Contínuo" },
];

export function SmartRoulettePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado da Roleta
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<RouletteItem | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<RouletteItem[]>([]);
  const [customFilter, setCustomFilter] = useState<"ALL" | "TASK" | "HABIT" | "URGENT">("ALL");

  // Injetar dados simulados se a API falhar para garantir que a roleta nunca fique em branco
  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { "Authorization": `Bearer ${token}` };

      const [tasksRes, habitsRes] = await Promise.all([
        fetch("/api/tasks", { headers }).then(r => r.ok ? r.json() : []),
        fetch("/api/habits", { headers }).then(r => r.ok ? r.json() : [])
      ]);

      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setHabits(Array.isArray(habitsRes) ? habitsRes : []);
    } catch (e) {
      console.error("Erro ao sincronizar tarefas na roleta:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Construir os segmentos da roleta dinamicamente do banco de dados real
  const buildSegments = useMemo(() => {
    const list: RouletteItem[] = [];

    // 1. Adicionar Tarefas pendentes ("TODO" ou "DOING")
    tasks.forEach(t => {
      if (t.status === "TODO" || t.status === "DOING") {
        list.push({
          id: `task-${t.id}`,
          title: t.title,
          type: "TASK",
          originText: `Tarefa pendente • Categoria: ${t.category || "Geral"}` ,
          overdue: t.priority === "HIGH"
        });
      }
    });

    // 2. Adicionar Hábitos que não foram concluídos hoje
    habits.forEach(h => {
      // Simplificação caso não tenha logs de hoje
      list.push({
        id: `habit-${h.id}`,
        title: h.name,
        type: "HABIT",
        originText: `Hábito diário • Meta de frequência: ${h.frequency || "Diária"}`
      });
    });

    // 3. Mesclar com as atividades padrões recomendadas pela DOLA AI se a lista for curta
    const mergedList = [...list];
    let defaultIdx = 0;
    while (mergedList.length < 6 && defaultIdx < DEFAULT_ACTIVITIES.length) {
      mergedList.push(DEFAULT_ACTIVITIES[defaultIdx]);
      defaultIdx++;
    }

    // Filtragem customizada
    if (customFilter === "TASK") {
      return mergedList.filter(item => item.type === "TASK" || item.type === "DEFAULT").slice(0, 8);
    }
    if (customFilter === "HABIT") {
      return mergedList.filter(item => item.type === "HABIT" || item.type === "DEFAULT").slice(0, 8);
    }
    if (customFilter === "URGENT") {
      const urgents = mergedList.filter(item => item.overdue || item.type === "TASK");
      return urgents.length > 2 ? urgents.slice(0, 8) : mergedList.slice(0, 8);
    }

    return mergedList.slice(0, 8); // limitar a 8 segmentos para o design circular clássico bento ficar limpo
  }, [tasks, habits, customFilter]);

  // Atualizar lista local de segmentos sempre que reconstruído
  useEffect(() => {
    if (buildSegments.length > 0) {
      setRouletteItems(buildSegments);
    }
  }, [buildSegments]);

  // Função para girar com física suave e inércia de amortecimento
  const spinRoulette = () => {
    if (spinning || rouletteItems.length === 0) return;

    setSpinning(true);
    setSelectedActivity(null);
    setIsResultModalOpen(false);

    // Calcular rotação extravagante (pelo menos 5 voltas inteiras completas + ponto randômico)
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalSpinDegrees = rotation + 1800 + extraDegrees;
    
    setRotation(totalSpinDegrees);

    // Identificar qual segmento cairá após 3 segundos
    setTimeout(() => {
      // O ponteiro da roleta fica no topo (90 graus relativo ao círculo normal)
      // Rotação acumulada normalizada para saber qual fatia para no topo
      const normalizedDegrees = (360 - (totalSpinDegrees % 360)) % 360;
      const numSegments = rouletteItems.length;
      const degreesPerSegment = 360 / numSegments;
      
      // Encontrar índice baseado no ângulo correspondente
      const targetIndex = Math.floor(normalizedDegrees / degreesPerSegment) % numSegments;
      const winner = rouletteItems[targetIndex] || rouletteItems[0];

      setSelectedActivity(winner);
      setSpinning(false);
      setIsResultModalOpen(true);
    }, 3000);
  };

  // Cores lindas e contrastantes para cada segmento
  const getSegmentColor = (idx: number, total: number) => {
    const palette = [
      "#4F46E5", // Indigo
      "#A55EEA", // Roxo
      "#00E676", // Verde Emerald
      "#00D2FF", // Azul Aqua
      "#FC5C9C", // Rosa Pink
      "#FFA100", // Laranja Amber
      "#20BF6B", // Verde Escuro
      "#45AAF2"  // Azul Celeste
    ];
    return palette[idx % palette.length];
  };

  const handleCompleteActivity = async () => {
    if (!selectedActivity) return;
    
    // Se for uma tarefa real, podemos marcar como feita na API
    if (selectedActivity.type === "TASK") {
      try {
        const rawId = selectedActivity.id.replace("task-", "");
        const token = localStorage.getItem("token") || "";
        await fetch(`/api/tasks/${rawId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "DONE" })
        });
        loadData(); // recarrega
      } catch (err) {
        console.error("Erro ao marcar tarefa como concluída:", err);
      }
    }
    
    setIsResultModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12 text-[#E6EDF3] select-none">
      
      {/* Header Banner com IA Dola */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#161B22] border border-[#30363D] rounded-2xl relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="flex items-center gap-3">
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Zap size={22} className="animate-pulse" />
          </span>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight flex items-center gap-1.5">
              <span>🎯 Roleta Inteligente Dola AI</span>
            </h1>
            <p className="text-2xs text-slate-400 font-medium">Bloqueado na procrastinação? Deixe a inteligência artificial escolher sua próxima ação produtiva pendente.</p>
          </div>
        </div>

        {/* Filtro Rápido de Categorias */}
        <div className="flex items-center gap-1 bg-[#0D1117] p-1 border border-[#30363D] rounded-xl self-start sm:self-center">
          <button
            onClick={() => setCustomFilter("ALL")}
            className={`text-3xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              customFilter === "ALL" 
                ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-500 hover:text-white"
            }`}
          >
            Misturar Tudo
          </button>
          <button
            onClick={() => setCustomFilter("TASK")}
            className={`text-3xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              customFilter === "TASK" 
                ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-500 hover:text-white"
            }`}
          >
            Apenas Tarefas
          </button>
          <button
            onClick={() => setCustomFilter("HABIT")}
            className={`text-3xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              customFilter === "HABIT" 
                ? "bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-500 hover:text-white"
            }`}
          >
            Hábitos Livres
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Painel Esquerdo: A Mecânica da Roleta (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <Card className="border-[#30363D] bg-[#161B22] p-8 w-full flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-3xs font-mono font-bold text-slate-400">
              <Flame size={12} className="text-amber-500" />
              <span>{rouletteItems.length} Fatias Ativas</span>
            </div>

            {/* Ponteiro do Topo */}
            <div className="relative mb-6 flex flex-col items-center">
              {/* Seta do Ponteiro */}
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-indigo-400 absolute top-[-5px] z-30 drop-shadow-[0_4px_8px_rgba(79,70,229,0.5)] animate-bounce" />
              
              {/* O Círculo da Roleta */}
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full border-[8px] border-[#30363D] relative overflow-hidden shadow-2xl mt-4 bg-slate-950 z-10">
                <div 
                  className="w-full h-full rounded-full relative transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center center"
                  }}
                >
                  {/* Renderizar Fatias por SVG Gráfico */}
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <defs>
                      {rouletteItems.map((item, idx) => {
                        const total = rouletteItems.length;
                        const angle = 2 * Math.PI / total;
                        const midAngle = idx * angle + angle / 2;
                        return (
                          <clipPath key={`clip-${idx}`} id={`slice-clip-${idx}`}>
                            <path d={`M 50 50 L ${50 + 50 * Math.cos(idx * angle)} ${50 + 50 * Math.sin(idx * angle)} A 50 50 0 0 1 ${50 + 50 * Math.cos((idx + 1) * angle)} ${50 + 50 * Math.sin((idx + 1) * angle)} Z`} />
                          </clipPath>
                        );
                      })}
                    </defs>

                    {rouletteItems.map((item, idx) => {
                      const total = rouletteItems.length;
                      const segmentAngle = 360 / total;
                      const rotateDeg = idx * segmentAngle;
                      const textAngle = rotateDeg + segmentAngle / 2;
                      
                      // Coordenadas polares para posicionar o texto de forma rotacionada
                      const textRad = (textAngle * Math.PI) / 180;
                      // Posicionar texto a 65% do raio
                      const tx = 50 + 26 * Math.cos(textRad);
                      const ty = 50 + 26 * Math.sin(textRad);

                      return (
                        <g key={item.id}>
                          {/* Segmento colorido */}
                          <path 
                            d={`M 50 50 L ${50 + 50 * Math.cos(idx * (2 * Math.PI / total))} ${50 + 50 * Math.sin(idx * (2 * Math.PI / total))} A 50 50 0 0 1 ${50 + 50 * Math.cos((idx + 1) * (2 * Math.PI / total))} ${50 + 50 * Math.sin((idx + 1) * (2 * Math.PI / total))} Z`} 
                            fill={getSegmentColor(idx, total)}
                            opacity="0.85"
                            stroke="#161B22"
                            strokeWidth="0.8"
                            className="hover:opacity-100 transition-opacity cursor-pointer"
                          />
                          
                          {/* Texto / Ícone do Segmento */}
                          <text 
                            x={tx} 
                            y={ty} 
                            fill="#FFFFFF" 
                            fontSize={total > 6 ? "3" : "3.5"} 
                            fontWeight="bold" 
                            fontFamily="sans-serif"
                            textAnchor="middle"
                            transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                            className="pointer-events-none select-none tracking-tight shadow-md"
                          >
                            {item.title.length > 15 ? `${item.title.substring(0, 14)}...` : item.title}
                          </text>
                        </g>
                      );
                    })}

                    {/* Pequena bolha central de finalização */}
                    <circle cx="50" cy="50" r="7" fill="#161B22" stroke="#30363D" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Botão de Girar no Centro com Efeito Magnético */}
              <button 
                onClick={spinRoulette}
                disabled={spinning}
                className="w-16 h-16 bg-slate-900 border-[3px] border-indigo-500 hover:border-emerald-400 disabled:opacity-50 text-white rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95 transition-all absolute top-[152px] left-[120px] md:left-[136px] z-40"
              >
                {spinning ? (
                  <RefreshCw size={18} className="animate-spin text-indigo-400" />
                ) : (
                  <>
                    <Play size={15} fill="currentColor" className="text-indigo-400 ml-0.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5 font-sans">Girar</span>
                  </>
                )}
              </button>
            </div>

            {/* Conselhos Rápidos DOLA AI */}
            <div className="w-full bg-[#0B0F1A]/50 border border-[#30363D] p-4 rounded-xl flex items-start gap-2.5">
              <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                <Sparkles size={14} />
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                🎯 <span className="text-indigo-400 font-bold">Conselho da IA:</span> Deixe a roleta guiar sua rotina por momentos em vez de carregar cargas excessivas de estresse. Quando você conclui micro-tarefas sorteadas, seu cérebro libera dopamina, ajudando a quebrar o ciclo de auto-sabotagem.
              </p>
            </div>
          </Card>
        </div>

        {/* Quadro de Tarefas na Roleta (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[#30363D] bg-[#161B22] p-5">
            <CardHeader className="p-0 mb-4 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-300">📋 Lista Ativa de Segmentos</CardTitle>
                <CardDescription>O que pode ser sorteado nesta giro</CardDescription>
              </div>
              <Button onClick={loadData} variant="outline" className="h-7 w-7 p-0 border-[#30363D]">
                <RefreshCw size={12} className="text-slate-400" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0 space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-center text-xs text-slate-500 py-6">Atualizando metas e afazeres...</p>
              ) : rouletteItems.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">Nenhuma atividade localizada no sistema.</p>
              ) : (
                rouletteItems.map((item, idx) => {
                  return (
                    <div 
                      key={item.id}
                      className="p-3 bg-[#0B0F1A]/40 border border-[#30363D]/70 hover:border-slate-500 rounded-xl flex items-center justify-between text-2xs transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSegmentColor(idx, rouletteItems.length) }} />
                        <div className="space-y-0.5 leading-none">
                          <p className="font-bold text-slate-200">{item.title}</p>
                          <p className="text-[9px] text-slate-500 font-medium font-mono">{item.originText}</p>
                        </div>
                      </div>

                      {item.type === "TASK" ? (
                        <Badge variant="info" className="text-[8px] font-bold">Tarefa</Badge>
                      ) : item.type === "HABIT" ? (
                        <Badge variant="success" className="text-[8px] font-bold">Hábito</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[8px] font-bold text-slate-400">Sugestão</Badge>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* POPUP DE RESULTADO DA ROLETA */}
      {isResultModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-[#0B0F1A]/85 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative text-2xs md:text-xs">
            
            {/* Header decorativo */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-[#A55EEA] to-emerald-400" />

            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto animate-bounce mb-2">
                <Sparkles size={22} />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block font-mono">DOLA AI Escolheu para Você!</span>
                <h3 className="text-base font-extrabold text-[#E6EDF3] font-display mt-1 px-2">{selectedActivity.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold font-mono uppercase mt-0.5">{selectedActivity.originText}</p>
              </div>

              {/* Recomendação de Execução */}
              <div className="bg-[#0B0F1A] border border-[#30363D]/80 p-3.5 rounded-xl space-y-2 text-left text-3xs md:text-2xs font-medium text-slate-400 mt-2">
                <p className="font-bold text-slate-200 flex items-center gap-1">
                  <Smile size={12} className="text-indigo-400" />
                  Estratégia de 1 Minuto:
                </p>
                <p className="leading-relaxed">
                  Não pense duas vezes! Inicie esta ação imediatamente sem olhar outras distrações do celular. O método dos 5 segundos consiste em contar 5, 4, 3, 2, 1 e partir para a ação.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={handleCompleteActivity}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 flex items-center justify-center gap-1 text-2xs cursor-pointer rounded-xl border-none font-sans"
                >
                  <Award size={13} />
                  {selectedActivity.type === "TASK" ? "Fazer e Marcar como Concluir" : "Vou Fazer Agora!"}
                </Button>
                
                <Button 
                  onClick={() => setIsResultModalOpen(false)}
                  variant="outline"
                  className="border-[#30363D] text-slate-400 py-1.5 rounded-xl text-3xs hover:bg-[#30363D]/40 cursor-pointer"
                >
                  Fechar & Fechar Desafio
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
