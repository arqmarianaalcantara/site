/**
 * Helpers de YouTube.
 * Extrai o ID do vídeo de URLs em vários formatos e gera embed URL + thumbnail.
 */

const YT_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?[^#]*v=)([A-Za-z0-9_-]{11})/,
  /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
];

export function extractYouTubeId(url: string): string | null {
  const clean = url.trim();
  for (const pattern of YT_ID_PATTERNS) {
    const m = clean.match(pattern);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

interface EmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
}

export function youtubeEmbedUrl(id: string, opts: EmbedOptions = {}): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (opts.autoplay) params.set("autoplay", "1");
  if (opts.mute) params.set("mute", "1");
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/**
 * Retorna URLs de thumbnail em vários tamanhos.
 * maxresdefault (1280x720) nem sempre existe, então oferecemos hqdefault (480x360)
 * como fallback confiável.
 */
export function youtubeThumbnails(id: string) {
  return {
    max: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    hq: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    mq: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
  };
}

/**
 * Baixa a melhor thumbnail disponível (tenta maxres, cai pra hq se não existir).
 */
export async function downloadYouTubeThumbnail(
  id: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const candidates = [
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      if (!contentType.startsWith("image/")) continue;
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // maxres 404 do YouTube pode retornar 200 com uma imagem cinza pequena
      // (~7KB). Ignoramos essa "no video available".
      if (buffer.length < 15_000 && url.includes("maxres")) continue;
      return { buffer, contentType };
    } catch {
      /* tenta próxima */
    }
  }
  return null;
}
