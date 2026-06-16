import { createClient } from "./supabase/server";
import type {
  InstagramPost,
  Project,
  ProjectImage,
  ProjectWithImages,
  Video,
} from "./types";

function logError(scope: string, error: unknown) {
  console.warn(`[queries] ${scope}:`, error);
}

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url && !url.includes("placeholder");
}

export async function getPublishedProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Project[];
  } catch (err) {
    logError("getPublishedProjects", err);
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Project[];
  } catch (err) {
    logError("getAllProjects", err);
    return [];
  }
}

export async function getProjectBySlug(
  slug: string
): Promise<ProjectWithImages | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error || !project) return null;
    const { data: images } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true });
    return {
      ...(project as Project),
      images: (images ?? []) as ProjectImage[],
    };
  } catch (err) {
    logError("getProjectBySlug", err);
    return null;
  }
}

export async function getProjectById(
  id: string
): Promise<ProjectWithImages | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !project) return null;
    const { data: images } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true });
    return {
      ...(project as Project),
      images: (images ?? []) as ProjectImage[],
    };
  } catch (err) {
    logError("getProjectById", err);
    return null;
  }
}

export async function getPublishedVideos(): Promise<Video[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Video[];
  } catch (err) {
    logError("getPublishedVideos", err);
    return [];
  }
}

export async function getAllVideos(): Promise<Video[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Video[];
  } catch (err) {
    logError("getAllVideos", err);
    return [];
  }
}

export async function getPublishedInstagramPosts(
  limit = 6
): Promise<InstagramPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("*")
      .eq("published", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as InstagramPost[];
  } catch (err) {
    logError("getPublishedInstagramPosts", err);
    return [];
  }
}

export async function getAllInstagramPosts(): Promise<InstagramPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as InstagramPost[];
  } catch (err) {
    logError("getAllInstagramPosts", err);
    return [];
  }
}
