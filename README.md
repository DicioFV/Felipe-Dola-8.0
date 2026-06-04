# 🤖 DOLA AI — Executive Assistant Platform

Plataforma de alta fidelidade para assistência executiva pessoal, projetada com foco em produtividade de alta performance e bem-estar financeiro.

Este projeto utiliza uma arquitetura modular moderna e segura, com interface responsiva e PWA integrado de primeira classe.

---

## 🚀 FASE 1 — CONCLUÍDA

Nesta fase, estruturamos a base sólida de infraestrutura e design do sistema:
*   **Design Tokens Premium**: Estilos customizados e paleta de cores Dark Premium configuradas no Tailwind CSS.
*   **Design System Reutilizável**: Componentes universais autônomos (`Button`, `Card`, `Modal`, `Input`, `Select`, `Badge`, `Avatar`, `Dropdown`, `Toast`, `Skeleton`, `ConfirmDialog`, `LoadingSpinner`) com micro-interações via `motion/react`.
*   **Banco de Dados Prisma**: Schema completo contendo todas as tabelas (User, Task, Event, Alarm, Habit, Note, Finance, Investment, Loan e relacionamentos).
*   **Segurança & Autenticação**: Servidor Express com autenticação de sessão via tokens JWT seguros (criptografia SHA-256 no backend) e rotas protegidas.
*   **Banco de Dados Local Seguro**: Banco de dados embarcado em arquivo JSON (`data/db.json`) contendo persistência garantida em ambiente sandbox, isolamento absoluto de dados entre usuários e carga inicial da conta criadora (**SUPERADMIN**).
*   **Progressive Web App (PWA)**: Arquivos de manifesto (`manifest.json`) e caches estáticos via Service Worker (`sw.js`) com suporte a modo offline.
*   **Hook useCrud Universal**: Abstração limpa para as operações completas de Create, Read, Update e Delete no frontend.

---

## 🛡️ FASE 7 — CONCLUÍDA

Nesta fase, implementamos o ecossistema definitivo de segurança e registros operacionais:
*   **Central de Segurança & Auditoria**: Painel interativo e estilizado com os padrões Dark-Midnight do design system, exibindo a integridade operacional ativa no dashboard.
*   **Trilha de Auditoria Criptografada**: Mecanismo de gravação server-side no banco embarcado (`activityLogs` integrados ao `data/db.json`), garantindo registros detalhados das transações.
*   **Registros de Atividades Executivas**: Logs criados automaticamente em logins de sessão e nos fluxos de gerenciamento de tarefas/interações corporativas.
*   **Controles Práticos & Simulador de Ameaças**: Mecanismos de exportação de dados para JSON, limpeza de registros restrita ao papel de `SUPERADMIN` e um simulador operacional para testes rápidos de flood e IP externo.

---

## 🔑 Credenciais Superadmin Padrão

*   **E-mail**: `10felitec@gmail.com`
*   **Senha**: `135Amor.`

---

## 📦 Como Rodar o Desenvolvimento Local

1.  Instale as dependências padrão do node:
    ```bash
    npm install
    ```
2.  Copie o arquivo `.env.example` para `.env` e configure conforme sua preferência:
    ```bash
    cp .env.example .env
    ```
3.  Inicie o servidor de desenvolvimento full-stack:
    ```bash
    npm run dev
    ```
    O servidor estará ativo em `http://localhost:3000`.

---

## 🌐 Deploy Rápido no GitHub + Vercel

### Passo 1: Enviar para o GitHub
1.  Crie um repositório vazio no seu perfil do GitHub (ex: `dola-ai-assistant`).
2.  No terminal do seu projeto local, execute:
    ```bash
    git init
    git add .
    git commit -m "feat: setup initial boilerplates and structures"
    git branch -M main
    git remote add origin https://github.com/SEU-USUARIO/dola-ai-assistant.git
    git push -u origin main
    ```

### Passo 2: Implantar na Vercel
Como o projeto está configurado para o fluxo Full-Stack (servidor Express servindo o bundle React estático gerado pelo Vite), a melhor forma de implantar o servidor em produção de forma gratuita é através de plataformas de container que suportam Docker/Node (como Render, Koyeb ou VPS dedicada). 

Para implantar na **Vercel** como um aplicativo Client-Side puro (SPA) rápido:
1.  Conecte seu repositório GitHub na Vercel (https://vercel.com).
2.  Configure a pasta de publicação para `dist` e o script de build para `npm run build`.
3.  Adicione as variáveis de ambiente necessárias nas configurações do projeto da Vercel (`GEMINI_API_KEY`, etc.).
