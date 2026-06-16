-- ============================================================================
-- Tabela instagram_posts + bucket instagram
-- ============================================================================
-- Rode depois de 001_init.sql e 002_storage.sql.

create table if not exists public.instagram_posts (
  id            uuid primary key default gen_random_uuid(),
  url           text not null,
  thumbnail_url text not null,
  caption       text not null default '',
  media_type    text not null default 'photo' check (media_type in ('photo','video','carousel','reel')),
  order_index   integer not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_instagram_posts_published_order
  on public.instagram_posts(published, order_index);

drop trigger if exists trg_instagram_posts_updated_at on public.instagram_posts;
create trigger trg_instagram_posts_updated_at
  before update on public.instagram_posts
  for each row execute procedure public.set_updated_at();

alter table public.instagram_posts enable row level security;

drop policy if exists "public read instagram_posts" on public.instagram_posts;
create policy "public read instagram_posts"
  on public.instagram_posts for select
  to anon, authenticated
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "auth write instagram_posts" on public.instagram_posts;
create policy "auth write instagram_posts"
  on public.instagram_posts for all
  to authenticated
  using (true) with check (true);

-- Storage bucket para as capas
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('instagram', 'instagram', true, 10485760, array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read instagram bucket" on storage.objects;
create policy "public read instagram bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'instagram');

drop policy if exists "auth upload instagram" on storage.objects;
create policy "auth upload instagram"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'instagram');

drop policy if exists "auth update instagram" on storage.objects;
create policy "auth update instagram"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'instagram');

drop policy if exists "auth delete instagram" on storage.objects;
create policy "auth delete instagram"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'instagram');
