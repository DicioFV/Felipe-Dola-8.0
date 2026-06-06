# Guia de Integração e Configuração: Supabase, Vercel e GitHub

Este guia explica como configurar o **Supabase** para funcionar como o banco de dados em nuvem persistente do seu sistema **Dola AI**, resolvendo problemas de gravação no sistema de arquivos estático/somente leitura (read-only) da **Vercel**.

---

## 1. O que foi corrigido no projeto?

No ambiente serverless da **Vercel**, todo o sistema de arquivos é **somente leitura** (exceto a pasta `/tmp`). 
- **O Problema:** Anteriormente, o backend tentava criar a pasta física `/data` no disco para salvar o arquivo `db.json` local. Esse comando falhava silenciosamente e gerava um erro interno fatal da Vercel, retornando uma página HTML de erro (de onde vinha o erro no console: `Unexpected token 'A', "A server e"... is not valid JSON`). Sem o banco funcionando, contas não podiam ser criadas e os logins retornavam como inválidos.
- **A Solução:** Adicionamos um tratamento resiliente (`try/catch`) na gravação de arquivos e na criação da pasta. Agora, mesmo que o arquivo local falhe ao ser escrito no Vercel, o sistema permanece 100% operacional e delega toda a gravação de dados ao **Supabase** de forma transparente!

---

## 2. Passo a Passo: Configurando o Supabase

Siga os passos abaixo para preparar seu banco no Supabase para receber os dados do Dola AI:

### Passo 2.1: Criar o Projeto no Supabase
1. Acesse o site oficial do [Supabase](https://supabase.com/) e faça login ou crie uma conta gratuita.
2. No painel de controle, clique em **New Project** (Novo Projeto).
3. Selecione a sua organização, dê um nome ao projeto (ex: `Dola-AI-Database`) e defina uma senha forte para a base de dados.
4. Escolha uma região próxima (ex: `São Paulo - sa-east-1` ou similar) e clique em **Create New Project**. Aguarde alguns minutos até que o provisionamento do banco de dados seja concluído.

### Passo 2.2: Criar a Tabela de Armazenamento
Como o Dola AI usa um modelo unificado, de alto desempenho e sincronismo em tempo real, precisamos de uma única tabela que salvará todo o estado do banco.

1. No menu lateral esquerdo do Supabase, clique em **SQL Editor** (um ícone de terminal com as letras `SQL`).
2. Clique em **New Query** (Nova Consulta).
3. Copie o código SQL abaixo e cole no editor de texto:

```sql
-- Cria a tabela que armazenará os dados do Dola AI de forma unificada
create table if not exists public.dola_db_store (
  id text primary key,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativa a segurança de nível de linha (RLS)
alter table public.dola_db_store enable row level security;

-- Cria uma política de segurança para permitir que a API leia, insira e atualize livremente
create policy "Allow all operations for app" on public.dola_db_store
  for all
  using (true)
  with check (true);
```

4. Clique no botão **Run** (Executar) no canto inferior direito para processar o SQL. Você deverá ver uma mensagem de sucesso como `Success. No rows returned.`.

---

## 3. Passo a Passo: Configurando as Credenciais na Vercel

Agora precisamos conectar a sua hospedagem do **Vercel** ao seu banco de dados do **Supabase**.

### Passo 3.1: Obter as credenciais no Supabase
1. No painel do seu projeto no Supabase, clique em **Project Settings** (ícone de engrenagem no canto inferior esquerdo).
2. Vá na aba **API**.
3. Localize as seguintes informações e copie-as:
   - **Project API keys** -> Procure pela chave com o selo `anon` e `public`. Copie essa chave (ela se chama **Anon Key**).
   - **URL** -> Procure pelo endereço URL do seu projeto (ex: `https://xxxxxx.supabase.co`). Copie essa URL.

### Passo 3.2: Registrar na Vercel
1. Vá para o painel de projetos da [Vercel](https://vercel.com/) e clique no seu projeto do **Dola AI**.
2. Clique na aba **Settings** (Configurações) no topo.
3. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente).
4. Adicione as seguintes duas variáveis:

| Key (Nome) | Value (Valor obtido no Supabase) |
|---|---|
| `SUPABASE_URL` | *Coloque a URL do seu Supabase aqui* |
| `SUPABASE_KEY` | *Coloque a anon/public key do seu Supabase aqui* |

5. Não se esqueça de marcar todas as caixas de ambiente (**Production**, **Preview**, **Development**).
6. Clique em **Save** (Salvar).

---

## 4. Passo a Passo: Atualizando o Código (GitHub e Vercel Redeployment)

Para aplicar as mudanças no seu ambiente de produção da Vercel, o novo código de reparação precisa ser implantado:

1. Faça o commit e envie as alterações do seu repositório local para o seu **GitHub** (caso use git local):
   ```bash
   git add .
   git commit -m "fix: failsafe serverless startup directory creation and setup supabase instructions"
   git push origin main
   ```
2. No painel da **Vercel**, acesse a aba **Deployments** (Implantações).
3. Selecione a implantação mais recente ou clique nas opções do seu último commit que veio do GitHub e escolha **Redeploy** (Reimplantar).
4. **Pronto!** O Vercel agora criará uma nova versão da plataforma contendo os ajustes necessários de resiliência.

---

## 5. Como testar e usar o sistema integrado

1. Abra o link gerado pela Vercel do seu projeto.
2. Na tela de login, clique em **Criar cadastro de e-mail**.
3. Crie a sua conta (ex: colocando seu nome, e-mail e uma senha de sua preferência).
4. Caso a conexão com o Supabase esteja ativa e configurada corretamente, o sistema criará a conta instantaneamente em nuvem!
5. Se você for na aba **Table Editor** do seu Supabase e clicar na tabela `dola_db_store`, verá um registro com o `id = "global"`. Dentro de `data`, na coluna tipo JSONB, estarão todos os seus usuários (`users`), tarefas (`tasks`), finanças e hábitos registrados de forma segura e permanente em nuvem!
