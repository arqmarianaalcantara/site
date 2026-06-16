"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  downloadAsBuffer,
  fetchInstagramOg,
  detectMediaTypeFromUrl,
} from "@/lib/instagram";
import type { InstagramMediaType } from "@/lib/types";

type ActionResult =
  | { error: string; success?: never }
  | {
      success: true;
      error?: never;
      id?: string;
      thumbnail?: "auto" | "uploaded" | "placeholder";
    };

const InstagramSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (v) => /(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\//.test(v),
      "URL precisa ser de um post, reel ou IGTV do Instagram"
    ),
  caption: z.string().default(""),
  media_type: z
    .enum(["photo", "video", "carousel", "reel"])
    .optional(),
  order_index: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    let path = u.pathname;
    if (!path.endsWith("/")) path += "/";
    return `${u.origin}${path}`;
  } catch {
    return url;
  }
}

interface UploadFile {
  name: string;
  type: string;
  base64: string;
}

async function uploadThumbnailBuffer(
  supabase: Awaited<ReturnType<typeof requireAuth>>,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  const ext =
    contentType.split("/")[1]?.split(";")[0]?.replace("jpeg", "jpg") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("instagram")
    .upload(path, buffer, { contentType, upsert: false });
  if (error) {
    console.warn("[instagram] upload failed:", error.message);
    return null;
  }
  const { data } = supabase.storage.from("instagram").getPublicUrl(path);
  return data.publicUrl;
}

export async function createInstagramPost(
  metadata: {
    url: string;
    caption: string;
    media_type?: InstagramMediaType;
    order_index: number;
    published: boolean;
  },
  thumbnailFile?: UploadFile | null
): Promise<ActionResult> {
  const supabase = await requireAuth();

  const parsed = InstagramSchema.safeParse(metadata);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const url = normalizeUrl(parsed.data.url);
  let thumbnailUrl: string | null = null;
  let thumbnailSource: "auto" | "uploaded" | "placeholder" = "placeholder";
  let mediaType: InstagramMediaType =
    parsed.data.media_type ?? detectMediaTypeFromUrl(url);

  // Caminho 1: upload manual tem prioridade
  if (thumbnailFile?.base64) {
    const buffer = Buffer.from(thumbnailFile.base64, "base64");
    thumbnailUrl = await uploadThumbnailBuffer(
      supabase,
      buffer,
      thumbnailFile.type
    );
    if (thumbnailUrl) thumbnailSource = "uploaded";
  }

  // Caminho 2: auto-fetch da capa do Instagram
  if (!thumbnailUrl) {
    const og = await fetchInstagramOg(url);
    if (og.imageUrl) {
      const downloaded = await downloadAsBuffer(og.imageUrl);
      if (downloaded) {
        thumbnailUrl = await uploadThumbnailBuffer(
          supabase,
          downloaded.buffer,
          downloaded.contentType
        );
        if (thumbnailUrl) thumbnailSource = "auto";
      }
    }
    // se o auto detectou um tipo melhor e a usuária não forçou, usamos
    if (!parsed.data.media_type) mediaType = og.mediaType;
  }

  // Caminho 3: sem thumbnail. Banco aceita NULL, site mostra placeholder visual.

  const { data, error } = await supabase
    .from("instagram_posts")
    .insert({
      url,
      thumbnail_url: thumbnailUrl,
      caption: parsed.data.caption,
      media_type: mediaType,
      order_index: parsed.data.order_index,
      published: parsed.data.published,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/instagram");
  revalidatePath("/");
  return { success: true, id: data.id, thumbnail: thumbnailSource };
}

export async function updateInstagramPost(
  id: string,
  metadata: {
    url: string;
    caption: string;
    media_type?: InstagramMediaType;
    order_index: number;
    published: boolean;
  },
  thumbnailFile?: UploadFile | null,
  refetchThumbnail = false
): Promise<ActionResult> {
  const supabase = await requireAuth();

  const parsed = InstagramSchema.safeParse(metadata);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const url = normalizeUrl(parsed.data.url);
  const updates: Record<string, unknown> = {
    url,
    caption: parsed.data.caption,
    media_type:
      parsed.data.media_type ?? detectMediaTypeFromUrl(url),
    order_index: parsed.data.order_index,
    published: parsed.data.published,
  };

  if (thumbnailFile?.base64) {
    const buffer = Buffer.from(thumbnailFile.base64, "base64");
    const url2 = await uploadThumbnailBuffer(
      supabase,
      buffer,
      thumbnailFile.type
    );
    if (url2) updates.thumbnail_url = url2;
  } else if (refetchThumbnail) {
    const og = await fetchInstagramOg(url);
    if (og.imageUrl) {
      const downloaded = await downloadAsBuffer(og.imageUrl);
      if (downloaded) {
        const url2 = await uploadThumbnailBuffer(
          supabase,
          downloaded.buffer,
          downloaded.contentType
        );
        if (url2) updates.thumbnail_url = url2;
      }
    }
  }

  const { error } = await supabase
    .from("instagram_posts")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/instagram");
  revalidatePath("/");
  return { success: true };
}

export async function deleteInstagramPost(id: string): Promise<ActionResult> {
  const supabase = await requireAuth();

  const { data: post } = await supabase
    .from("instagram_posts")
    .select("thumbnail_url")
    .eq("id", id)
    .single();

  if (post?.thumbnail_url) {
    const marker = `/storage/v1/object/public/instagram/`;
    const idx = post.thumbnail_url.indexOf(marker);
    if (idx !== -1) {
      const path = post.thumbnail_url.slice(idx + marker.length);
      await supabase.storage.from("instagram").remove([path]);
    }
  }

  const { error } = await supabase
    .from("instagram_posts")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/instagram");
  revalidatePath("/");
  redirect("/admin/instagram");
}
