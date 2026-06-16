/**
 * Helpers de Instagram.
 *
 * O Instagram não tem oEmbed público sem token do Meta. Mas o servidor deles
 * serve as tags Open Graph para alguns user-agents (principalmente o
 * `facebookexternalhit`, que é o crawler do Facebook). Tentamos buscar a
 * thumbnail por aí. Quando falha, o site mostra um placeholder visual.
 */

import type { InstagramMediaType } from "./types";

const BOT_USER_AGENTS = [
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Twitterbot/1.0",
  "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
  "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
];

interface OgResult {
  imageUrl: string | null;
  mediaType: InstagramMediaType;
}

export function detectMediaTypeFromUrl(url: string): InstagramMediaType {
  if (/\/reels?\//.test(url)) return "reel";
  if (/\/tv\//.test(url)) return "video";
  return "photo";
}

function pickMetaTag(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].replace(/&amp;/g, "&");
  }
  return null;
}

export async function fetchInstagramOg(url: string): Promise<OgResult> {
  const detected = detectMediaTypeFromUrl(url);
  let lastError: unknown = null;

  for (const ua of BOT_USER_AGENTS) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();

      const ogImage = pickMetaTag(html, "og:image");
      const ogVideo = pickMetaTag(html, "og:video");
      const ogType = pickMetaTag(html, "og:type");

      let mediaType: InstagramMediaType = detected;
      if (ogVideo || ogType?.includes("video")) {
        if (detected === "photo") mediaType = "video";
      }

      if (ogImage) {
        return { imageUrl: ogImage, mediaType };
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    console.warn("[instagram] og fetch failed:", lastError);
  }
  return { imageUrl: null, mediaType: detected };
}

export async function downloadAsBuffer(
  url: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    });
    if (!res.ok) return null;
    const contentType =
      res.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) return null;
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType };
  } catch (err) {
    console.warn("[instagram] image download failed:", err);
    return null;
  }
}

export function extractShortcode(url: string): string | null {
  const m = url.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return m?.[1] ?? null;
}
