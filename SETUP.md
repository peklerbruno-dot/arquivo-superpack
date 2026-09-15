# Como colocar o SuperPack novo no ar (passo a passo)

O app está em `app/`. Ele usa o **Supabase** (grátis) para login, banco de dados e
arquivos. Você faz o setup **uma vez**. Não precisa saber programar — é copiar,
colar e clicar.

Tempo estimado: ~20 minutos.

---

## Parte 1 — Criar o projeto no Supabase

1. Entre em **https://supabase.com** e crie uma conta (pode usar o Google/GitHub).
2. Clique em **New project**.
   - **Name**: `superpack` (ou o que quiser)
   - **Database Password**: crie uma senha forte e **guarde** (você quase não vai usar).
   - **Region**: escolha **South America (São Paulo)**.
3. Espere uns 2 minutos até o projeto ficar pronto.

## Parte 2 — Criar as tabelas (o banco)

1. No menu à esquerda, abra **SQL Editor** → **New query**.
2. Abra o arquivo **`supabase/schema.sql`** deste repositório, copie **tudo** e
   cole na janela.
3. Clique em **Run** (canto inferior direito). Deve aparecer "Success".
   - Isso cria todas as tabelas, as regras de segurança e o espaço de arquivos.

## Parte 3 — Pegar as chaves e configurar o site

1. No Supabase: **Project Settings** (engrenagem) → **API**.
2. Copie dois valores:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **Project API keys → `anon` `public`** (uma chave longa)
3. Abra **`app/config.js`** e cole nos lugares indicados:
   ```js
   window.CONFIG = {
     SUPABASE_URL: "https://abcd1234.supabase.co",
     SUPABASE_ANON_KEY: "a-chave-anon-public-aqui",
   };
   ```
   > A chave `anon public` **pode** ficar no site — ela é protegida pelas regras
   > de segurança. **Nunca** use a chave `service_role` aqui.

## Parte 4 — Importar o acervo (as 1287 peulot)

Isso carrega todas as peulot antigas no banco. É a única parte por linha de comando.

1. No Supabase: **Project Settings → API → `service_role` `secret`**. Copie.
   (Essa chave é poderosa; use só no seu computador, nunca no site.)
2. No seu computador, dentro da pasta do repositório, rode:
   ```bash
   export SUPABASE_URL="https://abcd1234.supabase.co"
   export SUPABASE_SERVICE_KEY="cole-a-service_role-aqui"
   python3 supabase/importar_acervo.py
   ```
   Vai aparecer "Concluído. Importadas 1287 peulot."

   > Não tem Python/terminal à mão? Me chame que eu importo pra você, ou dá pra
   > importar pelo próprio Supabase (Table editor → import), mas o script é o jeito fácil.

## Parte 5 — Ligar o login por e-mail

1. No Supabase: **Authentication → Providers → Email** deve estar **ativado** (já vem).
2. **Authentication → Sign In / Providers → Email**: para facilitar no começo,
   você pode **desligar "Confirm email"** (assim a pessoa entra na hora, sem
   precisar confirmar o e-mail). Se deixar ligado, cada madrich confirma pelo
   link que chega no e-mail.
3. (Opcional) **Authentication → URL Configuration**: coloque o endereço do site
   (o do GitHub Pages, da Parte 6) em **Site URL**.

## Parte 6 — Publicar o site (grátis)

O jeito mais simples é o **Vercel** (lida bem com subpastas):

1. Entre em **https://vercel.com** com o GitHub.
2. **Add New → Project** → escolha o repositório `arquivo-superpack`.
3. Em **Root Directory**, selecione a pasta **`app`**. Deploy.
4. Pronto — sai um endereço público tipo `https://arquivo-superpack.vercel.app`.

Ou **GitHub Pages** (o app fica em `.../app/`):
- **Settings → Pages → Source: Deploy from a branch → main → /(root)**.
- O app abre em `https://SEU_USUARIO.github.io/arquivo-superpack/app/`.

## Parte 7 — Virar admin (você)

Depois de criar sua conta no site (Parte "Criar conta"):

1. Supabase → **SQL Editor** → rode (troque pelo seu e-mail):
   ```sql
   update public.perfis set is_admin = true
   where id = (select id from auth.users where email = 'SEU_EMAIL');
   ```
   Admin pode editar/apagar qualquer peulá e gerenciar kvutzot.

---

## Como usar (para os madrichim)

- **Criar conta / Entrar** com e-mail e senha.
- **Acervo**: buscar e ver peulot (todas as 1287 antigas + as novas).
- **Nova peulá**: cadastrar uma peulá nova, com materiais de apoio anexos.
- **Materiais**: enviar/baixar arquivos de apoio soltos.
- **Machberet**: criar/abrir a kvutzá, **Entrar como madrich**, abrir o ano
  (shnat), registrar as **peulot dadas** (do acervo ou escritas na hora) e o
  **acompanhamento do grupo**. A cada ano você abre um caderno novo (**+ Abrir
  novo ano**) e o anterior fica guardado no histórico.

## Perguntas comuns

- **É seguro deixar a `anon key` no site?** Sim. O que protege os dados são as
  regras (RLS) do `schema.sql`: sem estar logado, ninguém lê nada; cada um só
  edita o que pode.
- **Quero que só gente aprovada entre.** Dá para exigir confirmação de e-mail
  (Parte 5) ou, mais rígido, desligar auto-cadastro e criar os usuários você
  mesmo em Authentication → Users. Me avise que eu ajusto.
- **O supabase-js está no repositório** (`app/js/vendor/`), então o site não
  depende de CDN externo.
