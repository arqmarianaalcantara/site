-- ============================================================================
-- Buckets de Storage + políticas
-- ============================================================================
-- Rode DEPOIS de 001_init.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('projects', 'projects', true, 26214400, array['image/webp','image/jpeg','image/png','image/avif']),
  ('videos',   'videos',   true, 524288000, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública dos buckets
drop policy if exists "public read projects bucket"  on storage.objects;
create policy "public read projects bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'projects');

drop policy if exists "public read videos bucket" on storage.objects;
create policy "public read videos bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'videos');

-- Escrita restrita a usuários autenticados
drop policy if exists "auth upload projects" on storage.objects;
create policy "auth upload projects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'projects');

drop policy if exists "auth update projects" on storage.objects;
create policy "auth update projects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'projects');

drop policy if exists "auth delete projects" on storage.objects;
create policy "auth delete projects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'projects');

drop policy if exists "auth upload videos" on storage.objects;
create policy "auth upload videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos');

drop policy if exists "auth update videos" on storage.objects;
create policy "auth update videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'videos');

drop policy if exists "auth delete videos" on storage.objects;
create policy "auth delete videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos');
