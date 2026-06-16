"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const VideoSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().default(""),
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

interface UploadFile {
  name: string;
  type: string;
  base64: string;
}

export async function createVideo(
  metadata: { title: string; description: string; order_index: number; published: boolean },
  videoFile: UploadFile,
  thumbnailFile?: UploadFile | null
) {
  const supabase = await requireAuth();

  const parsed = VideoSchema.safeParse(metadata);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  // Upload do vídeo
  const videoExt = videoFile.name.split(".").pop()?.toLowerCase() || "mp4";
  const videoPath = `${crypto.randomUUID()}.${videoExt}`;
  const videoBuffer = Buffer.from(videoFile.base64, "base64");

  const { error: vErr } = await supabase.storage
    .from("videos")
    .upload(videoPath, videoBuffer, {
      contentType: videoFile.type,
      upsert: false,
    });

  if (vErr) return { error: `Falha no upload do vídeo: ${vErr.message}` };

  const { data: vPub } = supabase.storage.from("videos").getPublicUrl(videoPath);

  // Upload da thumbnail (opcional)
  let thumbnailUrl: string | null = null;
  if (thumbnailFile) {
    const tExt = thumbnailFile.name.split(".").pop()?.toLowerCase() || "webp";
    const tPath = `thumbs/${crypto.randomUUID()}.${tExt}`;
    const tBuffer = Buffer.from(thumbnailFile.base64, "base64");
    const { error: tErr } = await supabase.storage
      .from("videos")
      .upload(tPath, tBuffer, {
        contentType: thumbnailFile.type,
        upsert: false,
      });
    if (!tErr) {
      const { data: tPub } = supabase.storage.from("videos").getPublicUrl(tPath);
      thumbnailUrl = tPub.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from("videos")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      video_url: vPub.publicUrl,
      thumbnail_url: thumbnailUrl,
      order_index: parsed.data.order_index,
      published: parsed.data.published,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { success: true, id: data.id };
}

export async function updateVideo(
  id: string,
  metadata: { title: string; description: string; order_index: number; published: boolean },
  thumbnailFile?: UploadFile | null
) {
  const supabase = await requireAuth();

  const parsed = VideoSchema.safeParse(metadata);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const updates: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description,
    order_index: parsed.data.order_index,
    published: parsed.data.published,
  };

  if (thumbnailFile) {
    const tExt = thumbnailFile.name.split(".").pop()?.toLowerCase() || "webp";
    const tPath = `thumbs/${crypto.randomUUID()}.${tExt}`;
    const tBuffer = Buffer.from(thumbnailFile.base64, "base64");
    const { error: tErr } = await supabase.storage
      .from("videos")
      .upload(tPath, tBuffer, {
        contentType: thumbnailFile.type,
        upsert: false,
      });
    if (!tErr) {
      const { data: tPub } = supabase.storage.from("videos").getPublicUrl(tPath);
      updates.thumbnail_url = tPub.publicUrl;
    }
  }

  const { error } = await supabase.from("videos").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { success: true };
}

export async function deleteVideo(id: string) {
  const supabase = await requireAuth();

  const { data: video } = await supabase
    .from("videos")
    .select("video_url, thumbnail_url")
    .eq("id", id)
    .single();

  const paths: string[] = [];
  if (video?.video_url) {
    const p = extractStoragePath(video.video_url, "videos");
    if (p) paths.push(p);
  }
  if (video?.thumbnail_url) {
    const p = extractStoragePath(video.thumbnail_url, "videos");
    if (p) paths.push(p);
  }
  if (paths.length > 0) {
    await supabase.storage.from("videos").remove(paths);
  }

  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  redirect("/admin/videos");
}

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
