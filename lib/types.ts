export type ProjectCategory =
  | "apartamento"
  | "quarto"
  | "cozinha"
  | "comercial"
  | "outro";

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  order_index: number;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  cover_url: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithImages extends Project {
  images: ProjectImage[];
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type InstagramMediaType = "photo" | "video" | "carousel" | "reel";

export interface InstagramPost {
  id: string;
  url: string;
  thumbnail_url: string | null;
  caption: string;
  media_type: InstagramMediaType;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const INSTAGRAM_MEDIA_LABEL: Record<InstagramMediaType, string> = {
  photo: "Foto",
  video: "Vídeo",
  carousel: "Carrossel",
  reel: "Reel",
};

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  apartamento: "Apartamento",
  quarto: "Quarto",
  cozinha: "Cozinha",
  comercial: "Comercial",
  outro: "Outro",
};
