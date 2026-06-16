-- ============================================================================
-- Arquiteta Mariana Alcântara — schema inicial
-- ============================================================================
-- Rode este arquivo no Supabase SQL Editor (uma vez) após criar o projeto.
-- Ele cria:
--   1. Tabelas: projects, project_images, videos, site_settings
--   2. Buckets de Storage: projects, videos
--   3. Políticas RLS (leitura pública, escrita só para autenticados)
--   4. Triggers de updated_at

-- ---------- 1. Tabelas ----------

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  category     text not null default 'apartamento',
  description  text not null default '',
  cover_url    text,
  order_index  integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.project_images (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  url          text not null,
  alt          text default '',
  width        integer,
  height       integer,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists idx_project_images_project on public.project_images(project_id, order_index);

create table if not exists public.videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text default '',
  video_url     text not null,
  thumbnail_url text,
  duration      integer,
  order_index   integer not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.site_settings (
  key   text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- 2. Trigger de updated_at ----------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_videos_updated_at on public.videos;
create trigger trg_videos_updated_at
  before update on public.videos
  for each row execute procedure public.set_updated_at();

-- ---------- 3. Row Level Security ----------

alter table public.projects        enable row level security;
alter table public.project_images  enable row level security;
alter table public.videos          enable row level security;
alter table public.site_settings   enable row level security;

-- Leitura pública (qualquer visitante vê projetos publicados)
drop policy if exists "public read projects" on public.projects;
create policy "public read projects"
  on public.projects for select
  to anon, authenticated
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "public read project_images" on public.project_images;
create policy "public read project_images"
  on public.project_images for select
  to anon, authenticated
  using (true);

drop policy if exists "public read videos" on public.videos;
create policy "public read videos"
  on public.videos for select
  to anon, authenticated
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Escrita: APENAS usuários autenticados (a Mariana logada no admin)
drop policy if exists "auth write projects" on public.projects;
create policy "auth write projects"
  on public.projects for all
  to authenticated
  using (true) with check (true);

drop policy if exists "auth write project_images" on public.project_images;
create policy "auth write project_images"
  on public.project_images for all
  to authenticated
  using (true) with check (true);

drop policy if exists "auth write videos" on public.videos;
create policy "auth write videos"
  on public.videos for all
  to authenticated
  using (true) with check (true);

drop policy if exists "auth write site_settings" on public.site_settings;
create policy "auth write site_settings"
  on public.site_settings for all
  to authenticated
  using (true) with check (true);
