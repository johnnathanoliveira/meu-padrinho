-- =============================================
-- SCHEMA — Meu Padrinho Barbearia
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- ----------------
-- BOLÃO COPA
-- ----------------

-- Usuários do Bolão
create table if not exists bolao_users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  photo_url text,
  created_at timestamptz default now()
);

-- Palpites
create table if not exists bolao_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references bolao_users(id) on delete cascade,
  game_id text not null,
  home_score int not null,
  away_score int not null,
  created_at timestamptz default now(),
  unique(user_id, game_id)
);

-- Ranking (view materializada ou tabela atualizada por trigger/edge function)
-- Por enquanto criamos uma view simples
create table if not exists bolao_ranking (
  user_id uuid primary key references bolao_users(id),
  name text not null,
  photo_url text,
  points int default 0,
  exact_scores int default 0,
  updated_at timestamptz default now()
);

-- ----------------
-- PELADA
-- ----------------

-- Usuários da Pelada
create table if not exists pelada_users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  photo_url text,
  position text default 'Qualquer',
  created_at timestamptz default now()
);

-- Check-ins semanais
create table if not exists pelada_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references pelada_users(id) on delete cascade,
  pelada_date date not null,
  going boolean not null default true,
  created_at timestamptz default now(),
  unique(user_id, pelada_date)
);

-- Times sorteados
create table if not exists pelada_teams (
  id uuid primary key default gen_random_uuid(),
  pelada_date date unique not null,
  teams_json text not null,
  created_at timestamptz default now()
);

-- Cartões (árbitro)
create table if not exists pelada_cards (
  id uuid primary key default gen_random_uuid(),
  pelada_date date not null,
  user_id uuid references pelada_users(id) on delete cascade,
  player_name text not null,
  photo_url text,
  card_type text not null check (card_type in ('yellow', 'red')),
  minute int default 0,
  created_at timestamptz default now()
);

-- Votos Bola Cheia / Bola Murcha
create table if not exists pelada_bola_votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid references pelada_users(id) on delete cascade,
  voted_user_id uuid references pelada_users(id) on delete cascade,
  vote_type text not null check (vote_type in ('cheia', 'murcha')),
  pelada_date date not null,
  created_at timestamptz default now(),
  unique(voter_id, vote_type, pelada_date)
);

-- Vencedores da semana
create table if not exists pelada_bola_winners (
  id uuid primary key default gen_random_uuid(),
  pelada_date date unique not null,
  cheia_user_id uuid references pelada_users(id),
  murcha_user_id uuid references pelada_users(id),
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilita RLS em todas as tabelas
alter table bolao_users enable row level security;
alter table bolao_predictions enable row level security;
alter table bolao_ranking enable row level security;
alter table pelada_users enable row level security;
alter table pelada_checkins enable row level security;
alter table pelada_teams enable row level security;
alter table pelada_cards enable row level security;
alter table pelada_bola_votes enable row level security;
alter table pelada_bola_winners enable row level security;

-- Políticas: leitura pública, escrita autenticada (anon key pode ler e escrever)
-- Para um app simples sem auth Supabase, usamos acesso total via anon key
-- (protegido pelo próprio app com telefone)

create policy "allow_all_bolao_users" on bolao_users for all using (true) with check (true);
create policy "allow_all_bolao_predictions" on bolao_predictions for all using (true) with check (true);
create policy "allow_all_bolao_ranking" on bolao_ranking for all using (true) with check (true);
create policy "allow_all_pelada_users" on pelada_users for all using (true) with check (true);
create policy "allow_all_pelada_checkins" on pelada_checkins for all using (true) with check (true);
create policy "allow_all_pelada_teams" on pelada_teams for all using (true) with check (true);
create policy "allow_all_pelada_cards" on pelada_cards for all using (true) with check (true);
create policy "allow_all_pelada_bola_votes" on pelada_bola_votes for all using (true) with check (true);
create policy "allow_all_pelada_bola_winners" on pelada_bola_winners for all using (true) with check (true);

-- =============================================
-- STORAGE — Bucket para fotos
-- =============================================
-- Execute no Supabase Storage: crie um bucket público chamado "photos"
-- SQL equivalente:
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "allow_all_photos" on storage.objects for all using (bucket_id = 'photos') with check (bucket_id = 'photos');

-- =============================================
-- PLACARES OFICIAIS (atualizado pelo admin)
-- =============================================
create table if not exists bolao_scores (
  game_id text primary key,
  home_score int not null,
  away_score int not null,
  updated_at timestamptz default now()
);

alter table bolao_scores enable row level security;
create policy "allow_all_bolao_scores" on bolao_scores for all using (true) with check (true);

-- =============================================
-- CONFIGURAÇÃO DA PELADA (admin)
-- =============================================
create table if not exists pelada_config (
  id uuid primary key default gen_random_uuid(),
  pelada_date date unique not null,
  player_limit int default null, -- limite de jogadores de LINHA (goleiros não contam)
  updated_at timestamptz default now()
);

alter table pelada_config enable row level security;
create policy "allow_all_pelada_config" on pelada_config for all using (true) with check (true);

-- =============================================
-- JOGOS DA PELADA (partidas do dia)
-- =============================================
create table if not exists pelada_matches (
  id uuid primary key default gen_random_uuid(),
  pelada_date date not null,
  team_a_name text not null,
  team_b_name text not null,
  score_a int not null default 0,
  score_b int not null default 0,
  teams_json text,   -- snapshot dos jogadores de cada time no momento do jogo
  created_at timestamptz default now()
);

alter table pelada_matches enable row level security;
create policy "allow_all_pelada_matches" on pelada_matches for all using (true) with check (true);
