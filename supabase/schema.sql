-- ============================================================================
--  SuperPack novo — schema do banco (Supabase / PostgreSQL)
--  Cole este arquivo inteiro no  Supabase → SQL Editor → New query → Run.
--  Cria as tabelas, as regras de segurança (RLS) e os gatilhos.
--  Pode rodar mais de uma vez sem quebrar (usa IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- ---------- PERFIS (1 por usuário logado) -----------------------------------
create table if not exists public.perfis (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

-- cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ACERVO DE PEULOT ------------------------------------------------
create table if not exists public.peulot (
  id             bigint generated always as identity primary key,
  tema           text not null,
  shnat          int,
  objetivo       text,
  desenvolvimento text,
  sicha          text,
  parte_tecnica  text,
  categorias     text[] not null default '{}',
  origem         text not null default 'nova',   -- 'acervo' (importadas) | 'nova'
  legacy_id      int,                             -- id antigo do site original
  autor_id       uuid references public.perfis(id) on delete set null,
  created_at     timestamptz not null default now()
);
create index if not exists peulot_shnat_idx on public.peulot(shnat);
create index if not exists peulot_categorias_idx on public.peulot using gin(categorias);
create index if not exists peulot_busca_idx on public.peulot
  using gin(to_tsvector('portuguese',
    coalesce(tema,'')||' '||coalesce(objetivo,'')||' '||coalesce(desenvolvimento,'')));

-- ---------- MATERIAIS DE APOIO (arquivos/links) -----------------------------
create table if not exists public.materiais (
  id           bigint generated always as identity primary key,
  titulo       text not null,
  descricao    text,
  categorias   text[] not null default '{}',
  arquivo_path text,        -- caminho no Storage (bucket 'materiais')
  arquivo_nome text,        -- nome original do arquivo
  url          text,        -- ou um link externo
  peula_id     bigint references public.peulot(id) on delete cascade, -- opcional
  autor_id     uuid references public.perfis(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists materiais_peula_idx on public.materiais(peula_id);

-- ---------- KVUTZOT (grupos que seguem ano a ano) ---------------------------
create table if not exists public.kvutzot (
  id         bigint generated always as identity primary key,
  nome       text not null,
  descricao  text,
  created_at timestamptz not null default now()
);

-- madrichim de cada kvutzá (persistem entre os anos; edite quando trocar)
create table if not exists public.kvutza_madrichim (
  kvutza_id bigint references public.kvutzot(id) on delete cascade,
  perfil_id uuid   references public.perfis(id)  on delete cascade,
  primary key (kvutza_id, perfil_id)
);

-- ---------- MACHBERET: um caderno por kvutzá por ANO (shnat) -----------------
create table if not exists public.machberet_anos (
  id          bigint generated always as identity primary key,
  kvutza_id   bigint not null references public.kvutzot(id) on delete cascade,
  shnat       int not null,
  tema_ano    text,
  observacoes text,
  created_at  timestamptz not null default now(),
  unique (kvutza_id, shnat)
);

-- peulot que a kvutzá deu naquele ano (liga ao acervo OU escreve na hora)
create table if not exists public.machberet_peulot (
  id               bigint generated always as identity primary key,
  machberet_ano_id bigint not null references public.machberet_anos(id) on delete cascade,
  peula_id         bigint references public.peulot(id) on delete set null, -- opcional
  titulo           text,
  data             date,
  notas            text,
  autor_id         uuid references public.perfis(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists mp_ano_idx on public.machberet_peulot(machberet_ano_id);

-- acompanhamento geral do grupo (diário/registro do ano)
create table if not exists public.acompanhamento (
  id               bigint generated always as identity primary key,
  machberet_ano_id bigint not null references public.machberet_anos(id) on delete cascade,
  data             date not null default current_date,
  texto            text not null,
  autor_id         uuid references public.perfis(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists ac_ano_idx on public.acompanhamento(machberet_ano_id);

-- ---------- FUNÇÕES AUXILIARES (para as regras) -----------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.perfis where id = auth.uid()), false);
$$;

create or replace function public.is_membro(kv bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.kvutza_madrichim
                where kvutza_id = kv and perfil_id = auth.uid());
$$;

-- membro pelo id do caderno-ano
create or replace function public.is_membro_ano(ano bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.machberet_anos ma
                join public.kvutza_madrichim km on km.kvutza_id = ma.kvutza_id
                where ma.id = ano and km.perfil_id = auth.uid());
$$;

-- ============================================================================
--  RLS — segurança por linha. Regra geral: precisa estar LOGADO para tudo.
-- ============================================================================
alter table public.perfis            enable row level security;
alter table public.peulot            enable row level security;
alter table public.materiais         enable row level security;
alter table public.kvutzot           enable row level security;
alter table public.kvutza_madrichim  enable row level security;
alter table public.machberet_anos    enable row level security;
alter table public.machberet_peulot  enable row level security;
alter table public.acompanhamento    enable row level security;

-- PERFIS
drop policy if exists perfis_sel on public.perfis;
create policy perfis_sel on public.perfis for select to authenticated using (true);
drop policy if exists perfis_ins on public.perfis;
create policy perfis_ins on public.perfis for insert to authenticated with check (id = auth.uid());
drop policy if exists perfis_upd on public.perfis;
create policy perfis_upd on public.perfis for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- PEULOT (acervo): ler logado; criar logado; editar/apagar autor ou admin
drop policy if exists peulot_sel on public.peulot;
create policy peulot_sel on public.peulot for select to authenticated using (true);
drop policy if exists peulot_ins on public.peulot;
create policy peulot_ins on public.peulot for insert to authenticated
  with check (autor_id = auth.uid() or autor_id is null);
drop policy if exists peulot_upd on public.peulot;
create policy peulot_upd on public.peulot for update to authenticated
  using (autor_id = auth.uid() or public.is_admin());
drop policy if exists peulot_del on public.peulot;
create policy peulot_del on public.peulot for delete to authenticated
  using (autor_id = auth.uid() or public.is_admin());

-- MATERIAIS
drop policy if exists mat_sel on public.materiais;
create policy mat_sel on public.materiais for select to authenticated using (true);
drop policy if exists mat_ins on public.materiais;
create policy mat_ins on public.materiais for insert to authenticated
  with check (autor_id = auth.uid() or autor_id is null);
drop policy if exists mat_upd on public.materiais;
create policy mat_upd on public.materiais for update to authenticated
  using (autor_id = auth.uid() or public.is_admin());
drop policy if exists mat_del on public.materiais;
create policy mat_del on public.materiais for delete to authenticated
  using (autor_id = auth.uid() or public.is_admin());

-- KVUTZOT: ler logado; criar logado; editar/apagar membro ou admin
drop policy if exists kv_sel on public.kvutzot;
create policy kv_sel on public.kvutzot for select to authenticated using (true);
drop policy if exists kv_ins on public.kvutzot;
create policy kv_ins on public.kvutzot for insert to authenticated with check (true);
drop policy if exists kv_upd on public.kvutzot;
create policy kv_upd on public.kvutzot for update to authenticated
  using (public.is_membro(id) or public.is_admin());
drop policy if exists kv_del on public.kvutzot;
create policy kv_del on public.kvutzot for delete to authenticated using (public.is_admin());

-- KVUTZA_MADRICHIM: ler logado; qualquer logado pode entrar/adicionar; sair a si ou admin
drop policy if exists km_sel on public.kvutza_madrichim;
create policy km_sel on public.kvutza_madrichim for select to authenticated using (true);
drop policy if exists km_ins on public.kvutza_madrichim;
create policy km_ins on public.kvutza_madrichim for insert to authenticated with check (true);
drop policy if exists km_del on public.kvutza_madrichim;
create policy km_del on public.kvutza_madrichim for delete to authenticated
  using (perfil_id = auth.uid() or public.is_membro(kvutza_id) or public.is_admin());

-- MACHBERET_ANOS: ler logado; criar/editar membro da kvutzá ou admin
drop policy if exists ma_sel on public.machberet_anos;
create policy ma_sel on public.machberet_anos for select to authenticated using (true);
drop policy if exists ma_ins on public.machberet_anos;
create policy ma_ins on public.machberet_anos for insert to authenticated
  with check (public.is_membro(kvutza_id) or public.is_admin());
drop policy if exists ma_upd on public.machberet_anos;
create policy ma_upd on public.machberet_anos for update to authenticated
  using (public.is_membro(kvutza_id) or public.is_admin());
drop policy if exists ma_del on public.machberet_anos;
create policy ma_del on public.machberet_anos for delete to authenticated
  using (public.is_membro(kvutza_id) or public.is_admin());

-- MACHBERET_PEULOT: ler logado; escrever membro do ano; editar/apagar autor ou admin
drop policy if exists mp_sel on public.machberet_peulot;
create policy mp_sel on public.machberet_peulot for select to authenticated using (true);
drop policy if exists mp_ins on public.machberet_peulot;
create policy mp_ins on public.machberet_peulot for insert to authenticated
  with check (public.is_membro_ano(machberet_ano_id) or public.is_admin());
drop policy if exists mp_upd on public.machberet_peulot;
create policy mp_upd on public.machberet_peulot for update to authenticated
  using (autor_id = auth.uid() or public.is_membro_ano(machberet_ano_id) or public.is_admin());
drop policy if exists mp_del on public.machberet_peulot;
create policy mp_del on public.machberet_peulot for delete to authenticated
  using (autor_id = auth.uid() or public.is_membro_ano(machberet_ano_id) or public.is_admin());

-- ACOMPANHAMENTO: igual ao machberet_peulot
drop policy if exists ac_sel on public.acompanhamento;
create policy ac_sel on public.acompanhamento for select to authenticated using (true);
drop policy if exists ac_ins on public.acompanhamento;
create policy ac_ins on public.acompanhamento for insert to authenticated
  with check (public.is_membro_ano(machberet_ano_id) or public.is_admin());
drop policy if exists ac_upd on public.acompanhamento;
create policy ac_upd on public.acompanhamento for update to authenticated
  using (autor_id = auth.uid() or public.is_membro_ano(machberet_ano_id) or public.is_admin());
drop policy if exists ac_del on public.acompanhamento;
create policy ac_del on public.acompanhamento for delete to authenticated
  using (autor_id = auth.uid() or public.is_membro_ano(machberet_ano_id) or public.is_admin());

-- ============================================================================
--  STORAGE — bucket 'materiais' para os arquivos de apoio (privado, só logados)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('materiais','materiais', false)
on conflict (id) do nothing;

drop policy if exists mat_stor_sel on storage.objects;
create policy mat_stor_sel on storage.objects for select to authenticated
  using (bucket_id = 'materiais');
drop policy if exists mat_stor_ins on storage.objects;
create policy mat_stor_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'materiais');
drop policy if exists mat_stor_del on storage.objects;
create policy mat_stor_del on storage.objects for delete to authenticated
  using (bucket_id = 'materiais' and owner = auth.uid());

-- Pronto. Depois rode o importador (supabase/importar_acervo.py) para carregar
-- as 1287 peulot do acervo, e defina algum usuário como admin com:
--   update public.perfis set is_admin = true where id =
--     (select id from auth.users where email = 'SEU_EMAIL');
