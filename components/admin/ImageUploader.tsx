"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ImagePlus, Loader2, Star, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { ProjectImage } from "@/lib/types";
import {
  deleteProjectImage,
  setCoverImage,
  uploadProjectImages,
} from "@/app/admin/projetos/actions";

interface Props {
  projectId: string;
  images: ProjectImage[];
  currentCover: string | null;
}

export function ImageUploader({ projectId, images, currentCover }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number }>({
    done: 0,
    total: 0,
  });
  const [pending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    try {
      const BATCH = 3;
      const list = Array.from(files);
      let done = 0;

      for (let i = 0; i < list.length; i += BATCH) {
        const chunk = list.slice(i, i + BATCH);
        const payload = await Promise.all(
          chunk.map(async (file) => ({
            name: file.name,
            type: file.type,
            base64: await fileToBase64(file),
          }))
        );

        const result = await uploadProjectImages(projectId, payload);
        if ("error" in result && result.error) {
          toast.error(result.error);
          break;
        }
        done += chunk.length;
        setProgress({ done, total: list.length });
      }

      toast.success(`${done} ${done === 1 ? "foto enviada" : "fotos enviadas"}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha no upload";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(imageId: string) {
    if (!confirm("Remover esta foto? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const result = await deleteProjectImage(imageId, projectId);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Foto removida");
      }
    });
  }

  function handleSetCover(url: string) {
    startTransition(async () => {
      const result = await setCoverImage(projectId, url);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Capa atualizada");
      }
    });
  }

  return (
    <div className="space-y-6">
      <label
        htmlFor="image-upload"
        className={`block border-2 border-dashed border-walnut/30 hover:border-ink p-6 sm:p-10 text-center cursor-pointer transition-colors ${
          uploading ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-walnut" />
              <p className="font-display text-lg sm:text-xl">
                Enviando {progress.done} de {progress.total}
              </p>
            </>
          ) : (
            <>
              <ImagePlus size={28} strokeWidth={1.2} className="text-walnut" />
              <p className="font-display text-lg sm:text-xl">Subir fotos</p>
              <p className="text-xs sm:text-sm text-ink/60 max-w-xs">
                Toque para selecionar várias fotos. JPG, PNG, WEBP ou AVIF.
              </p>
            </>
          )}
        </div>
      </label>

      {images.length === 0 ? (
        <p className="text-center text-sm text-ink/50 py-12">
          Nenhuma foto enviada ainda.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {images.map((img) => {
            const isCover = img.url === currentCover;
            return (
              <div
                key={img.id}
                className="relative group aspect-square bg-stone-100"
              >
                <Image
                  src={img.url}
                  alt={img.alt || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {isCover && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 bg-ink text-bone px-1.5 py-1 text-[0.55rem] sm:text-[0.6rem] uppercase tracking-wider z-10">
                    <CheckCircle2 size={10} />
                    Capa
                  </span>
                )}
                <div className="absolute inset-0 bg-ink/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-end md:items-center justify-center gap-1.5 sm:gap-2 p-2 pointer-events-none">
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(img.url)}
                      disabled={pending}
                      className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 grid place-items-center bg-bone text-ink hover:bg-clay transition-colors"
                      aria-label="Tornar capa"
                      title="Usar como capa"
                    >
                      <Star size={14} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    disabled={pending}
                    className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 grid place-items-center bg-bone text-ink hover:bg-red-700 hover:text-bone transition-colors"
                    aria-label="Remover"
                    title="Remover"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}
