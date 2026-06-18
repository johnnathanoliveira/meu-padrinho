# 🚀 Como Hospedar Gratuitamente

## Pré-requisitos
- Conta gratuita no GitHub (github.com)
- Conta gratuita no Supabase (supabase.com)
- Conta gratuita na Vercel (vercel.com)

---

## PASSO 1 — Configurar o Supabase (banco de dados)

1. Acesse **supabase.com** e crie uma conta
2. Clique em **"New project"**
3. Dê um nome (ex: `meu-padrinho`) e uma senha para o banco
4. Aguarde criar (≈1 minuto)
5. Vá em **SQL Editor** (menu esquerdo)
6. Cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**
7. Vá em **Project Settings → API**
8. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## PASSO 2 — Criar o arquivo .env

Copie o `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxx...
VITE_ADMIN_PHONES=11999999999
```

**ADMIN_PHONES:** coloque seu número SEM formatação (só os 11 dígitos).
Esse número terá acesso às funções de admin (sortear times, finalizar votação, árbitro).

---

## PASSO 3 — Subir o código no GitHub

1. Acesse **github.com**, crie um novo repositório (pode ser privado)
2. No terminal da pasta do projeto, execute:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

---

## PASSO 4 — Deploy na Vercel

1. Acesse **vercel.com** e faça login com sua conta GitHub
2. Clique em **"New Project"**
3. Selecione seu repositório
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = sua URL
   - `VITE_SUPABASE_ANON_KEY` = sua chave
   - `VITE_ADMIN_PHONES` = seu telefone
5. Clique em **Deploy**
6. Aguarde ≈1 minuto. Pronto! ✅

A Vercel dará um link tipo: `https://meu-padrinho.vercel.app`

---

## 📲 Compartilhar com os amigos

Dentro do app, toque no ícone de **compartilhar** (📤) para ver o QR Code.
Seus amigos escaneiam e entram direto!

---

## 🔄 Atualizar o app

Sempre que fizer mudanças e quiser publicar:

```bash
git add .
git commit -m "descrição do que mudou"
git push
```

A Vercel detecta automaticamente e republica em ≈1 minuto.

---

## 💡 Dicas

- O plano gratuito do Supabase suporta **500MB** de banco + **1GB** de storage (fotos)
- A Vercel gratuita suporta **100GB** de banda/mês — mais do que suficiente
- Nenhum cartão de crédito necessário em nenhum dos dois
