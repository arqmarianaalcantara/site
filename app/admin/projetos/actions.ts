"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const ProjectSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  slug: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().min(2).optional()
    ),
  category: z.enum([
    "apartamento",
    "quarto",
    "cozinha",
    "comercial",
    "outro",
  ]),
  description: z.string().default(""),
  order_index: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

type ActionResult =
  | { error: string; success?: never }
  | { success: true; error?: never; uploaded?: number };

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function createProject(formData: FormData) {
  const supabase = await requireAuth();

  const parsed = ProjectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    order_index: formData.get("order_index") ?? 0,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: parsed.data.title,
      slug,
      category: parsed.data.category,
      description: parsed.data.description,
      order_index: parsed.data.order_index,
      published: parsed.data.published,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/projetos");
  revalidatePath("/projetos");
  revalidatePath("/");
  redirect(`/admin/projetos/${data.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await requireAuth();

  const parsed = ProjectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    order_index: formData.get("order_index") ?? 0,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);

  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      slug,
      category: parsed.data.category,
      description: parsed.data.description,
      order_index: parsed.data.order_index,
      published: parsed.data.published,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/projetos");
  revalidatePath(`/admin/projetos/${id}`);
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await requireAuth();

  // Pegar todas imagens para limpar do storage
  const { data: images } = await supabase
    .from("project_images")
    .select("url")
    .eq("project_id", id);

  const { data: project } = await supabase
    .from("projects")
    .select("cover_url")
    .eq("id", id)
    .single();

  const paths: string[] = [];
  for (const img of images ?? []) {
    const p = extractStoragePath(img.url, "projects");
    if (p) paths.push(p);
  }
  if (project?.cover_url) {
    const p = extractStoragePath(project.cover_url, "projects");
    if (p) paths.push(p);
  }

  if (paths.length > 0) {
    await supabase.storage.from("projects").remove(paths);
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/projetos");
  revalidatePath("/projetos");
  revalidatePath("/");
  redirect("/admin/projetos");
}

export async function uploadProjectImages(
  projectId: string,
  files: { name: string; type: string; base64: string }[]
) {
  const supabase = await requireAuth();

  const { data: existing } = await supabase
    .from("project_images")
    .select("order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: false })
    .limit(1);

  let nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

  const uploaded: { url: string; order_index: number }[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(file.base64, "base64");

    const { error: upErr } = await supabase.storage
      .from("projects")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (upErr) {
      return { error: `Falha no upload: ${upErr.message}` };
    }

    const { data: pub } = supabase.storage.from("projects").getPublicUrl(path);

    const { error: dbErr } = await supabase.from("project_images").insert({
      project_id: projectId,
      url: pub.publicUrl,
      order_index: nextIndex,
    });

    if (dbErr) {
      return { error: `Falha ao registrar imagem: ${dbErr.message}` };
    }

    uploaded.push({ url: pub.publicUrl, order_index: nextIndex });
    nextIndex++;
  }

  // Se ainda não tem capa, usa a primeira imagem
  const { data: project } = await supabase
    .from("projects")
    .select("cover_url")
    .eq("id", projectId)
    .single();

  if (!project?.cover_url && uploaded[0]) {
    await supabase
      .from("projects")
      .update({ cover_url: uploaded[0].url })
      .eq("id", projectId);
  }

  revalidatePath(`/admin/projetos/${projectId}`);
  revalidatePath("/projetos");
  revalidatePath("/");
  return { success: true, uploaded: uploaded.length };
}

export async function deleteProjectImage(
  imageId: string,
  projectId: string
): Promise<ActionResult> {
  const supabase = await requireAuth();

  const { data: img } = await supabase
    .from("project_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (img?.url) {
    const p = extractStoragePath(img.url, "projects");
    if (p) await supabase.storage.from("projects").remove([p]);
  }

  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", imageId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/projetos/${projectId}`);
  revalidatePath("/projetos");
  return { success: true };
}

export async function setCoverImage(projectId: string, imageUrl: string) {
  const supabase = await requireAuth();
  const { error } = await supabase
    .from("projects")
    .update({ cover_url: imageUrl })
    .eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/projetos/${projectId}`);
  revalidatePath("/projetos");
  revalidatePath("/");
  return { success: true };
}

export async function reorderImages(
  projectId: string,
  ordered: { id: string; order_index: number }[]
) {
  const supabase = await requireAuth();
  for (const item of ordered) {
    await supabase
      .from("project_images")
      .update({ order_index: item.order_index })
      .eq("id", item.id);
  }
  revalidatePath(`/admin/projetos/${projectId}`);
  revalidatePath("/projetos");
  return { success: true };
}

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
