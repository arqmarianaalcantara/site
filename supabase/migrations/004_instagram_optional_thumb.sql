-- Torna thumbnail_url opcional: quando o auto-fetch falha, o card mostra
-- um placeholder visual em vez de exigir upload.

alter table public.instagram_posts
  alter column thumbnail_url drop not null;
