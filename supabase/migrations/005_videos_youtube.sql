-- ============================================================================
-- Vídeos: adicionar suporte a YouTube (não obriga upload de arquivo)
-- ============================================================================
-- Depois desta migration, um vídeo precisa ter video_url OU youtube_url.

alter table public.videos
  add column if not exists youtube_url text;

alter table public.videos
  alter column video_url drop not null;

alter table public.videos
  drop constraint if exists video_source_present;

alter table public.videos
  add constraint video_source_present
  check (video_url is not null or youtube_url is not null);
