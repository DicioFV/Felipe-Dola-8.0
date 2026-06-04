// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/components/auth/LoginPage.tsx
// Fase: 1
// ============================================

import React, { useState, useEffect } from "react";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, Terminal, Fingerprint, User, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useToast } from "@/src/components/ui/Toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  
  // States
  const [view, setView] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("123456"); // Default/Pre-filled of 123456 as requested
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("123456");

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);

  // Reset Password fields
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isScanning, setIsScanning] = useState(false);

  // Read URL parameters for reset token
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token") || new URLSearchParams(window.location.hash.split("?")[1]).get("token");
      if (token) {
        setResetToken(token);
        setView("reset");
        toast("Token de redefinição de senha carregado!", "info");
      }
    } catch (e) {
      console.error("Erro ao ler token da URL:", e);
    }
  }, [toast]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      toast("Por favor, preencha todos os campos.", "warning");
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, cleanPassword);
      toast("Login realizado com sucesso! Bem-vindo.", "success");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "E-mail ou senha incorretos.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = signUpEmail.trim();
    const cleanPassword = signUpPassword.trim();
    const cleanConfirm = signUpConfirmPassword.trim();
    const cleanName = signUpName.trim();

    if (!cleanEmail) {
      toast("O e-mail é obrigatório.", "warning");
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      toast("As senhas informadas não coincidem.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Falha ao realizar cadastro.");
      }

      toast("Cadastro realizado com sucesso! Conectando...", "success");
      
      // Auto login
      await login(cleanEmail, cleanPassword);
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Erro ao criar conta de acesso.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot/Recovery submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      toast("Por favor, preencha seu e-mail.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "E-mail não encontrado.");
      }

      setSimulatedLink(data.resetLink);
      // Extract token from resetLink
      const token = data.resetLink.split("=")[1];
      setSimulatedToken(token);
      toast("Link de recuperação gerado com sucesso!", "success");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Erro no envio de e-mail de recuperação.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast("Preencha todos os campos de senha.", "warning");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast("As novas senhas digitadas não coincidem.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erro ao redefinir a senha.");
      }

      toast("Senha redefinida com sucesso! Faça login abaixo.", "success");
      // Reset inputs & switch
      setEmail(email || forgotEmail || "");
      setPassword(newPassword);
      setNewPassword("");
      setConfirmNewPassword("");
      setView("login");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Token inválido, expirado ou erro no servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintAuth = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      try {
        await login("10felitec@gmail.com", "135Amor.");
        toast("Biometria reconhecida com sucesso! Bem-vindo ao DOLA AI.", "success");
      } catch (err) {
        toast("Falha na autenticação por biometria do dispositivo.", "error");
      } finally {
        setIsScanning(false);
      }
    }, 1800);
  };

  const handleFillSuperAdmin = () => {
    setEmail("10felitec@gmail.com");
    setPassword("135Amor.");
    toast("Credenciais do Super Admin preenchidas!", "info");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0A0A0F] overflow-hidden select-none">
      {/* Decorative ambient spots */}
      <div className="glow-spot top-[-100px] left-[-100px]" />
      <div className="glow-spot bottom-[-100px] right-[-150px] bg-cyan-500/5 hover:scale-110 transition-transform duration-1000" />

      {/* Auth Box Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center gap-3 mb-6 animate-fadeIn">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#00D2FF] p-2.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-xl font-bold font-display text-white tracking-widest">D</span>
          </div>
          <div className="flex flex-col items-center text-center text-left">
            <h1 className="text-2xl font-display font-medium tracking-tight text-white mb-1">
              DOLA AI
            </h1>
            <p className="text-xs text-[#8888A0] uppercase tracking-wider font-semibold">
              Executive Assistant Platform
            </p>
          </div>
        </div>

        {/* 1. LOGIN VIEW */}
        {view === "login" && (
          <div className="animate-fadeIn">
            <Card className="glass-panel border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <CardHeader className="p-0 mb-5 text-left">
                <CardTitle className="text-lg font-semibold text-white">Login seguro</CardTitle>
                <CardDescription className="text-xs text-[#8888A0]">
                  Insira suas credenciais para gerenciar a plataforma
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
                  {/* E-mail */}
                  <div className="relative flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-medium text-[#8888A0]">E-mail</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemplo@gmail.com"
                        autoComplete="email"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-purple-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="relative flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#8888A0]">Senha</label>
                      <button
                        type="button"
                        onClick={() => { setView("forgot"); setSimulatedLink(null); }}
                        className="text-xs font-semibold text-[#6C5CE7] hover:text-[#00D2FF] transition-colors cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-purple-500/80 pl-10 pr-10 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10 font-sans"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8888A0]/60 hover:text-[#F1F1F3] transition-colors cursor-pointer animate-fadeIn"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full mt-2 font-display bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg shadow-lg shadow-purple-500/15 py-2.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    {!loading && <ShieldCheck size={16} />}
                    Acessar Plataforma
                  </Button>
                </form>

                {/* Redirecionamento para cadastro */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-[#8888A0]">
                    Entrar com outra conta?{" "}
                    <button
                      onClick={() => setView("signup")}
                      className="font-bold text-[#00D2FF] hover:underline cursor-pointer"
                    >
                      Criar cadastro de e-mail
                    </button>
                  </p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/[0.04]"></div>
                  <span className="flex-shrink mx-2 text-[9px] text-[#8888A0]/60 font-semibold uppercase tracking-wider">Acesso Biométrico</span>
                  <div className="flex-grow border-t border-white/[0.04]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleFingerprintAuth}
                  className="w-full flex items-center justify-center gap-2 bg-[#25253F]/15 hover:bg-[#25253F]/40 text-[#6C5CE7] hover:text-[#00D2FF] border border-[#6C5CE7]/30 p-2.5 rounded-lg transition-all cursor-pointer font-sans text-xs font-semibold mb-4"
                >
                  <Fingerprint size={16} className="animate-pulse" />
                  Entrar com Impressão Digital (Touch ID)
                </button>

                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-white/[0.05]"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-[#8888A0]/60 font-semibold uppercase tracking-wider font-mono">Super Admin</span>
                  <div className="flex-grow border-t border-white/[0.05]"></div>
                </div>

                <button
                  onClick={handleFillSuperAdmin}
                  className="w-full flex items-center justify-center gap-2 bg-[#1A1A2E]/50 hover:bg-[#25253F]/60 text-xs font-semibold text-[#8888A0] hover:text-[#F1F1F3] border border-white/[0.04] p-2.5 rounded-lg transition-all cursor-pointer"
                >
                  <Terminal size={14} className="text-[#00D2FF]" />
                  Preencher Credenciais Fundador
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. SIGNUP VIEW (CADASTRO) */}
        {view === "signup" && (
          <div className="animate-fadeIn">
            <Card className="glass-panel border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <CardHeader className="p-0 mb-5 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <button 
                    onClick={() => setView("login")} 
                    className="text-slate-400 hover:text-white p-1 rounded-lg bg-[#141424] border border-white/[0.04] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <CardTitle className="text-lg font-semibold text-white">Criar nova conta</CardTitle>
                </div>
                <CardDescription className="text-xs text-[#8888A0]">
                  Crie sua conta corporativa usando seu próprio endereço de e-mail
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4 text-left">
                  {/* Nome */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#8888A0]">Nome Completo</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Ex: Pedro Henrique"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-cyan-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-cyan-500/10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* E-mail próprio */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#8888A0]">E-mail de Acesso</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="Ex: pedro@gmail.com"
                        autoComplete="email"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-cyan-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-cyan-500/10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="relative flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#8888A0]">Senha</label>
                      <span className="text-[10px] text-emerald-400 font-bold tracking-tight uppercase">Padrão: 123456</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="text"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-cyan-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-cyan-500/10 font-mono tracking-widest text-[#00D2FF]"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#8888A0]">Confirmar Senha</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="text"
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-cyan-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-cyan-500/10 font-mono tracking-widest text-[#00D2FF]"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Sign Up Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full mt-2 font-display bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 text-slate-950 rounded-lg shadow-lg shadow-cyan-500/10 py-2.5 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    Confirmar & Criar Acesso
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setView("login")}
                    className="text-xs text-[#8888A0] hover:text-white cursor-pointer transition-colors"
                  >
                    Retroceder para <span className="font-bold text-[#6C5CE7]">Fazer Login</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. FORGOT PASSWORD VIEW (ESQUECI SENHA) */}
        {view === "forgot" && (
          <div className="animate-fadeIn">
            <Card className="glass-panel border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <CardHeader className="p-0 mb-5 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <button 
                    onClick={() => { setView("login"); setSimulatedLink(null); }} 
                    className="text-slate-400 hover:text-white p-1 rounded-lg bg-[#141424] border border-white/[0.04] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <CardTitle className="text-lg font-semibold text-white">Esqueci minha senha</CardTitle>
                </div>
                <CardDescription className="text-xs text-[#8888A0]">
                  Recupere seu acesso gerando um link de nova senha para seu e-mail cadastrado
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {!simulatedLink ? (
                  <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4 text-left">
                    {/* Email de Recuperação */}
                    <div className="relative flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-[#8888A0]">Indique seu E-mail Cadastrado</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Ex: carlos@provedor.com"
                          className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-purple-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Forgot Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full mt-2 font-display bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg shadow-lg shadow-purple-500/15 py-2.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      Enviar Link de Redefinição
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4 py-3 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                      <CheckCircle2 size={24} />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">E-mail Enviado com Sucesso!</h3>
                      <p className="text-xs text-[#8888A0] leading-relaxed">
                        Um link de redefinição de senha foi simulado e enviado eletronicamente para o endereço <span className="text-white font-semibold">{forgotEmail}</span>.
                      </p>
                    </div>

                    <div className="p-4 bg-[#141424] rounded-xl border border-indigo-500/20 text-left space-y-2 mt-4">
                      <span className="text-[10px] text-[#00D2FF] uppercase font-bold tracking-widest block font-mono">Link de Nova Senha (Simulação)</span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Como este é um ambiente isolado de demonstração de preview, você pode prosseguir para definir a nova senha imediatamente clicando no link simulado abaixo:
                      </p>
                      <button
                        onClick={() => {
                          if (simulatedToken) {
                            setResetToken(simulatedToken);
                            setView("reset");
                          }
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-indigo-600/15"
                      >
                        <KeyRound size={12} />
                        Acessar Link de Nova Senha
                      </button>
                    </div>

                    <button
                      onClick={() => { setView("login"); setSimulatedLink(null); }}
                      className="mt-2 text-2xs text-slate-500 hover:text-white transition-colors cursor-pointer block mx-auto underline"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 4. RESET PASSWORD VIEW (RECADASTRAR NOVA SENHA) */}
        {view === "reset" && (
          <div className="animate-fadeIn">
            <Card className="glass-panel border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <CardHeader className="p-0 mb-5 text-left">
                <CardTitle className="text-lg font-semibold text-white">Recadastrar nova senha</CardTitle>
                <CardDescription className="text-xs text-[#8888A0]">
                  Defina e salve sua credencial atualizada para sincronizar com o banco
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 text-left">
                <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                  {/* Visual token feedback */}
                  <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg flex items-center gap-2 font-mono">
                    <ShieldCheck size={14} className="shrink-0 text-emerald-400 animate-pulse" />
                    <span>Conexão Segura Criptografada Ativa ({resetToken.substring(0, 12)}...)</span>
                  </div>

                  {/* Nova Senha */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#8888A0]">Indique a Nova Senha</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-purple-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Confirmar Nova Senha */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[#8888A0]">Confirmar Nova Senha</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8888A0]/60 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirme sua nova senha"
                        className="w-full rounded-lg bg-[#141424] border border-white/[0.06] hover:border-white/12 focus:border-purple-500/80 pl-10 pr-3.5 py-2.5 text-sm text-[#F1F1F3] placeholder-[#8888A0]/40 transition-colors outline-none focus:ring-2 focus:ring-purple-500/10"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Reset Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full mt-2 font-display bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg shadow-lg shadow-purple-500/15 py-2.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    Salvar Nova Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer info */}
        <p className="text-[10px] text-center text-[#8888A0]/50 mt-6 select-none uppercase tracking-widest leading-none">
          DOLA AI — SISTEMA EXECUTIVO PRIVADO
        </p>
      </div>

      {/* Pulsing Fingerprint Scanner Immersive Simulator */}
      {isScanning && (
        <div className="fixed inset-0 bg-[#0A0A0F]/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn select-none">
          <div className="relative flex flex-col items-center gap-6 p-8 bg-[#141424] border border-indigo-500/30 rounded-3xl max-w-sm text-center shadow-2xl">
            <div className="absolute top-[-30px] w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Fingerprint size={28} className="text-white animate-pulse" />
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alinhando Leitor Biométrico</h3>
              <p className="text-2xs text-[#8888A0]">Toque no sensor biométrico do seu celular ou posicione o seu dedo sobre o leitor digital cadastrado.</p>
            </div>

            {/* Pulsing circle effect */}
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border border-indigo-500/25 mt-2">
              <div className="absolute inset-2 bg-indigo-500/5 rounded-full animate-ping" />
              <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse" />
              <Fingerprint size={48} className="text-indigo-400" />
            </div>

            <div className="w-full bg-[#1A1A2E] h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-2/3 animate-pulse"></div>
            </div>

            <p className="text-[10px] text-indigo-400 font-mono uppercase font-bold tracking-widest leading-none animate-pulse">Sincronizando dados...</p>
            
            <button
              onClick={() => setIsScanning(false)}
              className="mt-2 text-2xs bg-[#1A1A2E] hover:bg-slate-800 text-slate-500 hover:text-white px-4 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition font-bold"
            >
              Cancelar Autenticação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
