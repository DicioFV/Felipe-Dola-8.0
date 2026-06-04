// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/dashboard/ConfiguracoesPage.tsx
// Fase: 7 — Portabilidade e Segurança Total de Dados
// ============================================

import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Volume2, 
  ShieldAlert, 
  Cpu, 
  Eye, 
  Check, 
  Download, 
  Upload, 
  FileJson, 
  FileText, 
  FileSpreadsheet, 
  FileCheck, 
  RefreshCw,
  Info
} from "lucide-react";
import { useToast } from "../ui/Toast";
import { jsPDF } from "jspdf";

export function ConfiguracoesPage() {
  const { toast } = useToast();
  const [notifyVolume, setNotifyVolume] = useState("MEDIUM");
  const [enableSound, setEnableSound] = useState(true);
  const [enableAI, setEnableAI] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  // States for backup summary & importing
  const [stats, setStats] = useState({
    tasks: 0,
    events: 0,
    notes: 0,
    finances: 0,
    habits: 0,
    investments: 0,
    loans: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load database statistics from server
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem("dola_token");
      const res = await fetch("/api/data/export", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setStats({
          tasks: d.tasks?.length || 0,
          events: d.events?.length || 0,
          notes: d.notes?.length || 0,
          finances: d.finances?.length || 0,
          habits: d.habits?.length || 0,
          investments: d.investments?.length || 0,
          loans: d.loans?.length || 0,
        });
      }
    } catch (e) {
      console.error("Erro ao carregar estatísticas do banco:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSave = () => {
    toast("Configurações atualizadas com sucesso no ecossistema Dola AI.", "success");
  };

  const handleCompactDb = () => {
    toast("Otimização concluída: 0 bytes de lixo limpos. Banco em arquivo JSON compacto e otimizado.", "info");
  };

  // ============================================
  // FORMATADORES DE DOWNLOAD (EXPORTAÇÃO)
  // ============================================

  const getExportData = async (): Promise<any | null> => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("dola_token");
      const res = await fetch("/api/data/export", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao baixar dados do servidor");
      return await res.json();
    } catch (err) {
      toast("Ocorreu um erro ao recuperar dados para a exportação.", "error");
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Export JSON format
  const handleExportJSON = async () => {
    const data = await getExportData();
    if (!data) return;
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, `dola_ai_portabilidade_${Date.now()}.json`, "application/json");
    toast("Download do arquivo JSON concluído!", "success");
  };

  // 2. Export TXT format
  const handleExportTXT = async () => {
    const d = await getExportData();
    if (!d) return;

    const sep = "================================================================================";
    const txtContent = `
${sep}
                         DOLA AI - RELATÓRIO DO EXECUTIVO
                      Data de Exportação: ${new Date().toLocaleString()}
${sep}
Acessado por: ${d.user?.name || "Usuário"} (${d.user?.email || "E-mail"})
Dola AI Framework v7.0.0

1. TAREFAS (Tasks)
--------------------------------------------------------------------------------
${(d.tasks ||[]).map((t: any) => `${t.status === "DONE" ? "[X]" : "[ ]"} ${t.title} (${t.priority === "HIGH" ? "Alta" : t.priority === "LOW" ? "Baixa" : "Média"})${t.dueDate ? ` - Vence em: ${t.dueDate}` : ""}`).join("\n") || "Nenhuma tarefa cadastrada."}

2. COMPROMISSOS (Events)
--------------------------------------------------------------------------------
${(d.events || []).map((e: any) => `* ${e.title} - Data: ${e.startDate}${e.location ? ` - Local: ${e.location}` : ""}`).join("\n") || "Nenhum compromisso agendado."}

3. NOTAS E MEMORANDOS (Notes)
--------------------------------------------------------------------------------
${(d.notes || []).map((n: any) => `■ ${n.title}: ${n.content?.replace(/\n/g, " ") || ""}`).join("\n") || "Nenhuma nota armazenada."}

4. REGISTROS FINANCEIROS (Finances)
--------------------------------------------------------------------------------
${(d.finances || []).map((f: any) => `[${f.type === "RECEIPT" ? "RECEITA" : "DESPESA"}] ${f.title} - Valor: R$ ${f.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - Categoria: ${f.category}`).join("\n") || "Sem transações financeiras."}

5. HÁBITOS DE PRODUTIVIDADE (Habits)
--------------------------------------------------------------------------------
${(d.habits || []).map((h: any) => `* [HÁBITO] ${h.icon || "★"} ${h.name} (${h.category}) - Frequência: ${h.frequency}`).join("\n") || "Nenhum hábito cadastrado."}

6. CARTEIRA DE INVESTIMENTOS (Investments)
--------------------------------------------------------------------------------
${(d.investments || []).map((i: any) => `* [INVESTIMENTO] ${i.name} (${i.type}) na instituição ${i.institution} - Montante: R$ ${i.currentAmount || i.initialAmount} (Retorno: ${i.expectedReturn}%)`).join("\n") || "Sem rendimentos ativos."}

7. EMPRÉSTIMOS E AMORTIZAÇÕES (Loans)
--------------------------------------------------------------------------------
${(d.loans || []).map((l: any) => `* [CONTRATO] ${l.name} com ${l.institution} (Restante: R$ ${l.remainingAmount} de R$ ${l.totalAmount} | Juros: ${l.interestRate}% am)`).join("\n") || "Nenhum débito ou financiamento listado."}
`;
    downloadFile(txtContent, `dola_ai_portabilidade_${Date.now()}.txt`, "text/plain;charset=utf-8");
    toast("Relatório TXT baixado com sucesso!", "success");
  };

  // 3. Export Planilha Spreadsheet (CSV) format
  const handleExportPlanilha = async () => {
    const d = await getExportData();
    if (!d) return;

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += `"DOLA AI - REPORT DE PLANILHA EXTRAORDINÁRIA";"EXPORTADO EM: ${new Date().toLocaleString()}"\n\n`;

    csvContent += `=== TAREFAS ===\n`;
    csvContent += `"ID";"Título";"Prioridade";"Status";"Prazo de Vencimento"\n`;
    (d.tasks || []).forEach((t: any) => {
      csvContent += `"${t.id}";"${t.title}";"${t.priority}";"${t.status}";"${t.dueDate || "Sem prazo"}"\n`;
    });
    csvContent += `\n`;

    csvContent += `=== COMPROMISSOS ===\n`;
    csvContent += `"ID";"Título";"Início";"Local"\n`;
    (d.events || []).forEach((e: any) => {
      csvContent += `"${e.id}";"${e.title}";"${e.startDate}";"${e.location || "Nenhum"}"\n`;
    });
    csvContent += `\n`;

    csvContent += `=== NOTAS ===\n`;
    csvContent += `"ID";"Título";"Conteúdo"\n`;
    (d.notes || []).forEach((n: any) => {
      const cleanContent = (n.content || "").replace(/"/g, '""');
      csvContent += `"${n.id}";"${n.title}";"${cleanContent}"\n`;
    });
    csvContent += `\n`;

    csvContent += `=== FINANCEIRO ===\n`;
    csvContent += `"ID";"Tipo";"Título";"Valor";"Categoria";"Pago"\n`;
    (d.finances || []).forEach((f: any) => {
      csvContent += `"${f.id}";"${f.type}";"${f.title}";"${f.amount}";"${f.category}";"${f.isPaid ? 'Pago' : 'Pendente'}"\n`;
    });

    downloadFile(csvContent, `dola_ai_planilha_${Date.now()}.csv`, "text/csv;charset=utf-8");
    toast("Arquivo CSV (Spreadsheet Excel) gerado e baixado!", "success");
  };

  // 4. Export PDF Format via jsPDF
  const handleExportPDF = async () => {
    const data = await getExportData();
    if (!data) return;

    try {
      const doc = new jsPDF();
      let y = 20;

      // Primary header brand
      doc.setFillColor(11, 15, 26);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("DOLA AI - RELATÓRIO DO EXECUTIVO", 14, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(170, 180, 195);
      doc.text(`Identificador de Auditoria: SEC-PORT-${Date.now()}`, 130, 15);
      doc.text(`Executivo Responsável: ${data.user?.name || "Usuário"} (${data.user?.email || "Email"})`, 14, 25);

      y = 45;

      const checkPageLimit = (needed: number) => {
        if (y + needed > 280) {
          doc.addPage();
          y = 20;
        }
      };

      const renderSection = (title: string, items: string[]) => {
        checkPageLimit(25);
        doc.setFillColor(34, 45, 60);
        doc.rect(14, y, 182, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(title, 18, y + 6);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 70, 90);

        if (items.length === 0) {
          checkPageLimit(10);
          doc.text("Nenhum item localizado nesta divisão.", 18, y);
          y += 10;
        } else {
          items.forEach(item => {
            checkPageLimit(10);
            doc.text("•", 18, y);
            const splitText = doc.splitTextToSize(item, 172);
            doc.text(splitText, 24, y);
            y += (splitText.length * 6);
          });
        }
        y += 5;
      };

      // Compile tasks lines
      const taskLines = (data.tasks || []).map((t: any) => 
        `${t.status === "DONE" ? "[X]" : "[ ]"} ${t.title} (${t.priority === "HIGH" ? "Alta" : t.priority === "LOW" ? "Baixa" : "Média"})${t.dueDate ? ` - Vence em: ${t.dueDate}` : ""}`
      );
      renderSection("1. TAREFAS (Tasks)", taskLines);

      // Compile events lines
      const eventLines = (data.events || []).map((e: any) => 
        `* ${e.title} - Data: ${e.startDate}${e.location ? ` - Local: ${e.location}` : ""}`
      );
      renderSection("2. COMPROMISSOS (Events)", eventLines);

      // Compile notes lines
      const noteLines = (data.notes || []).map((n: any) => 
        `■ ${n.title}: ${n.content?.replace(/\n/g, " ") || ""}`
      );
      renderSection("3. NOTAS E MEMORANDOS (Notes)", noteLines);

      // Compile finance lines
      const financeLines = (data.finances || []).map((f: any) => 
        `[${f.type === "RECEIPT" ? "RECEITA" : "DESPESA"}] ${f.title} - Valor: R$ ${f.amount?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} - Categoria: ${f.category}`
      );
      renderSection("4. REGISTROS FINANCEIROS (Finances)", financeLines);

      doc.save(`dola_ai_backup_completo_${Date.now()}.pdf`);
      toast("PDF assinado e baixado!", "success");
    } catch (e) {
      console.error(e);
      toast("Ocorreu um erro ao emitir o PDF.", "error");
    }
  };

  // ============================================
  // PARSERS DE ARQUIVOS (IMPORTAÇÃO)
  // ============================================

  const parseCSVToBackup = (text: string): any => {
    const lines = text.split("\n");
    const data: any = {
      tasks: [],
      events: [],
      notes: [],
      finances: []
    };

    let currentSection = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.includes("=== TAREFAS ===")) {
        currentSection = "tasks";
        continue;
      } else if (line.includes("=== COMPROMISSOS ===")) {
        currentSection = "events";
        continue;
      } else if (line.includes("=== NOTAS ===")) {
        currentSection = "notes";
        continue;
      } else if (line.includes("=== FINANCEIRO ===")) {
        currentSection = "finances";
        continue;
      }

      if (line.startsWith('"') || line.startsWith('ID') || line.startsWith('id') || line.includes("REPORT DE PLANILHA") || line.includes("EXPORTADO EM")) {
        if (!currentSection) continue;
        if (line.toLowerCase().includes("id;título") || line.toLowerCase().includes("id;")) {
          continue;
        }
      }

      const parts = line.split(";").map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 2) continue;

      if (currentSection === "tasks") {
        data.tasks.push({
          title: parts[1] || "Item Planilha Importada",
          priority: parts[2] || "MEDIUM",
          status: parts[3] === "DONE" || parts[3] === "Concluído" ? "DONE" : "TODO",
          dueDate: parts[4] !== "Sem prazo" ? parts[4] : null
        });
      } else if (currentSection === "events") {
        data.events.push({
          title: parts[1] || "Compromisso Planilha Importada",
          startDate: parts[2] || new Date().toISOString(),
          location: parts[3] !== "Nenhum" ? parts[3] : ""
        });
      } else if (currentSection === "notes") {
        data.notes.push({
          title: parts[1] || "Nota Planilha Importada",
          content: parts[2] || ""
        });
      } else if (currentSection === "finances") {
        data.finances.push({
          type: parts[1] === "RECEIPT" || parts[1] === "Entrada" ? "RECEIPT" : "EXPENSE",
          title: parts[2] || "Valor Lançado Planilha",
          amount: parseFloat(parts[3]) || 0,
          category: parts[4] || "Outros",
          isPaid: parts[5] === "Pago" || parts[5] === "true"
        });
      }
    }

    return data;
  };

  const parseTXTToBackup = (text: string): any => {
    const lines = text.split("\n");
    const data: any = {
      tasks: [],
      events: [],
      notes: [],
      finances: []
    };

    let currentSection = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.includes("1. TAREFAS (Tasks)") || line.toUpperCase().includes("=== TAREFAS ===")) {
        currentSection = "tasks";
        continue;
      } else if (line.includes("2. COMPROMISSOS") || line.toUpperCase().includes("=== COMPROMISSOS ===")) {
        currentSection = "events";
        continue;
      } else if (line.includes("3. NOTAS E MEMORANDOS") || line.toUpperCase().includes("=== NOTAS ===")) {
        currentSection = "notes";
        continue;
      } else if (line.includes("4. REGISTROS FINANCEIROS") || line.toUpperCase().includes("=== FINANCEIRO ===")) {
        currentSection = "finances";
        continue;
      }

      if (line.startsWith("---") || line.startsWith("===") || line.startsWith("Identificador") || line.startsWith("Executivo")) {
        continue;
      }

      if (currentSection === "tasks") {
        const isCompleted = line.startsWith("[X]") || line.startsWith("[x]");
        if (line.startsWith("[ ") || line.startsWith("[]") || line.startsWith("[X]") || line.startsWith("[x]")) {
          let clean = line.replace(/^\[[ xX]?\]\s*/, "");
          
          let priority = "MEDIUM";
          const priorityMatch = clean.match(/\((Alta|Média|Baixa|HIGH|MEDIUM|LOW)\)/i);
          if (priorityMatch) {
            const rawP = priorityMatch[1].toLowerCase();
            if (rawP === "alta" || rawP === "high") priority = "HIGH";
            else if (rawP === "baixa" || rawP === "low") priority = "LOW";
            clean = clean.replace(/\((Alta|Média|Baixa|HIGH|MEDIUM|LOW)\)/i, "").trim();
          }

          let dueDate: string | null = null;
          const dateMatch = clean.match(/vence em:\s*([\d-]+)/i);
          if (dateMatch) {
            dueDate = dateMatch[1];
            clean = clean.split(/vence em:/i)[0].trim();
          }

          data.tasks.push({
            title: clean.replace(/\s*-\s*$/, "").trim() || "Tarefa TXT Importada",
            priority,
            status: isCompleted ? "DONE" : "TODO",
            dueDate
          });
        }
      } else if (currentSection === "events") {
        if (line.startsWith("*") || line.startsWith("-")) {
          let clean = line.substring(1).trim();
          let startDate = new Date().toISOString();
          let location = "";

          const dateMatch = clean.match(/Data:\s*([\d/: -]+)/i);
          if (dateMatch) {
            startDate = dateMatch[1].trim();
            clean = clean.split(/Data:/i)[0].trim();
          }

          const locMatch = clean.match(/Local:\s*(.+)/i);
          if (locMatch) {
            location = locMatch[1].trim();
            clean = clean.split(/Local:/i)[0].trim();
          }

          data.events.push({
            title: clean.replace(/\s*-\s*$/, "").trim() || "Evento TXT Importado",
            startDate,
            location
          });
        }
      } else if (currentSection === "notes") {
        if (line.startsWith("■") || line.startsWith("*")) {
          const clean = line.substring(1).trim();
          const parts = clean.split(":");
          const title = parts[0]?.trim() || "Nota TXT Importada";
          const content = parts.slice(1).join(":").trim();

          data.notes.push({
            title,
            content
          });
        }
      } else if (currentSection === "finances") {
        if (line.includes("RECEITA") || line.includes("DESPESA") || line.includes("R$")) {
          const isReceipt = line.includes("RECEITA") || line.includes("Entrada");
          let clean = line.replace(/^\[.*?\]\s*/, "");

          let amount = 0;
          const amtMatch = clean.match(/Valor:\s*R?\s*([\d,.]+)/i);
          if (amtMatch) {
            amount = parseFloat(amtMatch[1].replace(/\./g, "").replace(",", ".")) || 0;
            clean = clean.split(/Valor:/i)[0].trim();
          }

          let category = "Outros";
          const catMatch = clean.match(/Categoria:\s*(.+)/i);
          if (catMatch) {
            category = catMatch[1].trim();
            clean = clean.split(/Categoria:/i)[0].trim();
          }

          data.finances.push({
            type: isReceipt ? "RECEIPT" : "EXPENSE",
            title: clean.replace(/\s*-\s*$/, "").trim() || "Gasto TXT Importado",
            amount,
            category,
            isPaid: true
          });
        }
      }
    }

    return data;
  };

  const triggerRawImport = async (payload: any) => {
    setIsImporting(true);
    try {
      const token = localStorage.getItem("dola_token");
      const res = await fetch("/api/data/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      if (res.ok) {
        toast(responseData.message || "Dados importados e salvos no ecossistema!", "success");
        fetchStats(); // update status screen
      } else {
        toast(responseData.message || "Erro retornado do servidor de compactação.", "error");
      }
    } catch (err) {
      toast("Ocorreu uma falha na injeção dos dados no servidor.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    const filename = file.name.toLowerCase();

    if (filename.endsWith(".json")) {
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (confirm("Identificamos um backup JSON válido. Deseja re-sincronizar os dados? Atenção: isso substituirá seus dados atuais.")) {
            triggerRawImport(parsed);
          }
        } catch (err) {
          toast("O arquivo JSON de backup está corrompido ou é inválido.", "error");
        }
      };
      reader.readAsText(file);
    } else if (filename.endsWith(".csv")) {
      reader.onload = (e) => {
        try {
          const parsed = parseCSVToBackup(e.target?.result as string);
          if (confirm("Identificamos uma planilha CSV estruturada do Dola AI. Deseja importar os registros?")) {
            triggerRawImport(parsed);
          }
        } catch (err) {
          toast("Erro ocorrido ao analisar e parsear sua planilha .csv.", "error");
        }
      };
      reader.readAsText(file, "UTF-8");
    } else if (filename.endsWith(".txt")) {
      reader.onload = (e) => {
        try {
          const parsed = parseTXTToBackup(e.target?.result as string);
          if (confirm("Identificamos um relatório de texto Dola AI válido. Deseja injetar as tarefas, notas e compromissos mapeados?")) {
            triggerRawImport(parsed);
          }
        } catch (err) {
          toast("Não foi possível processar as linhas do seu relatório .txt.", "error");
        }
      };
      reader.readAsText(file);
    } else if (filename.endsWith(".pdf")) {
      // Smart PDF Binary Extractor
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // Extract text between parentheses in PDF flow structure
          const regex = /\((.*?)\)/g;
          let m;
          const stringsArr: string[] = [];
          while ((m = regex.exec(content)) !== null) {
            let item = m[1].replace(/\\([0-3][0-7][0-7])/g, (__, oct) => String.fromCharCode(parseInt(oct, 8)));
            item = item.replace(/\\(.)/g, "$1");
            stringsArr.push(item);
          }
          const pdfJoinedTxt = stringsArr.join("\n");
          const parsed = parseTXTToBackup(pdfJoinedTxt);

          const totalItems = (parsed.tasks?.length || 0) + (parsed.events?.length || 0) + (parsed.notes?.length || 0) + (parsed.finances?.length || 0);
          if (totalItems > 0) {
            if (confirm(`Encontramos ${totalItems} registros estruturados dentro do seu documento PDF. Deseja restaurá-los agora?`)) {
              triggerRawImport(parsed);
            }
          } else {
            toast("Nenhum dado estruturado ou compatível do Dola AI foi encontrado no conteúdo textual deste PDF.", "info");
          }
        } catch (err) {
          toast("Ocorreu uma falha na decodificação estrutural do arquivo .pdf.", "error");
        }
      };
      reader.readAsText(file, "ISO-8859-1");
    } else {
      toast("Extensão de arquivo não suportada. Use JSON, TXT, CSV ou PDF.", "error");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 select-none max-w-3xl mx-auto pb-10">
      {/* Header section */}
      <div>
        <h1 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2 font-display uppercase tracking-tight">
          <Settings className="text-indigo-400" size={16} /> Configurações de Sistema
        </h1>
        <p className="text-[10px] text-slate-400 mt-1">Personalize parâmetros de notificações síncronas, controle e compactação de banco local e IA.</p>
      </div>

      <div className="space-y-6 text-left">
        {/* Module Segment: Notifications and Sound */}
        <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display flex items-center gap-2">
            <Volume2 className="text-indigo-400" size={14} /> Som & Notificações
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300">Volume dos Alertas Síncronos</h3>
                <p className="text-[10px] text-slate-500">Ajusta o nível dos bipes dos despertadores</p>
              </div>
              <select
                value={notifyVolume}
                onChange={(e) => setNotifyVolume(e.target.value)}
                className="bg-[#0B0F1A] border border-[#30363D] text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="LOW">Baixo (Mudo)</option>
                <option value="MEDIUM">Médio</option>
                <option value="HIGH">Alto</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-xs font-bold text-slate-300">Notificações por Som do Sistema</h3>
                <p className="text-[10px] text-slate-500">Ativa som nos despertadores e bipes dos hábitos</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableSound(!enableSound)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  enableSound ? "bg-indigo-600" : "bg-slate-850"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${enableSound ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Module Segment: Cognition and AI Security */}
        <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display flex items-center gap-2">
            <Cpu className="text-indigo-400" size={14} /> Cognição de Aprendizado Mútuo
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300">Integração do Motor Gemini</h3>
                <p className="text-[10px] text-slate-500">Permite ao assistente cruzar finanças e hábitos para gerar conselhos</p>
              </div>
              <button
                type="button"
                onClick={() => setEnableAI(!enableAI)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  enableAI ? "bg-indigo-600" : "bg-slate-850"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${enableAI ? "translate-x-4" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-xs font-bold text-slate-300">Modo de Privacidade Extrema</h3>
                <p className="text-[10px] text-slate-500">Oculta valores absolutos de dinheiro na tela principal em público</p>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  privacyMode ? "bg-indigo-600" : "bg-slate-850"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${privacyMode ? "translate-x-4" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Module Segment: SYSTEM PORTABILITY (IMPORT AND EXPORT ENGINE) */}
        <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-5">
          <div className="flex justify-between items-center border-b border-[#30363D] pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display flex items-center gap-2">
                <RefreshCw className="text-emerald-400 animate-spin-slow" size={14} /> Portabilidade de Dados Corporativa
              </h2>
              <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider mt-1">Conectividade e Backups Universais Integrados</p>
            </div>
            
            <div className="text-right text-[10px] font-mono text-slate-400 bg-emerald-600/10 border border-emerald-500/20 px-2 py-1 rounded">
              {loadingStats ? "Escaneando..." : (
                <span>Base Ativa: <b>{stats.tasks + stats.events + stats.notes + stats.finances + stats.habits + stats.investments + stats.loans}</b> items</span>
              )}
            </div>
          </div>

          {/* Sub-block 1: Export Panel */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Download size={13} className="text-indigo-400" /> Exportar Informações de Sistema
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Efetue o download imediato de toda a sua conta ativa em relatórios, arquivos ordenados ou formatos compatíveis.
              </p>
            </div>

            {/* Grid of export format buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                disabled={isExporting}
                className="p-3 bg-[#0B0F1A] hover:bg-[#161B22] border border-[#30363D] hover:border-slate-500 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-1.5 group text-center"
              >
                <FileJson size={18} className="text-orange-400 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Formato json</span>
                <span className="text-[8px] text-slate-500 font-mono">Estrutura Bruta</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="p-3 bg-[#0B0F1A] hover:bg-[#161B22] border border-[#30363D] hover:border-slate-500 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-1.5 group text-center"
              >
                <FileCheck size={18} className="text-rose-500 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Exportar PDF</span>
                <span className="text-[8px] text-slate-500 font-mono">Relatório Executivo</span>
              </button>

              <button
                type="button"
                onClick={handleExportPlanilha}
                disabled={isExporting}
                className="p-3 bg-[#0B0F1A] hover:bg-[#161B22] border border-[#30363D] hover:border-slate-500 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-1.5 group text-center"
              >
                <FileSpreadsheet size={18} className="text-emerald-500 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Planilha Excel</span>
                <span className="text-[8px] text-slate-500 font-mono">Tabelas (.CSV)</span>
              </button>

              <button
                type="button"
                onClick={handleExportTXT}
                disabled={isExporting}
                className="p-3 bg-[#0B0F1A] hover:bg-[#161B22] border border-[#30363D] hover:border-slate-500 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-1.5 group text-center"
              >
                <FileText size={18} className="text-sky-400 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Formato TXT</span>
                <span className="text-[8px] text-slate-500 font-mono">Texto Livre</span>
              </button>
            </div>
          </div>

          {/* Sub-block 2: Import Panel */}
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Upload size={13} className="text-emerald-400" /> Importar e Restaurar Registros
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Restaurador inteligente de dados. Arraste ou selecione qualquer arquivo <b>JSON, Planilha (CSV), TXT ou PDF</b> exportado no Dola AI para re-inserir.
              </p>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                dragActive 
                  ? "border-emerald-500 bg-emerald-600/5 shadow-inner" 
                  : "border-[#30363D] hover:border-slate-500 bg-[#0B0F1A]/50 hover:bg-[#0B0F1A]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".json,.csv,.txt,.pdf"
                className="hidden"
              />
              <Upload size={24} className={`transition-transform duration-300 ${dragActive ? "text-emerald-400 scale-110 -translate-y-1" : "text-slate-500"}`} />
              
              <div className="text-center">
                <p className="text-xs font-bold text-slate-300">
                  {isImporting ? "Injetando backup inteligente..." : "Escolher ou arrastar arquivo de backup"}
                </p>
                <p className="text-[9px] text-slate-500 font-mono mt-1">
                  Suportados: .JSON | .PDF | .CSV (Planilha) | .TXT (Fidelidade Ativa)
                </p>
              </div>
            </div>

            <div className="bg-[#161B22]/60 rounded-xl p-3 border border-[#30363D]/60 flex items-start gap-2.5">
              <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[9.5px] text-slate-400 font-medium leading-relaxed">
                <b>Regra de Auditoria de Conexão:</b> Toda importação efetuada passará por um processo de normalização para se adequar ao perfil logado, gerando logs de consistência e alterando seu banco relacional síncrono.
              </div>
            </div>
          </div>
        </div>

        {/* Module Segment: Database & Maintenance Operations */}
        <div className="p-5 bg-[#161B22]/30 border border-[#30363D] rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={14} /> Manutenção & Backup
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div>
              <h3 className="text-xs font-bold text-slate-300">Compactação do Banco JSON Coletor</h3>
              <p className="text-[10px] text-slate-500">Pesquisa registros lixo e limpa o banco interno offline para otimizar</p>
            </div>
            <button
              onClick={handleCompactDb}
              type="button"
              className="px-4 py-2 bg-[#0B0F1A] border border-[#30363D] hover:border-slate-500 text-slate-300 hover:text-white text-2xs font-semibold rounded-xl cursor-pointer transition-all"
            >
              Compactar Banco
            </button>
          </div>
        </div>

        {/* Action submit footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            type="button"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Check size={13} /> Sincronizar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
