"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type ActionResult =
  | { error: string; success?: never }
  | { success: true; error?: never; id?: string };

const InstagramSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (v) => /(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\//.test(v),
      "URL precisa ser de um post, reel ou IGTV do Instagram"
    ),
  caption: z.string().default(""),
  media_type: z.enum(["photo", "video", "carousel", "reel"]),
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
  // Remove query strings desnecessárias (utm, igsh, etc) e barra final
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

export async function createInstagramPost(
  metadata: {
    url: string;
    caption: string;
    media_type: "photo" | "video" | "carousel" | "reel";
    order_index: number;
    published: boolean;
  },
  thumbnailFile: UploadFile
): Promise<ActionResult> {
  const supabase = await requireAuth();

  const parsed = InstagramSchema.safeParse(metadata);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const ext = thumbnailFile.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(thumbnailFile.base64, "base64");

  const { error: upErr } = await supabase.storage
    .from("instagram")
    .upload(path, buffer, {
      contentType: thumbnailFile.type,
      upsert: false,
    });

  if (upErr) return { error: `Falha no upload: ${upErr.message}` };

  const { data: pub } = supabase.storage.from("instagram").getPublicUrl(path);

  const { data, error } = await supabase
    .from("instagram_posts")
    .insert({
      url: normalizeUrl(parsed.data.url),
      thumbnail_url: pub.publicUrl,
      caption: parsed.data.caption,
      media_type: parsed.data.media_type,
      order_index: parsed.data.order_index,
      published: parsed.data.published,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/instagram");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateInstagramPost(
  id: string,
  metadata: {
    url: string;
    caption: string;
    media_type: "photo" | "video" | "carousel" | "reel";
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

  const updates: Record<string, unknown> = {
    url: normalizeUrl(parsed.data.url),
    caption: parsed.data.caption,
    media_type: parsed.data.media_type,
    order_index: parsed.data.order_index,
    published: parsed.data.published,
  };

  if (thumbnailFile) {
    const ext = thumbnailFile.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(thumbnailFile.base64, "base64");
    const { error: upErr } = await supabase.storage
      .from("instagram")
      .upload(path, buffer, {
        contentType: thumbnailFile.type,
        upsert: false,
      });
    if (upErr) return { error: `Falha no upload: ${upErr.message}` };
    const { data: pub } = supabase.storage.from("instagram").getPublicUrl(path);
    updates.thumbnail_url = pub.publicUrl;
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
