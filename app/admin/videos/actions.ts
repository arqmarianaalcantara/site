"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  downloadYouTubeThumbnail,
  extractYouTubeId,
  isValidYouTubeUrl,
} from "@/lib/youtube";

type ActionResult =
  | { error: string; success?: never }
  | { success: true; error?: never; id?: string };

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

interface VideoMetadata {
  title: string;
  description: string;
  order_index: number;
  published: boolean;
}

async function uploadBufferToVideos(
  supabase: Awaited<ReturnType<typeof requireAuth>>,
  buffer: Buffer,
  contentType: string,
  folder: string
): Promise<string | null> {
  const ext =
    contentType.split("/")[1]?.split(";")[0]?.replace("jpeg", "jpg") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("videos")
    .upload(path, buffer, { contentType, upsert: false });
  if (error) {
    console.warn("[videos] upload failed:", error.message);
    return null;
  }
  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}

async function uploadThumbnailFile(
  supabase: Awaited<ReturnType<typeof requireAuth>>,
  file: UploadFile
): Promise<string | null> {
  const buffer = Buffer.from(file.base64, "base64");
  return uploadBufferToVideos(supabase, buffer, file.type, "thumbs");
}

async function uploadVideoFile(
  supabase: Awaited<ReturnType<typeof requireAuth>>,
  file: UploadFile
): Promise<string | null> {
  const buffer = Buffer.from(file.base64, "base64");
  return uploadBufferToVideos(supabase, buffer, file.type, "files");
}

export async function createVideo(
  metadata: VideoMetadata,
  source:
    | { kind: "upload"; videoFile: UploadFile }
    | { kind: "youtube"; youtubeUrl: string },
  thumbnailFile?: UploadFile | null
): Promise<ActionResult> {
  const supabase = await requireAuth();

  const parsed = VideoSchema.safeParse(metadata);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  let videoUrl: string | null = null;
  let youtubeUrl: string | null = null;
  let thumbnailUrl: string | null = null;

  if (source.kind === "youtube") {
    const cleaned = source.youtubeUrl.trim();
    if (!isValidYouTubeUrl(cleaned)) {
      return {
        error:
          "URL de YouTube inválida. Use o link do watch, youtu.be, embed ou shorts.",
      };
    }
    youtubeUrl = cleaned;
    const ytId = extractYouTubeId(cleaned)!;
    // Baixa thumbnail automática do YouTube se a usuária não subiu uma manual
    if (!thumbnailFile) {
      const downloaded = await downloadYouTubeThumbnail(ytId);
      if (downloaded) {
        thumbnailUrl = await uploadBufferToVideos(
          supabase,
          downloaded.buffer,
          downloaded.contentType,
          "thumbs"
        );
      }
    }
  } else {
    if (!source.videoFile?.base64) {
      return { error: "Selecione um arquivo de vídeo" };
    }
    videoUrl = await uploadVideoFile(supabase, source.videoFile);
    if (!videoUrl) return { error: "Falha no upload do vídeo" };
  }

  if (thumbnailFile && !thumbnailUrl) {
    thumbnailUrl = await uploadThumbnailFile(supabase, thumbnailFile);
  }

  const { data, error } = await supabase
    .from("videos")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      video_url: videoUrl,
      youtube_url: youtubeUrl,
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
  metadata: VideoMetadata,
  changes: {
    replaceVideoFile?: UploadFile | null;
    newYoutubeUrl?: string | null;
    thumbnailFile?: UploadFile | null;
    refetchYouTubeThumbnail?: boolean;
  } = {}
): Promise<ActionResult> {
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

  // Troca de fonte: se veio YouTube URL nova, limpa video_url e vice-versa
  if (changes.newYoutubeUrl !== undefined && changes.newYoutubeUrl !== null) {
    const cleaned = changes.newYoutubeUrl.trim();
    if (cleaned === "") {
      // Explicitamente vazio significa "manter como está"
    } else {
      if (!isValidYouTubeUrl(cleaned)) {
        return { error: "URL de YouTube inválida" };
      }
      updates.youtube_url = cleaned;
      updates.video_url = null;

      if (changes.refetchYouTubeThumbnail && !changes.thumbnailFile) {
        const ytId = extractYouTubeId(cleaned)!;
        const downloaded = await downloadYouTubeThumbnail(ytId);
        if (downloaded) {
          const uploaded = await uploadBufferToVideos(
            supabase,
            downloaded.buffer,
            downloaded.contentType,
            "thumbs"
          );
          if (uploaded) updates.thumbnail_url = uploaded;
        }
      }
    }
  }

  if (changes.replaceVideoFile?.base64) {
    const uploaded = await uploadVideoFile(supabase, changes.replaceVideoFile);
    if (uploaded) {
      updates.video_url = uploaded;
      updates.youtube_url = null;
    }
  }

  if (changes.thumbnailFile?.base64) {
    const uploaded = await uploadThumbnailFile(
      supabase,
      changes.thumbnailFile
    );
    if (uploaded) updates.thumbnail_url = uploaded;
  }

  const { error } = await supabase.from("videos").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  return { success: true };
}

export async function deleteVideo(id: string): Promise<ActionResult> {
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
