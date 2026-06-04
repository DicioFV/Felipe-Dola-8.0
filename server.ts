// ============================================
// DOLA AI — Executive Assistant
// Arquivo: server.ts
// Fase: 1
// ============================================

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// polyfill para garantir que crypto.randomUUID sempre exista e seja seguro em qualquer versão de Node
if (typeof (crypto as any).randomUUID !== "function") {
  (crypto as any).randomUUID = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

export const app = express();
const PORT = 3000;

app.use(express.json());

// ---- BANCO DE DADOS EM ARQUIVO (LITE JSON DATABASE) ----
const DB_FILE = path.join(process.cwd(), "data", "db.json");

// Garante que a pasta 'data' existe
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

// Interface simplificada da base local do servidor
interface LocalDB {
  users: any[];
  tasks: any[];
  events: any[];
  alarms: any[];
  habits: any[];
  habitLogs: any[];
  finances: any[];
  familyEvents: any[];
  notes: any[];
  notifications: any[];
  investments: any[];
  investmentLogs: any[];
  investmentGoals: any[];
  loans: any[];
  loanPayments: any[];
  loanStrategies: any[];
  activityLogs: any[];
}

const initialDb: LocalDB = {
  users: [],
  tasks: [],
  events: [],
  alarms: [],
  habits: [],
  habitLogs: [],
  finances: [],
  familyEvents: [],
  notes: [],
  notifications: [],
  investments: [],
  investmentLogs: [],
  investmentGoals: [],
  loans: [],
  loanPayments: [],
  loanStrategies: [],
  activityLogs: []
};

let dbInMemoryCache: LocalDB | null = null;

function readDb(): LocalDB {
  if (dbInMemoryCache) {
    return dbInMemoryCache;
  }
  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    } catch (e) {
      console.warn("Failsafe: Não foi possível gravar o arquivo inicial do banco (normal em Vercel/Serverless):", e);
    }
    dbInMemoryCache = initialDb;
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.activityLogs) {
      parsed.activityLogs = [];
    }
    dbInMemoryCache = parsed;
    return parsed;
  } catch (err) {
    console.error("Erro ao ler banco local, recuperando modelo limpo.", err);
    dbInMemoryCache = initialDb;
    return initialDb;
  }
}

function writeDb(db: LocalDB) {
  dbInMemoryCache = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.warn("Failsafe: Gravação no arquivo db.json falhou (esperado em Vercel/Serverless pois o sistema de arquivos é de apenas leitura):", err);
  }
}

// ---- HELPER CRIPTOGRAFIA / LOGS DE ATIVIDADE ----
function logActivity(userId: string, action: string, entity: string, entityId?: string, details?: string, ipAddress?: string) {
  try {
    const db = readDb();
    if (!db.activityLogs) db.activityLogs = [];
    
    const newLog = {
      id: `log-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      userId,
      action, // CREATE, UPDATE, DELETE, LOGIN, SETTINGS_CHANGE, SECURITY_ALERT, CLEAR
      entity, // Task, Event, Finance, Investment, Loan, Habit, Alarm, User, System
      entityId: entityId || null,
      details: details || null,
      ipAddress: ipAddress || "127.0.0.1",
      createdAt: new Date().toISOString()
    };
    
    db.activityLogs.push(newLog);
    // Limit to 500 logs to prevent db overflow
    if (db.activityLogs.length > 500) {
      db.activityLogs.shift();
    }
    writeDb(db);
    return newLog;
  } catch (err) {
    console.error("Erro ao registrar log de atividade:", err);
    return null;
  }
}

// ---- HELPER CRIPTOGRAFIA ----
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(user: any): string {
  // Token leve simplificado (Base64 do userId + role) para persistência e validação rápida
  const payload = JSON.stringify({ id: user.id, email: user.email, role: user.role });
  return Buffer.from(payload).toString("base64");
}

function verifyToken(token: string): any {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

// ---- SEED INICIAL COM SUPERADMIN (10felitec@gmail.com / 135Amor.) ----
function seedDb() {
  const db = readDb();
  const superadminEmail = "10felitec@gmail.com";
  const superadminPasswordHash = hashPassword("135Amor.");

  const superadminIndex = db.users.findIndex(u => u.email.toLowerCase().trim() === superadminEmail.toLowerCase().trim());
  if (superadminIndex === -1) {
    const superadmin = {
      id: "superadmin-01",
      name: "Super Admin (Dola AI)",
      email: superadminEmail,
      password: superadminPasswordHash,
      role: "SUPERADMIN",
      isActive: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      phone: "+55 11 99999-9999",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(superadmin);
    writeDb(db);
    console.log("Database seeded successfully with SUPERADMIN!");
  } else {
    // Garante que a senha, role e estado ativo de superadmin estejam sempre corretos e atualizados
    let updated = false;
    const adminUser = db.users[superadminIndex];
    if (adminUser.password !== superadminPasswordHash) {
      adminUser.password = superadminPasswordHash;
      updated = true;
    }
    if (adminUser.role !== "SUPERADMIN") {
      adminUser.role = "SUPERADMIN";
      updated = true;
    }
    if (!adminUser.isActive) {
      adminUser.isActive = true;
      updated = true;
    }
    if (updated) {
      db.users[superadminIndex] = adminUser;
      writeDb(db);
      console.log("SUPERADMIN credentials healed and updated!");
    }
  }
}

seedDb();

// ---- MIDDLEWARE AUTENTICAÇÃO ----
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Acesso Token Ausente." });

  const payload = verifyToken(token);
  if (!payload) return res.status(403).json({ message: "Token inválido ou expirado." });

  // Busca usuário atualizado no banco
  const db = readDb();
  const user = db.users.find(u => u.id === payload.id);
  if (!user || !user.isActive) {
    return res.status(403).json({ message: "Usuário inativo ou inexistente." });
  }

  req.user = user;
  next();
}

// ---- API ENDPOINTS ----

// LOGIN Oculto / Geral
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  const db = readDb();
  const user = db.users.find(u => u.email.trim().toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ message: "Usuário não encontrado." });
  }

  if (user.password !== hashPassword(cleanPassword)) {
    return res.status(401).json({ message: "Senha incorreta." });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Sua conta está inativa. Contate o administrador." });
  }

  const token = generateToken(user);
  
  // Registrar log de login com segurança
  logActivity(user.id, "LOGIN", "User", user.id, `Executivo ${user.name} iniciou sessão na plataforma.`, (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress);

  // Retorna dados do usuário sem a senha
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// Restaurar Sessão Me
app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Setup rápido de rota secreta para forçar ativação do superadmin
app.get("/api/auth/setup", (req, res) => {
  seedDb();
  res.json({ success: true, message: "Superadmin restaurado e ativo." });
});

// ---- SIGN UP / CADASTRO PÚBLICO ----
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "E-mail é obrigatório." });
  }

  const db = readDb();
  if (db.users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "E-mail já cadastrado." });
  }

  const defaultPassword = "123456";
  const userPassword = password || defaultPassword;

  const newUser = {
    id: `user-${crypto.randomUUID()}`,
    name: name || email.split("@")[0],
    email: email.toLowerCase(),
    password: hashPassword(userPassword),
    role: "USER",
    phone: "",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = generateToken(newUser);
  const { password: _, ...safeUser } = newUser;

  res.status(201).json({ token, user: safeUser, message: "Cadastro realizado com sucesso!" });
});

// ---- ESQUECI SENHA / RECUPERAÇÃO ----
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "E-mail é obrigatório." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = readDb();
  const user = db.users.find(u => u.email.trim().toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(400).json({ message: "Este e-mail não está cadastrado em nosso sistema." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + 3600000; // 1 hora de expiração
  writeDb(db);

  // Simula o link de redefinição
  const resetLink = `/?token=${resetToken}`;

  res.json({
    success: true,
    message: `Link de nova senha gerado e simulado!`,
    resetLink,
    email: user.email
  });
});

// ---- REDEFINIR SENHA ----
app.post("/api/auth/reset-password", (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token e nova senha são obrigatórios." });
  }

  const db = readDb();
  const user = db.users.find(u => u.resetToken === token && u.resetTokenExpires > Date.now());

  if (!user) {
    return res.status(400).json({ message: "Token de redefinição inválido, expirado ou já utilizado." });
  }

  user.password = hashPassword(password);
  user.resetToken = null;
  user.resetTokenExpires = null;
  user.updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({ success: true, message: "Sua senha foi redefinida com sucesso. Faça login agora!" });
});


// ---- ROTAS GENÉRICAS DO SISTEMA (CRUD FÁCIL PARA FUTURA PORTABILIDADE) ----

// CRUD USUÁRIOS (GERENCIADO PELO SUPERADMIN NA FASE 2)
app.get("/api/users", authenticateToken, (req: any, res) => {
  if (req.user.role !== "SUPERADMIN" && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Não autorizado." });
  }
  const db = readDb();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.post("/api/users", authenticateToken, (req: any, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Permissão exclusiva de Super Admin." });
  }
  const { name, email, password, role, phone, avatar } = req.body;

  const db = readDb();

  if (db.users.length >= 6) {
    return res.status(400).json({ message: "Limite máximo de 6 usuários alcançado." });
  }

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "E-mail já cadastrado." });
  }

  const newUser = {
    id: `user-${crypto.randomUUID()}`,
    name,
    email: email.toLowerCase(),
    password: hashPassword(password || "123456"), // Senha padrão se vazia
    role: role || "USER",
    phone: phone || "",
    avatar: avatar || "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put("/api/users/:id", authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { name, email, password, role, phone, avatar, isActive } = req.body;

  // Um usuário só pode se editar, a menos que seja SUPERADMIN
  if (req.user.role !== "SUPERADMIN" && req.user.id !== id) {
    return res.status(403).json({ message: "Não autorizado." });
  }

  const db = readDb();
  const userIdx = db.users.findIndex(u => u.id === id);
  if (userIdx === -1) return res.status(404).json({ message: "Usuário não encontrado." });

  const currentUser = db.users[userIdx];

  // Somente SUPERADMIN altera perfil administrativo ou status ativo
  if (req.user.role !== "SUPERADMIN") {
    if (role && role !== currentUser.role) return res.status(403).json({ message: "Apenas o Super Admin muda papéis." });
    if (isActive !== undefined && isActive !== currentUser.isActive) return res.status(403).json({ message: "Apenas o Super Admin muda o status." });
  }

  if (name) currentUser.name = name;
  if (email) currentUser.email = email.toLowerCase();
  if (password) currentUser.password = hashPassword(password);
  if (role && req.user.role === "SUPERADMIN") currentUser.role = role;
  if (phone !== undefined) currentUser.phone = phone;
  if (avatar !== undefined) currentUser.avatar = avatar;
  if (isActive !== undefined && req.user.role === "SUPERADMIN") currentUser.isActive = isActive;
  
  currentUser.updatedAt = new Date().toISOString();

  writeDb(db);
  const { password: _, ...safeUser } = currentUser;
  res.json(safeUser);
});

app.delete("/api/users/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Operação exclusiva de Super Admin." });
  }
  const { id } = req.params;
  if (id === "superadmin-01" || id === req.user.id) {
    return res.status(400).json({ message: "Não é possível se deletar ou deletar o fundador do sistema." });
  }

  const db = readDb();
  const initialLength = db.users.length;
  db.users = db.users.filter(u => u.id !== id);
  
  if (db.users.length === initialLength) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  // Deleta cascateado todos os recursos do usuário
  db.tasks = db.tasks.filter(t => t.userId !== id);
  db.events = db.events.filter(e => e.userId !== id);
  db.notes = db.notes.filter(n => n.userId !== id);
  db.alarms = db.alarms.filter(a => a.userId !== id);
  db.habits = db.habits.filter(h => h.userId !== id);
  db.finances = db.finances.filter(f => f.userId !== id);
  db.investments = db.investments.filter(inv => inv.userId !== id);
  db.loans = db.loans.filter(lo => lo.userId !== id);

  writeDb(db);
  res.json({ success: true });
});

// ============================================
// ---- FASE 2: API CRUD COMPLETO DA PRODUTIVIDADE ----
// ============================================

// ---- CRUD TAREFAS ----
app.get("/api/tasks", authenticateToken, (req: any, res) => {
  const db = readDb();
  const userTasks = db.tasks.filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

app.post("/api/tasks", authenticateToken, (req: any, res) => {
  const db = readDb();
  const newTask = {
    id: `task-${crypto.randomUUID()}`,
    userId: req.user.id,
    title: req.body.title || "Sem título",
    description: req.body.description || "",
    status: req.body.status || "TODO",
    priority: req.body.priority || "MEDIUM",
    category: req.body.category || "Geral",
    dueDate: req.body.dueDate || null,
    completedAt: req.body.completedAt || null,
    order: db.tasks.filter(t => t.userId === req.user.id).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.tasks.push(newTask);
  writeDb(db);
  logActivity(req.user.id, "CREATE", "Task", newTask.id, `Tarefa "${newTask.title}" foi criada. Prioridade: ${newTask.priority}.`, (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const task = db.tasks.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!task) return res.status(404).json({ message: "Tarefa não encontrada." });

  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.status !== undefined) {
    task.status = req.body.status;
    task.completedAt = req.body.status === "DONE" ? new Date().toISOString() : null;
  }
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  if (req.body.category !== undefined) task.category = req.body.category;
  if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
  
  task.updatedAt = new Date().toISOString();
  writeDb(db);
  logActivity(req.user.id, "UPDATE", "Task", task.id, `Tarefa "${task.title}" foi atualizada. Status: ${task.status}.`, (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress);
  res.json(task);
});

app.delete("/api/tasks/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter(t => !(t.id === req.params.id && t.userId === req.user.id));
  if (db.tasks.length === initialLength) return res.status(404).json({ message: "Tarefa não encontrada." });
  writeDb(db);
  logActivity(req.user.id, "DELETE", "Task", req.params.id, `Tarefa ID "${req.params.id}" foi removida do ecossistema.`, (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress);
  res.json({ success: true });
});

// ---- CRUD EVENTOS ----
app.get("/api/events", authenticateToken, (req: any, res) => {
  const db = readDb();
  const userEvents = db.events.filter(e => e.userId === req.user.id);
  res.json(userEvents);
});

app.post("/api/events", authenticateToken, (req: any, res) => {
  const db = readDb();
  const newEvent = {
    id: `event-${crypto.randomUUID()}`,
    userId: req.user.id,
    title: req.body.title || "Sem título",
    description: req.body.description || "",
    startDate: req.body.startDate || new Date().toISOString(),
    endDate: req.body.endDate || null,
    location: req.body.location || "",
    type: req.body.type || "PERSONAL",
    isRecurring: !!req.body.isRecurring,
    color: req.body.color || "#6C5CE7",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.events.push(newEvent);
  writeDb(db);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const event = db.events.find(e => e.id === req.params.id && e.userId === req.user.id);
  if (!event) return res.status(404).json({ message: "Evento não encontrado." });

  if (req.body.title !== undefined) event.title = req.body.title;
  if (req.body.description !== undefined) event.description = req.body.description;
  if (req.body.startDate !== undefined) event.startDate = req.body.startDate;
  if (req.body.endDate !== undefined) event.endDate = req.body.endDate;
  if (req.body.location !== undefined) event.location = req.body.location;
  if (req.body.type !== undefined) event.type = req.body.type;
  if (req.body.isRecurring !== undefined) event.isRecurring = !!req.body.isRecurring;
  if (req.body.color !== undefined) event.color = req.body.color;

  event.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(event);
});

app.delete("/api/events/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const initialLength = db.events.length;
  db.events = db.events.filter(e => !(e.id === req.params.id && e.userId === req.user.id));
  if (db.events.length === initialLength) return res.status(404).json({ message: "Evento não encontrado." });
  writeDb(db);
  res.json({ success: true });
});

// ---- CRUD NOTAS ----
app.get("/api/notes", authenticateToken, (req: any, res) => {
  const db = readDb();
  const userNotes = db.notes.filter(n => n.userId === req.user.id);
  res.json(userNotes);
});

app.post("/api/notes", authenticateToken, (req: any, res) => {
  const db = readDb();
  const newNote = {
    id: `note-${crypto.randomUUID()}`,
    userId: req.user.id,
    title: req.body.title || "Sem título",
    content: req.body.content || "",
    category: req.body.category || "Geral",
    isPinned: !!req.body.isPinned,
    color: req.body.color || "#161B22",
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.notes.push(newNote);
  writeDb(db);
  res.status(201).json(newNote);
});

app.put("/api/notes/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const note = db.notes.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!note) return res.status(404).json({ message: "Nota não encontrada." });

  if (req.body.title !== undefined) note.title = req.body.title;
  if (req.body.content !== undefined) note.content = req.body.content;
  if (req.body.category !== undefined) note.category = req.body.category;
  if (req.body.isPinned !== undefined) note.isPinned = !!req.body.isPinned;
  if (req.body.color !== undefined) note.color = req.body.color;
  if (req.body.tags !== undefined) note.tags = req.body.tags;

  note.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(note);
});

app.delete("/api/notes/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const initialLength = db.notes.length;
  db.notes = db.notes.filter(n => !(n.id === req.params.id && n.userId === req.user.id));
  if (db.notes.length === initialLength) return res.status(404).json({ message: "Nota não encontrada." });
  writeDb(db);
  res.json({ success: true });
});

// ---- CRUD ALARMES ----
app.get("/api/alarms", authenticateToken, (req: any, res) => {
  const db = readDb();
  const userAlarms = db.alarms.filter(a => a.userId === req.user.id);
  res.json(userAlarms);
});

app.post("/api/alarms", authenticateToken, (req: any, res) => {
  const db = readDb();
  const newAlarm = {
    id: `alarm-${crypto.randomUUID()}`,
    userId: req.user.id,
    title: req.body.title || "Despertador",
    description: req.body.description || "",
    datetime: req.body.datetime || new Date().toISOString(),
    repeat: req.body.repeat || "DAILY",
    sound: req.body.sound || "default",
    priority: req.body.priority || "MEDIUM",
    isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.alarms.push(newAlarm);
  writeDb(db);
  res.status(201).json(newAlarm);
});

app.put("/api/alarms/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const alarm = db.alarms.find(a => a.id === req.params.id && a.userId === req.user.id);
  if (!alarm) return res.status(404).json({ message: "Alarme não encontrado." });

  if (req.body.title !== undefined) alarm.title = req.body.title;
  if (req.body.description !== undefined) alarm.description = req.body.description;
  if (req.body.datetime !== undefined) alarm.datetime = req.body.datetime;
  if (req.body.repeat !== undefined) alarm.repeat = req.body.repeat;
  if (req.body.sound !== undefined) alarm.sound = req.body.sound;
  if (req.body.priority !== undefined) alarm.priority = req.body.priority;
  if (req.body.isActive !== undefined) alarm.isActive = !!req.body.isActive;

  alarm.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(alarm);
});

app.delete("/api/alarms/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const initialLength = db.alarms.length;
  db.alarms = db.alarms.filter(a => !(a.id === req.params.id && a.userId === req.user.id));
  if (db.alarms.length === initialLength) return res.status(404).json({ message: "Alarme não encontrado." });
  writeDb(db);
  res.json({ success: true });
});

// ---- CRUD HÁBITOS ----
app.get("/api/habits", authenticateToken, (req: any, res) => {
  const db = readDb();
  const userHabits = db.habits.filter(h => h.userId === req.user.id);
  
  // Popula logs para cada hábito para simplificar o render
  const populatedHabits = userHabits.map(h => {
    return {
      ...h,
      logs: db.habitLogs.filter(log => log.habitId === h.id)
    };
  });
  res.json(populatedHabits);
});

app.post("/api/habits", authenticateToken, (req: any, res) => {
  const db = readDb();
  const newHabit = {
    id: `habit-${crypto.randomUUID()}`,
    userId: req.user.id,
    name: req.body.name || "Novo Hábito",
    description: req.body.description || "",
    frequency: req.body.frequency || "DAILY",
    category: req.body.category || "Saúde",
    icon: req.body.icon || "💪",
    color: req.body.color || "#6C5CE7",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.habits.push(newHabit);
  writeDb(db);
  res.status(201).json({ ...newHabit, logs: [] });
});

app.put("/api/habits/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const habit = db.habits.find(h => h.id === req.params.id && h.userId === req.user.id);
  if (!habit) return res.status(404).json({ message: "Hábito não encontrado." });

  if (req.body.name !== undefined) habit.name = req.body.name;
  if (req.body.description !== undefined) habit.description = req.body.description;
  if (req.body.frequency !== undefined) habit.frequency = req.body.frequency;
  if (req.body.category !== undefined) habit.category = req.body.category;
  if (req.body.icon !== undefined) habit.icon = req.body.icon;
  if (req.body.color !== undefined) habit.color = req.body.color;

  habit.updatedAt = new Date().toISOString();
  writeDb(db);

  const logs = db.habitLogs.filter(log => log.habitId === habit.id);
  res.json({ ...habit, logs });
});

app.delete("/api/habits/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  const initialLength = db.habits.length;
  db.habits = db.habits.filter(h => !(h.id === req.params.id && h.userId === req.user.id));
  if (db.habits.length === initialLength) return res.status(404).json({ message: "Hábito não encontrado." });
  
  // Limpa logs cascateado
  db.habitLogs = db.habitLogs.filter(log => log.habitId !== req.params.id);
  
  writeDb(db);
  res.json({ success: true });
});

// Toggle logs de hábitos
app.post("/api/habits/:id/toggle", authenticateToken, (req: any, res) => {
  const db = readDb();
  const habit = db.habits.find(h => h.id === req.params.id && h.userId === req.user.id);
  if (!habit) return res.status(404).json({ message: "Hábito não encontrado." });

  // Pega a data YY-MM-DD
  const targetDateStr = req.body.date ? req.body.date.split("T")[0] : new Date().toISOString().split("T")[0];

  const existingLogIndex = db.habitLogs.findIndex(log => log.habitId === habit.id && log.date.split("T")[0] === targetDateStr);

  if (existingLogIndex !== -1) {
    // Apaga/Inverte log se já existe
    const currentCompleted = db.habitLogs[existingLogIndex].completed;
    if (currentCompleted) {
      db.habitLogs.splice(existingLogIndex, 1);
    } else {
      db.habitLogs[existingLogIndex].completed = true;
    }
  } else {
    // Adiciona log de completado
    db.habitLogs.push({
      id: `log-${crypto.randomUUID()}`,
      habitId: habit.id,
      date: targetDateStr,
      completed: true,
      notes: req.body.notes || "",
      createdAt: new Date().toISOString()
    });
  }

  writeDb(db);
  const logs = db.habitLogs.filter(log => log.habitId === habit.id);
  res.json({ ...habit, logs });
});

// ---- CRUD FINANCEIRO ----
app.get("/api/finances", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.finances) db.finances = [];
  const userFinances = db.finances.filter(f => f.userId === req.user.id);
  res.json(userFinances);
});

app.post("/api/finances", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.finances) db.finances = [];
  
  const newFinance = {
    id: `finance-${crypto.randomUUID()}`,
    userId: req.user.id,
    type: req.body.type || "EXPENSE",
    title: req.body.title || "Nova Transação",
    amount: parseFloat(req.body.amount) || 0,
    category: req.body.category || "Outros",
    dueDate: req.body.dueDate || null,
    paidAt: req.body.paidAt || null,
    isPaid: req.body.isPaid !== undefined ? !!req.body.isPaid : false,
    recurrence: req.body.recurrence || "UNIQUE",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.finances.push(newFinance);
  writeDb(db);
  res.status(201).json(newFinance);
});

app.put("/api/finances/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.finances) db.finances = [];
  
  const finance = db.finances.find(f => f.id === req.params.id && f.userId === req.user.id);
  if (!finance) return res.status(404).json({ message: "Registro financeiro não encontrado." });

  if (req.body.type !== undefined) finance.type = req.body.type;
  if (req.body.title !== undefined) finance.title = req.body.title;
  if (req.body.amount !== undefined) finance.amount = parseFloat(req.body.amount) || 0;
  if (req.body.category !== undefined) finance.category = req.body.category;
  if (req.body.dueDate !== undefined) finance.dueDate = req.body.dueDate;
  if (req.body.paidAt !== undefined) finance.paidAt = req.body.paidAt;
  if (req.body.isPaid !== undefined) finance.isPaid = !!req.body.isPaid;
  if (req.body.recurrence !== undefined) finance.recurrence = req.body.recurrence;
  if (req.body.notes !== undefined) finance.notes = req.body.notes;

  finance.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(finance);
});

app.delete("/api/finances/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.finances) db.finances = [];
  
  const initialLength = db.finances.length;
  db.finances = db.finances.filter(f => !(f.id === req.params.id && f.userId === req.user.id));
  if (db.finances.length === initialLength) return res.status(404).json({ message: "Registro financeiro não encontrado." });
  
  writeDb(db);
  res.json({ success: true });
});

// ==== FASE 4: INVESTIMENTOS & EMPRÉSTIMOS ====

// 1. ---- INVESTIMENTOS API ----
app.get("/api/investments", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investments) db.investments = [];
  if (!db.investmentLogs) db.investmentLogs = [];

  let userInvestments = db.investments.filter(i => i.userId === req.user.id);
  
  if (userInvestments.length === 0) {
    const defaultInvestments = [
      {
        id: `inv-selic-${req.user.id}`,
        userId: req.user.id,
        name: "Tesouro Selic",
        institution: "Tesouro Direto",
        type: "RENDA_FIXA",
        initialAmount: 10000,
        currentAmount: 10850,
        expectedReturn: 10.75,
        riskLevel: "BAIXO",
        isActive: true,
        color: "#00E676",
        notes: "Reserva de Emergência",
        monthlyDeposit: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `inv-cdb120-${req.user.id}`,
        userId: req.user.id,
        name: "CDB 120% CDI",
        institution: "Banco Daycoval",
        type: "RENDA_FIXA",
        initialAmount: 5000,
        currentAmount: 5480,
        expectedReturn: 12.78,
        riskLevel: "BAIXO",
        isActive: true,
        color: "#A55EEA",
        notes: "Liquidez Diária pós FGC",
        monthlyDeposit: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    db.investments.push(...defaultInvestments);
    writeDb(db);
    userInvestments = defaultInvestments;
  }
  
  // Anexa logs históricos para cada investimento correspondente
  const richInvestments = userInvestments.map(inv => {
    const logs = db.investmentLogs.filter(log => log.investmentId === inv.id);
    return { ...inv, logs };
  });

  res.json(richInvestments);
});

app.post("/api/investments", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investments) db.investments = [];
  if (!db.investmentLogs) db.investmentLogs = [];

  const initialAmount = parseFloat(req.body.initialAmount) || 0;
  
  const newInvestment = {
    id: `inv-${crypto.randomUUID()}`,
    userId: req.user.id,
    name: req.body.name || "Novo Investimento",
    type: req.body.type || "RENDA_FIXA",
    profile: req.body.profile || "MODERADO",
    institution: req.body.institution || "",
    initialAmount: initialAmount,
    currentAmount: parseFloat(req.body.currentAmount) || initialAmount,
    monthlyDeposit: parseFloat(req.body.monthlyDeposit) || 0,
    startDate: req.body.startDate || new Date().toISOString(),
    maturityDate: req.body.maturityDate || null,
    expectedReturn: parseFloat(req.body.expectedReturn) || 0,
    actualReturn: parseFloat(req.body.actualReturn) || 0,
    riskLevel: req.body.riskLevel || "MEDIO",
    isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
    notes: req.body.notes || "",
    color: req.body.color || "#4F46E5",
    icon: req.body.icon || "📈",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.investments.push(newInvestment);

  // Cria um log inicial
  db.investmentLogs.push({
    id: `log-${crypto.randomUUID()}`,
    investmentId: newInvestment.id,
    date: new Date().toISOString(),
    amount: initialAmount,
    deposit: initialAmount,
    withdrawal: 0,
    returnRate: 0,
    notes: "Abertura / Lançamento Inicial",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ ...newInvestment, logs: db.investmentLogs.filter(l => l.investmentId === newInvestment.id) });
});

app.put("/api/investments/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investments) db.investments = [];

  const inv = db.investments.find(i => i.id === req.params.id && i.userId === req.user.id);
  if (!inv) return res.status(404).json({ message: "Investimento não encontrado." });

  if (req.body.name !== undefined) inv.name = req.body.name;
  if (req.body.type !== undefined) inv.type = req.body.type;
  if (req.body.profile !== undefined) inv.profile = req.body.profile;
  if (req.body.institution !== undefined) inv.institution = req.body.institution;
  if (req.body.initialAmount !== undefined) inv.initialAmount = parseFloat(req.body.initialAmount) || 0;
  if (req.body.currentAmount !== undefined) inv.currentAmount = parseFloat(req.body.currentAmount) || 0;
  if (req.body.monthlyDeposit !== undefined) inv.monthlyDeposit = parseFloat(req.body.monthlyDeposit) || 0;
  if (req.body.startDate !== undefined) inv.startDate = req.body.startDate;
  if (req.body.maturityDate !== undefined) inv.maturityDate = req.body.maturityDate;
  if (req.body.expectedReturn !== undefined) inv.expectedReturn = parseFloat(req.body.expectedReturn) || 0;
  if (req.body.actualReturn !== undefined) inv.actualReturn = parseFloat(req.body.actualReturn) || 0;
  if (req.body.riskLevel !== undefined) inv.riskLevel = req.body.riskLevel;
  if (req.body.isActive !== undefined) inv.isActive = !!req.body.isActive;
  if (req.body.notes !== undefined) inv.notes = req.body.notes;
  if (req.body.color !== undefined) inv.color = req.body.color;
  if (req.body.icon !== undefined) inv.icon = req.body.icon;

  inv.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(inv);
});

app.delete("/api/investments/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investments) db.investments = [];
  if (!db.investmentLogs) db.investmentLogs = [];

  const initialLength = db.investments.length;
  db.investments = db.investments.filter(i => !(i.id === req.params.id && i.userId === req.user.id));
  if (db.investments.length === initialLength) return res.status(404).json({ message: "Investimento não encontrado." });

  // Exclui logs históricos integrados
  db.investmentLogs = db.investmentLogs.filter(log => log.investmentId !== req.params.id);

  writeDb(db);
  res.json({ success: true });
});

// Registrar Transações Históricas no Investimento (Depósitos / Retiradas)
app.post("/api/investments/:id/log", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investments) db.investments = [];
  if (!db.investmentLogs) db.investmentLogs = [];

  const inv = db.investments.find(i => i.id === req.params.id && i.userId === req.user.id);
  if (!inv) return res.status(404).json({ message: "Investimento não encontrado." });

  const deposit = parseFloat(req.body.deposit) || 0;
  const withdrawal = parseFloat(req.body.withdrawal) || 0;
  const amount = parseFloat(req.body.amount) || inv.currentAmount;

  // Atualiza o montante atual do investimento
  if (deposit > 0) {
    inv.currentAmount += deposit;
  }
  if (withdrawal > 0) {
    inv.currentAmount = Math.max(0, inv.currentAmount - withdrawal);
  }
  if (req.body.amount !== undefined) {
    inv.currentAmount = amount;
  }

  const newLog = {
    id: `log-${crypto.randomUUID()}`,
    investmentId: inv.id,
    date: req.body.date || new Date().toISOString(),
    amount: inv.currentAmount,
    deposit,
    withdrawal,
    returnRate: parseFloat(req.body.returnRate) || 0,
    notes: req.body.notes || "",
    createdAt: new Date().toISOString()
  };

  db.investmentLogs.push(newLog);
  inv.updatedAt = new Date().toISOString();

  writeDb(db);
  res.status(201).json({ investment: inv, log: newLog });
});

// 2. ---- METAS DE INVESTIMENTOS ----
app.get("/api/investment-goals", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investmentGoals) db.investmentGoals = [];
  const userGoals = db.investmentGoals.filter(g => g.userId === req.user.id);
  res.json(userGoals);
});

app.post("/api/investment-goals", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investmentGoals) db.investmentGoals = [];

  const newGoal = {
    id: `goal-${crypto.randomUUID()}`,
    userId: req.user.id,
    title: req.body.title || "Minha Meta",
    targetAmount: parseFloat(req.body.targetAmount) || 0,
    currentAmount: parseFloat(req.body.currentAmount) || 0,
    targetDate: req.body.targetDate || new Date().toISOString(),
    monthlyNeeded: parseFloat(req.body.monthlyNeeded) || 0,
    color: req.body.color || "#00D2FF",
    isCompleted: req.body.isCompleted !== undefined ? !!req.body.isCompleted : false,
    completedAt: req.body.isCompleted ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.investmentGoals.push(newGoal);
  writeDb(db);
  res.status(201).json(newGoal);
});

app.put("/api/investment-goals/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investmentGoals) db.investmentGoals = [];

  const goal = db.investmentGoals.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!goal) return res.status(404).json({ message: "Meta de investimento não encontrada." });

  if (req.body.title !== undefined) goal.title = req.body.title;
  if (req.body.targetAmount !== undefined) goal.targetAmount = parseFloat(req.body.targetAmount) || 0;
  if (req.body.currentAmount !== undefined) goal.currentAmount = parseFloat(req.body.currentAmount) || 0;
  if (req.body.targetDate !== undefined) goal.targetDate = req.body.targetDate;
  if (req.body.monthlyNeeded !== undefined) goal.monthlyNeeded = parseFloat(req.body.monthlyNeeded) || 0;
  if (req.body.color !== undefined) goal.color = req.body.color;
  
  if (req.body.isCompleted !== undefined) {
    goal.isCompleted = !!req.body.isCompleted;
    goal.completedAt = !!req.body.isCompleted ? new Date().toISOString() : null;
  }

  goal.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(goal);
});

app.delete("/api/investment-goals/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.investmentGoals) db.investmentGoals = [];

  const initialLength = db.investmentGoals.length;
  db.investmentGoals = db.investmentGoals.filter(g => !(g.id === req.params.id && g.userId === req.user.id));
  if (db.investmentGoals.length === initialLength) return res.status(404).json({ message: "Meta de investimento não encontrada." });

  writeDb(db);
  res.json({ success: true });
});


// 3. ---- EMPRÉSTIMOS & CONSÓRCIOS API ----
app.get("/api/loans", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.loans) db.loans = [];
  if (!db.loanPayments) db.loanPayments = [];
  if (!db.loanStrategies) db.loanStrategies = [];

  let userLoans = db.loans.filter(l => l.userId === req.user.id);

  if (userLoans.length === 0) {
    const defaultLoans = [
      {
        id: `loan-nubank-${req.user.id}`,
        userId: req.user.id,
        name: "Cartão Nubank",
        institution: "Nubank",
        type: "CARTAO_CREDITO",
        totalAmount: 3500,
        remainingAmount: 3500,
        interestRate: 14.0,
        interestRateYear: 168.0,
        installmentValue: 500,
        totalInstallments: 30,
        paidInstallments: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 30)).toISOString(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        status: "ACTIVE",
        hasPortability: false,
        penaltyAmount: 11500, // stored total interest
        earlyPaymentFee: 10,  // stored due day
        notes: "Cartão rotativo de juros altos",
        color: "#A55EEA",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `loan-banco-${req.user.id}`,
        userId: req.user.id,
        name: "Empréstimo Banco",
        institution: "Banco do Brasil",
        type: "PESSOAL",
        totalAmount: 15000,
        remainingAmount: 15000,
        interestRate: 3.5,
        interestRateYear: 42.0,
        installmentValue: 800,
        totalInstallments: 32,
        paidInstallments: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 32)).toISOString(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        status: "ACTIVE",
        hasPortability: false,
        penaltyAmount: 10600, // stored total interest
        earlyPaymentFee: 15,  // stored due day
        notes: "Crédito pessoal consignado",
        color: "#FF9F43",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `loan-carro-${req.user.id}`,
        userId: req.user.id,
        name: "Financiamento Carro",
        institution: "Santander",
        type: "FINANCIAMENTO_AUTO",
        totalAmount: 35000,
        remainingAmount: 35000,
        interestRate: 1.2,
        interestRateYear: 14.4,
        installmentValue: 1200,
        totalInstallments: 37,
        paidInstallments: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 37)).toISOString(),
        nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        status: "ACTIVE",
        hasPortability: false,
        penaltyAmount: 9400, // stored total interest
        earlyPaymentFee: 5,  // stored due day
        notes: "Financiamento veículo seminovo",
        color: "#00D2FF",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    db.loans.push(...defaultLoans);
    
    // Auto-populate monthly payments
    defaultLoans.forEach(loan => {
      for (let i = 1; i <= loan.totalInstallments; i++) {
        db.loanPayments.push({
          id: `pay-${loan.id}-${i}`,
          loanId: loan.id,
          installmentNum: i,
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + i)).toISOString().split("T")[0],
          isPaid: false,
          scheduledAmount: loan.installmentValue,
          createdAt: new Date().toISOString()
        });
      }
      
      // Auto-populate default simulation strategies
      db.loanStrategies.push({
        id: `strat-aval-${loan.id}`,
        loanId: loan.id,
        strategyType: "AVALANCHE",
        title: "Quitação Acelerada Avalanche",
        description: `Foque recursos extras nesta dívida de taxa de juros ${loan.interestRate}% ao mês para maximizar a economia de juros no longo prazo.`,
        potentialSaving: loan.penaltyAmount * 0.45,
        monthsSaved: Math.round(loan.totalInstallments * 0.3),
        isApplied: false,
        priority: 10,
        createdAt: new Date().toISOString()
      });
    });

    writeDb(db);
    userLoans = defaultLoans;
  }

  // Encontra as parcelas e as estratégias de amortização
  const richLoans = userLoans.map(loan => {
    const payments = db.loanPayments.filter(p => p.loanId === loan.id).sort((a, b) => a.installmentNum - b.installmentNum);
    const strategies = db.loanStrategies.filter(s => s.loanId === loan.id).sort((a, b) => b.priority - a.priority);
    return { ...loan, payments, strategies };
  });

  res.json(richLoans);
});

app.post("/api/loans", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.loans) db.loans = [];
  if (!db.loanPayments) db.loanPayments = [];
  if (!db.loanStrategies) db.loanStrategies = [];

  const totalAmount = parseFloat(req.body.totalAmount) || 0;
  const totalInstallments = parseInt(req.body.totalInstallments) || 12;
  const interestRate = parseFloat(req.body.interestRate) || 0; // Taxa mensal (%)
  
  // Cálculo básico da parcela (Tabela PRICE/SAC simplificado ou linear simples)
  // Valor da parcela linear = (totalAmount + (totalAmount * (interestRate/100) * totalInstallments)) / totalInstallments
  const totalInterest = totalAmount * (interestRate / 100) * totalInstallments;
  const calculatedInstallment = (totalAmount + totalInterest) / totalInstallments;
  
  const installmentValue = parseFloat(req.body.installmentValue) || calculatedInstallment;

  const newLoan = {
    id: `loan-${crypto.randomUUID()}`,
    userId: req.user.id,
    name: req.body.name || "Novo Contrato",
    institution: req.body.institution || "Banco do Brasil",
    type: req.body.type || "PESSOAL",
    totalAmount: totalAmount,
    remainingAmount: parseFloat(req.body.remainingAmount) || totalAmount,
    interestRate: interestRate,
    interestRateYear: parseFloat(req.body.interestRateYear) || (interestRate * 12),
    installmentValue: installmentValue,
    totalInstallments: totalInstallments,
    paidInstallments: parseInt(req.body.paidInstallments) || 0,
    startDate: req.body.startDate || new Date().toISOString(),
    endDate: req.body.endDate || new Date(new Date().setMonth(new Date().getMonth() + totalInstallments)).toISOString(),
    nextDueDate: req.body.nextDueDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    status: req.body.status || "ACTIVE",
    hasPortability: req.body.hasPortability !== undefined ? !!req.body.hasPortability : false,
    penaltyAmount: parseFloat(req.body.penaltyAmount) || 0,
    earlyPaymentFee: parseFloat(req.body.earlyPaymentFee) || 0,
    notes: req.body.notes || "",
    color: req.body.color || "#EF4444",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.loans.push(newLoan);

  // Auto-gerar cronograma de parcelas (Breakdown financeiro)
  const startD = new Date(newLoan.startDate);
  for (let i = 1; i <= totalInstallments; i++) {
    const pDate = new Date(startD);
    pDate.setMonth(startD.getMonth() + i);

    db.loanPayments.push({
      id: `pay-${crypto.randomUUID()}`,
      loanId: newLoan.id,
      installmentNum: i,
      dueDate: pDate.toISOString().split("T")[0],
      paidDate: i <= newLoan.paidInstallments ? new Date().toISOString() : undefined,
      scheduledAmount: installmentValue,
      paidAmount: i <= newLoan.paidInstallments ? installmentValue : undefined,
      isPaid: i <= newLoan.paidInstallments,
      isExtraPayment: false,
      notes: i <= newLoan.paidInstallments ? "Pago retroativo no lançamento" : "",
      createdAt: new Date().toISOString()
    });
  }

  // Auto-gerar estratégias iniciais inteligentes baseadas nos parâmetros do empréstimo!
  // Estratégia 1: Amortização Extra (Bola de Neve)
  db.loanStrategies.push({
    id: `strat-${crypto.randomUUID()}`,
    loanId: newLoan.id,
    strategyType: "AMORTIZACAO_EXTRA",
    title: "Amortização Recorrente (Bola de Neve)",
    description: `Aporte extra mensal de 10% do valor da parcela (${(installmentValue * 0.1).toFixed(2)}) de forma antecipada. Reduz consideravelmente o prazo e os juros totais ponderados.`,
    potentialSaving: parseFloat((totalInterest * 0.18).toFixed(2)),
    monthsSaved: Math.max(1, Math.round(totalInstallments * 0.12)),
    priority: 3,
    isApplied: false,
    createdAt: new Date().toISOString()
  });

  // Estratégia 2: Portabilidade de Dívida
  if (interestRate > 1.8) {
    db.loanStrategies.push({
      id: `strat-${crypto.randomUUID()}`,
      loanId: newLoan.id,
      strategyType: "PORTABILIDADE",
      title: "Portabilidade de Crédito",
      description: "Transferir o saldo devedor deste contrato para outra instituição bancária com taxa de juros competitiva inferior à atual.",
      potentialSaving: parseFloat((totalAmount * 0.05).toFixed(2)),
      monthsSaved: 0,
      priority: 2,
      isApplied: false,
      createdAt: new Date().toISOString()
    });
  }

  writeDb(db);
  
  res.status(201).json({
    ...newLoan,
    payments: db.loanPayments.filter(p => p.loanId === newLoan.id),
    strategies: db.loanStrategies.filter(s => s.loanId === newLoan.id)
  });
});

app.put("/api/loans/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.loans) db.loans = [];

  const loan = db.loans.find(l => l.id === req.params.id && l.userId === req.user.id);
  if (!loan) return res.status(404).json({ message: "Contrato de empréstimo não encontrado." });

  if (req.body.name !== undefined) loan.name = req.body.name;
  if (req.body.institution !== undefined) loan.institution = req.body.institution;
  if (req.body.type !== undefined) loan.type = req.body.type;
  if (req.body.totalAmount !== undefined) loan.totalAmount = parseFloat(req.body.totalAmount) || 0;
  if (req.body.remainingAmount !== undefined) loan.remainingAmount = parseFloat(req.body.remainingAmount) || 0;
  if (req.body.interestRate !== undefined) loan.interestRate = parseFloat(req.body.interestRate) || 0;
  if (req.body.interestRateYear !== undefined) loan.interestRateYear = parseFloat(req.body.interestRateYear) || 0;
  if (req.body.installmentValue !== undefined) loan.installmentValue = parseFloat(req.body.installmentValue) || 0;
  if (req.body.totalInstallments !== undefined) loan.totalInstallments = parseInt(req.body.totalInstallments) || 12;
  if (req.body.paidInstallments !== undefined) loan.paidInstallments = parseInt(req.body.paidInstallments) || 0;
  if (req.body.startDate !== undefined) loan.startDate = req.body.startDate;
  if (req.body.endDate !== undefined) loan.endDate = req.body.endDate;
  if (req.body.nextDueDate !== undefined) loan.nextDueDate = req.body.nextDueDate;
  if (req.body.status !== undefined) loan.status = req.body.status;
  if (req.body.hasPortability !== undefined) loan.hasPortability = !!req.body.hasPortability;
  if (req.body.penaltyAmount !== undefined) loan.penaltyAmount = parseFloat(req.body.penaltyAmount) || 0;
  if (req.body.earlyPaymentFee !== undefined) loan.earlyPaymentFee = parseFloat(req.body.earlyPaymentFee) || 0;
  if (req.body.notes !== undefined) loan.notes = req.body.notes;
  if (req.body.color !== undefined) loan.color = req.body.color;

  loan.updatedAt = new Date().toISOString();
  writeDb(db);
  res.json(loan);
});

app.delete("/api/loans/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.loans) db.loans = [];
  if (!db.loanPayments) db.loanPayments = [];
  if (!db.loanStrategies) db.loanStrategies = [];

  const initialLength = db.loans.length;
  db.loans = db.loans.filter(l => !(l.id === req.params.id && l.userId === req.user.id));
  if (db.loans.length === initialLength) return res.status(404).json({ message: "Contrato de empréstimo não encontrado." });

  // Limpa parcelas e estratégias relacionadas
  db.loanPayments = db.loanPayments.filter(p => p.loanId !== req.params.id);
  db.loanStrategies = db.loanStrategies.filter(s => s.loanId !== req.params.id);

  writeDb(db);
  res.json({ success: true });
});

// Registrar ou reverter pagamento de parcela
app.post("/api/loans/:id/payment/:paymentId/toggle", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.loans) db.loans = [];
  if (!db.loanPayments) db.loanPayments = [];

  const loan = db.loans.find(l => l.id === req.params.id && l.userId === req.user.id);
  if (!loan) return res.status(404).json({ message: "Contrato de empréstimo não encontrado." });

  const payment = db.loanPayments.find(p => p.id === req.params.paymentId && p.loanId === loan.id);
  if (!payment) return res.status(404).json({ message: "Parcela não encontrada." });

  if (payment.isPaid) {
    // Reverte pagamento
    payment.isPaid = false;
    payment.paidDate = undefined;
    payment.paidAmount = undefined;
    
    loan.paidInstallments = Math.max(0, loan.paidInstallments - 1);
    loan.remainingAmount = Math.min(loan.totalAmount, loan.remainingAmount + payment.scheduledAmount);
  } else {
    // Efetiva pagamento
    payment.isPaid = true;
    payment.paidDate = new Date().toISOString();
    payment.paidAmount = payment.scheduledAmount;

    loan.paidInstallments += 1;
    loan.remainingAmount = Math.max(0, loan.remainingAmount - payment.scheduledAmount);
    if (loan.remainingAmount === 0 || loan.paidInstallments === loan.totalInstallments) {
      loan.status = "PAID";
    }
  }

  // Atualiza o próximo vencimento para a próxima parcela em aberto
  const openPayments = db.loanPayments.filter(p => p.loanId === loan.id && !p.isPaid).sort((a, b) => a.installmentNum - b.installmentNum);
  if (openPayments.length > 0) {
    loan.nextDueDate = openPayments[0].dueDate;
  }

  loan.updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({
    loan,
    payments: db.loanPayments.filter(p => p.loanId === loan.id).sort((a, b) => a.installmentNum - b.installmentNum)
  });
});

// Toggle estratégia aplicada
app.post("/api/loans/:id/strategies/:strategyId/toggle", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.loanStrategies) db.loanStrategies = [];

  const strategy = db.loanStrategies.find(s => s.id === req.params.strategyId && s.loanId === req.params.id);
  if (!strategy) return res.status(404).json({ message: "Estratégia não encontrada." });

  strategy.isApplied = !strategy.isApplied;
  strategy.appliedAt = strategy.isApplied ? new Date().toISOString() : undefined;

  writeDb(db);
  res.json(strategy);
});

// ==== FASE 5: CENTRAL DE NOTIFICAÇÕES & LEMBRETES ====

app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];
  const userNotifications = db.notifications.filter(n => n.userId === req.user.id);
  userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userNotifications);
});

app.post("/api/notifications", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  const newNotification = {
    id: `notif-${crypto.randomUUID()}`,
    userId: req.user.id,
    title: req.body.title || "Novo Alerta",
    message: req.body.message || "",
    type: req.body.type || "INFO",
    isRead: false,
    actionUrl: req.body.actionUrl || "",
    createdAt: new Date().toISOString()
  };

  db.notifications.push(newNotification);
  writeDb(db);
  res.status(201).json(newNotification);
});

app.put("/api/notifications/:id/read", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!notif) return res.status(404).json({ message: "Notificação não encontrada." });

  notif.isRead = true;
  writeDb(db);
  res.json(notif);
});

app.post("/api/notifications/read-all", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  db.notifications.forEach(n => {
    if (n.userId === req.user.id) {
      n.isRead = true;
    }
  });

  writeDb(db);
  res.json({ success: true, message: "Todas as notificações marcadas como lidas." });
});

app.delete("/api/notifications/:id", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];

  const index = db.notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: "Notificação não encontrada." });

  db.notifications.splice(index, 1);
  writeDb(db);
  res.json({ success: true, id: req.params.id });
});

app.post("/api/notifications/generate-reminders", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];
  
  const userId = req.user.id;
  const now = new Date();
  const added: any[] = [];

  const addIfUnique = (title: string, message: string, type: string, actionUrl: string) => {
    const isDuplicate = db.notifications.some(
      n => n.userId === userId && n.title === title && !n.isRead
    );
    if (!isDuplicate) {
      const newNotif = {
        id: `notif-${crypto.randomUUID()}`,
        userId,
        title,
        message,
        type,
        isRead: false,
        actionUrl,
        createdAt: new Date().toISOString()
      };
      db.notifications.push(newNotif);
      added.push(newNotif);
    }
  };

  // 1. Verificar tarefas pendentes vencendo ou atrasadas
  if (db.tasks) {
    const userTasks = db.tasks.filter(t => t.userId === userId && t.status !== "DONE");
    userTasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff < 0) {
          addIfUnique(
            `⚠️ Tarefa Atrasada: ${task.title}`,
            `A tarefa "${task.title}" deveria ter sido concluída em ${new Date(task.dueDate).toLocaleDateString('pt-BR')}.`,
            "DANGER",
            "/tarefas"
          );
        } else if (daysDiff <= 2) {
          addIfUnique(
            `⏰ Tarefa Próxima do Fim: ${task.title}`,
            `A tarefa "${task.title}" vence em breve no dia ${new Date(task.dueDate).toLocaleDateString('pt-BR')}.`,
            "WARNING",
            "/tarefas"
          );
        }
      }
    });
  }

  // 2. Verificar hábitos pendentes de registro hoje
  if (db.habits) {
    const userHabits = db.habits.filter(h => h.userId === userId);
    const todayStr = now.toISOString().split("T")[0];
    const logMap = db.habitLogs ? db.habitLogs.filter(log => log.date === todayStr && log.completed) : [];
    
    userHabits.forEach(habit => {
      const isLoggedToday = logMap.some(log => log.habitId === habit.id);
      if (!isLoggedToday) {
        addIfUnique(
          `🔄 Hábito Pendente: ${habit.name}`,
          `Lembrete do dia: você já completou ou registrou o hábito "${habit.name}" hoje?`,
          "INFO",
          "/habitos"
        );
      }
    });
  }

  // 3. Verificar alarmes pendentes ativos
  if (db.alarms) {
    const userAlarms = db.alarms.filter(a => a.userId === userId && a.isActive);
    userAlarms.forEach(alarm => {
      const alarmDate = new Date(alarm.datetime);
      if (alarmDate > now) {
        const timeDiff = alarmDate.getTime() - now.getTime();
        const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        if (hoursDiff <= 24) {
          addIfUnique(
            `🔔 Despertador Agenda: ${alarm.title}`,
            `Lembrete: o despertador "${alarm.title}" está ativo para disparar em breve.`,
            "INFO",
            "/alarmes"
          );
        }
      }
    });
  }

  // 4. Verificar empréstimos com parcelas próximas do vencimento
  if (db.loans) {
    const userLoans = db.loans.filter(l => l.userId === userId && l.status === "ACTIVE");
    userLoans.forEach(loan => {
      if (loan.nextDueDate) {
        const dueDate = new Date(loan.nextDueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff <= 7 && daysDiff >= 0) {
          addIfUnique(
            `🏦 Vencimento de Parcela`,
            `A parcela do empréstimo "${loan.name}" (R$ ${loan.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) vence em ${daysDiff} dias.`,
            "WARNING",
            "/emprestimos"
          );
        }
      }
    });
  }

  // Se não houver notificações, insere notificações iniciais para inaugurar
  const userNotifications = db.notifications.filter(n => n.userId === userId);
  if (userNotifications.length === 0) {
    addIfUnique(
      "🚀 Bem-vindo à Inteligência DOLA AI!",
      "A sua central de alertas e lembrete síncronos em tempo real foi inicializada para te apoiar em decisões executivas.",
      "SUCCESS",
      "/dashboard"
    );
    addIfUnique(
      "📊 Gestão de Alertas Ativa",
      "Você receberá alertas dinâmicos sobre novos hábitos não preenchidos, atrasos de tarefas ou lembretes financeiros.",
      "INFO",
      "/dashboard"
    );
  }

  if (added.length > 0) {
    writeDb(db);
  }

  const finalNotifications = db.notifications.filter(n => n.userId === userId);
  finalNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(finalNotifications);
});

// ==== FASE 6: CENTRAL DE INTELIGÊNCIA EXECUTIVA (DOLA AI CHAT & AUDIT) ====

let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (aiClient) return aiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  aiClient = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  return aiClient;
}

// Auxiliar para gerar o sumário executivo da base real do usuário
function getUserExecutiveSummary(userId: string, db: any) {
  const userTasks = db.tasks ? db.tasks.filter((t: any) => t.userId === userId) : [];
  const activeTasks = userTasks.filter((t: any) => t.status !== "DONE");
  const completedTasksCount = userTasks.length - activeTasks.length;

  const userFinances = db.finances ? db.finances.filter((f: any) => f.userId === userId) : [];
  const income = userFinances.filter((f: any) => f.type === "INCOME").reduce((acc: number, cur: any) => acc + cur.amount, 0);
  const expenses = userFinances.filter((f: any) => f.type === "EXPENSE").reduce((acc: number, cur: any) => acc + cur.amount, 0);

  const userInvestments = db.investments ? db.investments.filter((i: any) => i.userId === userId) : [];
  const totalInvested = userInvestments.reduce((acc: number, cur: any) => acc + cur.currentValue, 0);

  const userLoans = db.loans ? db.loans.filter((l: any) => l.userId === userId && l.status === "ACTIVE") : [];
  const totalLoansAmount = userLoans.reduce((acc: number, cur: any) => acc + cur.remainingAmount, 0);

  const userHabits = db.habits ? db.habits.filter((h: any) => h.userId === userId) : [];
  const activeHabitsList = userHabits.map((h: any) => `${h.name} (${h.streak || 0} dias ativos)`).join(", ");

  const userNotes = db.notes ? db.notes.filter((n: any) => n.userId === userId) : [];
  const lastNotes = userNotes.slice(-3).map((n: any) => n.title).join(", ");

  return {
    activeTasksCount: activeTasks.length,
    activeTasksList: activeTasks.slice(0, 5).map((t: any) => t.title),
    completedTasksCount,
    income,
    expenses,
    balance: income - expenses,
    totalInvested,
    totalLoansAmount,
    habitsCount: userHabits.length,
    activeHabitsList: activeHabitsList || "Nenhum hábito cadastrado",
    notesCount: userNotes.length,
    notesSummary: lastNotes || "Nenhuma nota",
    rawString: `
[CONTEXTO REAL-TIME DO EXECUTIVO]
- Tarefas Pendentes: ${activeTasks.length} (Ex: ${activeTasks.slice(0, 3).map((t: any) => t.title).join(", ")})
- Tarefas Concluídas: ${completedTasksCount}
- Receita Mensal Cadastrada: R$ ${income.toLocaleString('pt-BR')}
- Despesa Mensal Cadastrada: R$ ${expenses.toLocaleString('pt-BR')}
- Balanço Geral Esperado: R$ ${(income - expenses).toLocaleString('pt-BR')}
- Patrimônio Total Investido: R$ ${totalInvested.toLocaleString('pt-BR')}
- Saldo Deduzível de Financiamentos: R$ ${totalLoansAmount.toLocaleString('pt-BR')}
- Hábitos Rastreáveis (Streaks): ${activeHabitsList || "Nenhum hábito de performance ativo"}
- Notas do Usuário: ${lastNotes || "Nenhuma anotação de cockpit registrada"}
`
  };
}

app.post("/api/assistant/chat", authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Mensagem é necessária." });

  const db = readDb();
  const summary = getUserExecutiveSummary(req.user.id, db);
  const gemini = getGenAI();

  if (!gemini) {
    const userMessageLower = message.toLowerCase();
    let textResponse = "";

    if (userMessageLower.includes("audit") || userMessageLower.includes("auditar") || userMessageLower.includes("finance") || userMessageLower.includes("invest")) {
      textResponse = `### **Relatório de Auditoria Central — DOLA AI** (Modo Local)

Analisando sua carteira e cronogramas ativos, compilei os seguintes apontamentos de alta prioridade:

1. **Eficiência Orçamentária**: Sua receita mensal está em **R$ ${summary.income.toLocaleString('pt-BR')}** com despesas de **R$ ${summary.expenses.toLocaleString('pt-BR')}**, resultando em uma gordura financeira de **R$ ${summary.balance.toLocaleString('pt-BR')}** (${summary.income > 0 ? Math.round((summary.balance / summary.income) * 100) : 0}% de taxa de poupança comercial).
2. **Exposição de Dívida**: Você possui **R$ ${summary.totalLoansAmount.toLocaleString('pt-BR')}** ativos em compromissos concessionários. Recomendo usar a estratégia de aceleração Avalanche para reduzir os juros rapidamente.
3. **Pendências do Dia**: Há **${summary.activeTasksCount} tarefas** em aberto na sua agenda de execução. 

*Configure a chave corporativa \`GEMINI_API_KEY\` no painel de segredos para análises preditivas via inteligência artificial.*`;
    } else if (userMessageLower.includes("tarefa") || userMessageLower.includes("habito") || userMessageLower.includes("agenda")) {
      textResponse = `### **Plano Estratégico de Produtividade** (Modo Local)

Analisando sua estrutura de tempo:
* Suas tarefas marcadas para hoje totalizam **${summary.activeTasksCount} pendências**.
* Seu foco de hábitos tem **${summary.habitsCount} rotinas em monitoramento** (${summary.activeHabitsList}).

**Recomendação de Fluxo**: Aplique a técnica de 'Timeboxing' para segmentar sua manhã com as 3 tarefas de maior impacto estratégico.`;
    } else {
      textResponse = `Olá! Sou o **DOLA AI**, seu assistente executivo pessoal. 

Estou analisando seu ecossistema ativo de produtividade e finanças em tempo real:
* Suas despesas mensais estão em **R$ ${summary.expenses.toLocaleString('pt-BR')}** de uma receita de **R$ ${summary.income.toLocaleString('pt-BR')}**.
* O valor de patrimônio alocado em investimentos é de **R$ ${summary.totalInvested.toLocaleString('pt-BR')}**.
* Temos **${summary.activeTasksCount} tarefas pendentes** e **${summary.habitsCount} hábitos ativos**.

Como posso otimizar sua tomada de decisão hoje? Você pode me perguntar sobre finanças, produtividade ou solicitar uma auditoria geral!`;
    }

    return res.json({ text: textResponse });
  }

  try {
    const systemPrompt = `Você é o DOLA AI, a inteligência central e assistente executivo pessoal definitivo. Seu foco é produtividade militar de altíssima performance, eficiência intelectual e inteligência financeira avançada.

Dados reais do usuário fornecidos em tempo real pelo sistema:
${summary.rawString}

Instruções de Resposta:
- Seja extremamente pragmático, consiso, inteligente e executivo. Fale como um consultor financeiro de elite ou chefe de operações de alto impacto de TI.
- Use Markdown bem estruturado (negritos, listas curtas e espaçamento sofisticado).
- Nunca diga que você é um modelo de IA genérico nem faça introduções prolixas. Comece diretamente respondendo ao que o executivo te perguntou.
- Se solicitado auditoria ou recomendação, mencione valores específicos obtidos no contexto do usuário e passe um plano de ação claro de 3 passos práticos.`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nMensagem do usuário: ${message}` }] }
      ]
    });

    const text = response.text || "Sem resposta da inteligência central no momento.";
    res.json({ text });
  } catch (err: any) {
    console.error("Erro no Gemini Chat API:", err);
    res.status(500).json({ message: "Erro ao consultar a inteligência central do Gemini.", error: err.message });
  }
});

// ==== FASE 7: TRILHA DE AUDITORIA DE SEGURANÇA & LOGS DE ATIVIDADE EXECUTIVA ====

app.get("/api/activity-logs", authenticateToken, (req: any, res) => {
  const db = readDb();
  if (!db.activityLogs) db.activityLogs = [];

  // Se for SUPERADMIN, pode ver logs de todos. Caso contrário, apenas os próprios logs.
  let filteredLogs = db.activityLogs;
  if (req.user.role !== "SUPERADMIN") {
    filteredLogs = db.activityLogs.filter(log => log.userId === req.user.id);
  }

  // Mapeia usuários para enriquecer com nome e e-mail
  const usersMap: any = {};
  db.users.forEach((u: any) => {
    usersMap[u.id] = { name: u.name, email: u.email, avatar: u.avatar };
  });

  const enrichedLogs = filteredLogs.map((log: any) => ({
    ...log,
    user: usersMap[log.userId] || { name: "Usuário do Espaço", email: "", avatar: "" }
  }));

  // Ordenar decrescente (mais recente primeiro)
  enrichedLogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(enrichedLogs);
});

app.post("/api/activity-logs/clear", authenticateToken, (req: any, res) => {
  if (req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Apenas administradores de infraestrutura e gerenciamento podem limpar os logs." });
  }

  const db = readDb();
  db.activityLogs = [];
  writeDb(db);

  logActivity(
    req.user.id,
    "CLEAR",
    "System",
    null,
    "Limpeza consolidada da trilha de auditoria efetuada na conta superadmin.",
    (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress
  );

  res.json({ success: true, message: "Trilha de auditoria reiniciada com sucesso." });
});

app.post("/api/activity-logs/simulate-security-alert", authenticateToken, (req: any, res) => {
  const { type } = req.body;
  let action = "SECURITY_ALERT";
  let details = "";
  let entity = "System";

  if (type === "unusual_login") {
    details = "Tentativa suspeita de login rejeitada vinda de IP externo de geolocalização não reconhecida (Hong Kong, CN).";
  } else if (type === "rate_limit") {
    details = "Alerta: Limite de requisições excedido temporariamente (DDoS Prevention Triggered) para a rota de assistente.";
  } else if (type === "api_key") {
    details = "Parâmetros e chaves secretas empresariais sanitizados e auditados com checksum válido de integridade.";
  } else {
    details = "Checkup operacional periódico de segurança: Nenhum exploit, injeção ou falha detectada nas últimas 24h.";
    action = "CHECKUP";
  }

  const log = logActivity(
    req.user.id,
    action,
    entity,
    null,
    details,
    "190.12.87.143"
  );

  res.json(log);
});


// ---- ROTAS DE PORTABILIDADE E BACKUP DE DADOS (IMPORT / EXPORT MULTI-FORMATO) ----

app.get("/api/data/export", authenticateToken, (req: any, res) => {
  try {
    const db = readDb();
    const userId = req.user.id;

    const userTasks = (db.tasks || []).filter(item => item.userId === userId);
    const userEvents = (db.events || []).filter(item => item.userId === userId);
    const userAlarms = (db.alarms || []).filter(item => item.userId === userId);
    const userNotes = (db.notes || []).filter(item => item.userId === userId);
    const userFinances = (db.finances || []).filter(item => item.userId === userId);
    const userInvestments = (db.investments || []).filter(item => item.userId === userId);
    const userInvestmentGoals = (db.investmentGoals || []).filter(item => item.userId === userId);
    const userLoans = (db.loans || []).filter(item => item.userId === userId);

    const userHabits = (db.habits || []).filter(item => item.userId === userId);
    const habitIds = userHabits.map(h => h.id);
    const userHabitLogs = (db.habitLogs || []).filter(log => habitIds.includes(log.habitId));

    const investmentIds = userInvestments.map(inv => inv.id);
    const userInvestmentLogs = (db.investmentLogs || []).filter(log => investmentIds.includes(log.investmentId));

    const loanIds = userLoans.map(l => l.id);
    const userLoanPayments = (db.loanPayments || []).filter(pay => loanIds.includes(pay.loanId));
    const userLoanStrategies = (db.loanStrategies || []).filter(strat => loanIds.includes(strat.loanId));

    const exportData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      tasks: userTasks,
      events: userEvents,
      alarms: userAlarms,
      notes: userNotes,
      finances: userFinances,
      habits: userHabits,
      habitLogs: userHabitLogs,
      investments: userInvestments,
      investmentLogs: userInvestmentLogs,
      investmentGoals: userInvestmentGoals,
      loans: userLoans,
      loanPayments: userLoanPayments,
      loanStrategies: userLoanStrategies,
      exportedAt: new Date().toISOString()
    };

    logActivity(
      userId, 
      "EXPORT", 
      "System", 
      null, 
      "Backup e exportação completa dos dados do usuário executados nos formatos do sistema.", 
      (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress
    );

    res.json(exportData);
  } catch (err: any) {
    console.error("Erro ao exportar dados:", err);
    res.status(500).json({ message: "Erro interno ao processar exportação de dados." });
  }
});

app.post("/api/data/import", authenticateToken, (req: any, res) => {
  try {
    const db = readDb();
    const userId = req.user.id;
    const importPayload = req.body;

    if (!importPayload) {
      return res.status(400).json({ message: "Dados de importação inválidos ou ausentes." });
    }

    // Limpa dados antigos do usuário logado (Overwrites backup)
    db.tasks = (db.tasks || []).filter(item => item.userId !== userId);
    db.events = (db.events || []).filter(item => item.userId !== userId);
    db.alarms = (db.alarms || []).filter(item => item.userId !== userId);
    db.notes = (db.notes || []).filter(item => item.userId !== userId);
    db.finances = (db.finances || []).filter(item => item.userId !== userId);
    db.investmentGoals = (db.investmentGoals || []).filter(item => item.userId !== userId);

    const oldHabitIds = (db.habits || []).filter(h => h.userId === userId).map(h => h.id);
    db.habits = (db.habits || []).filter(h => h.userId !== userId);
    db.habitLogs = (db.habitLogs || []).filter(log => !oldHabitIds.includes(log.habitId));

    const oldInvestmentIds = (db.investments || []).filter(i => i.userId === userId).map(i => i.id);
    db.investments = (db.investments || []).filter(i => i.userId !== userId);
    db.investmentLogs = (db.investmentLogs || []).filter(log => !oldInvestmentIds.includes(log.investmentId));

    const oldLoanIds = (db.loans || []).filter(l => l.userId === userId).map(l => l.id);
    db.loans = (db.loans || []).filter(l => l.userId !== userId);
    db.loanPayments = (db.loanPayments || []).filter(pay => !oldLoanIds.includes(pay.loanId));
    db.loanStrategies = (db.loanStrategies || []).filter(strat => !oldLoanIds.includes(strat.loanId));

    let counts = {
      tasks: 0,
      events: 0,
      alarms: 0,
      notes: 0,
      finances: 0,
      habits: 0,
      investments: 0,
      loans: 0
    };

    // Populando novamente e garantindo reassociação segura com o userId logado
    if (Array.isArray(importPayload.tasks)) {
      importPayload.tasks.forEach((t: any) => {
        t.userId = userId;
        if (!t.id || typeof t.id !== "string") t.id = `task-${crypto.randomUUID()}`;
        db.tasks.push(t);
        counts.tasks++;
      });
    }

    if (Array.isArray(importPayload.events)) {
      importPayload.events.forEach((e: any) => {
        e.userId = userId;
        if (!e.id || typeof e.id !== "string") e.id = `event-${crypto.randomUUID()}`;
        db.events.push(e);
        counts.events++;
      });
    }

    if (Array.isArray(importPayload.alarms)) {
      importPayload.alarms.forEach((a: any) => {
        a.userId = userId;
        if (!a.id || typeof a.id !== "string") a.id = `alarm-${crypto.randomUUID()}`;
        db.alarms.push(a);
        counts.alarms++;
      });
    }

    if (Array.isArray(importPayload.notes)) {
      importPayload.notes.forEach((n: any) => {
        n.userId = userId;
        if (!n.id || typeof n.id !== "string") n.id = `note-${crypto.randomUUID()}`;
        db.notes.push(n);
        counts.notes++;
      });
    }

    if (Array.isArray(importPayload.finances)) {
      importPayload.finances.forEach((f: any) => {
        f.userId = userId;
        if (!f.id || typeof f.id !== "string") f.id = `finance-${crypto.randomUUID()}`;
        db.finances.push(f);
        counts.finances++;
      });
    }

    if (Array.isArray(importPayload.investmentGoals)) {
      importPayload.investmentGoals.forEach((g: any) => {
        g.userId = userId;
        if (!g.id || typeof g.id !== "string") g.id = `goal-${crypto.randomUUID()}`;
        db.investmentGoals.push(g);
      });
    }

    if (Array.isArray(importPayload.habits)) {
      importPayload.habits.forEach((h: any) => {
        h.userId = userId;
        if (!h.id || typeof h.id !== "string") h.id = `habit-${crypto.randomUUID()}`;
        db.habits.push(h);
        counts.habits++;
      });
    }

    if (Array.isArray(importPayload.habitLogs)) {
      importPayload.habitLogs.forEach((l: any) => {
        if (!l.id || typeof l.id !== "string") l.id = `log-${crypto.randomUUID()}`;
        db.habitLogs.push(l);
      });
    }

    if (Array.isArray(importPayload.investments)) {
      importPayload.investments.forEach((i: any) => {
        i.userId = userId;
        if (!i.id || typeof i.id !== "string") i.id = `inv-${crypto.randomUUID()}`;
        db.investments.push(i);
        counts.investments++;
      });
    }

    if (Array.isArray(importPayload.investmentLogs)) {
      importPayload.investmentLogs.forEach((l: any) => {
        if (!l.id || typeof l.id !== "string") l.id = `log-${crypto.randomUUID()}`;
        db.investmentLogs.push(l);
      });
    }

    if (Array.isArray(importPayload.loans)) {
      importPayload.loans.forEach((l: any) => {
        l.userId = userId;
        if (!l.id || typeof l.id !== "string") l.id = `loan-${crypto.randomUUID()}`;
        db.loans.push(l);
        counts.loans++;
      });
    }

    if (Array.isArray(importPayload.loanPayments)) {
      importPayload.loanPayments.forEach((p: any) => {
        if (!p.id || typeof p.id !== "string") p.id = `pay-${crypto.randomUUID()}`;
        db.loanPayments.push(p);
      });
    }

    if (Array.isArray(importPayload.loanStrategies)) {
      importPayload.loanStrategies.forEach((s: any) => {
        if (!s.id || typeof s.id !== "string") s.id = `strat-${crypto.randomUUID()}`;
        db.loanStrategies.push(s);
      });
    }

    writeDb(db);

    logActivity(
      userId,
      "IMPORT",
      "System",
      null,
      `Restauração completa de backup efetuada pelo executivo.`,
      (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress
    );

    res.json({
      success: true,
      message: "Backup integrado e re-sincronizado com o Dola AI!",
      counts
    });
  } catch (err: any) {
    console.error("Erro ao importar dados:", err);
    res.status(500).json({ message: "Erro interno no servidor ao restaurar os dados." });
  }
});


// ---- SERVIR O VITE ----
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dola AI Server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
