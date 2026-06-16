"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Save, UploadCloud, Film } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "@/lib/types";
import { createVideo, updateVideo } from "@/app/admin/videos/actions";

interface Props {
  video?: Video;
}

export function VideoForm({ video }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(video?.title ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [orderIndex, setOrderIndex] = useState(video?.order_index ?? 0);
  const [published, setPublished] = useState(video?.published ?? true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    video?.thumbnail_url ?? null
  );
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
  }

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!video && !videoFile) {
      toast.error("Selecione um arquivo de vídeo");
      return;
    }

    startTransition(async () => {
      try {
        const metadata = {
          title,
          description,
          order_index: orderIndex,
          published,
        };

        let thumbPayload = null;
        if (thumbnailFile) {
          setUploadProgress("Preparando capa...");
          thumbPayload = {
            name: thumbnailFile.name,
            type: thumbnailFile.type,
            base64: await fileToBase64(thumbnailFile),
          };
        }

        if (video) {
          const result = await updateVideo(video.id, metadata, thumbPayload);
          if ("error" in result && result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Vídeo atualizado");
        } else {
          setUploadProgress("Enviando vídeo...");
          const videoPayload = {
            name: videoFile!.name,
            type: videoFile!.type,
            base64: await fileToBase64(videoFile!),
          };
          const result = await createVideo(metadata, videoPayload, thumbPayload);
          if ("error" in result && result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Vídeo publicado");
          router.push("/admin/videos");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Falha no envio";
        toast.error(msg);
      } finally {
        setUploadProgress(null);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!video && (
        <Field
          label="Arquivo de vídeo"
          required
          hint="MP4, MOV ou WebM. Máximo 500 MB. Vídeos verticais funcionam melhor."
        >
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              required
              className="sr-only"
              onChange={handleVideoChange}
            />
            <div className="border-2 border-dashed border-walnut/30 hover:border-ink p-8 text-center transition-colors">
              <Film size={28} strokeWidth={1.2} className="mx-auto text-walnut mb-3" />
              <p className="font-display text-lg">
                {videoFile ? videoFile.name : "Selecionar arquivo"}
              </p>
              {videoFile && (
                <p className="text-sm text-ink/60 mt-1">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
            </div>
          </label>
        </Field>
      )}

      <Field label="Capa (thumbnail)" hint="Imagem mostrada antes do play. Opcional, mas recomendada.">
        <div className="flex items-start gap-6">
          {thumbnailPreview && (
            <div className="relative w-28 aspect-[9/16] bg-stone-100 shrink-0">
              <Image
                src={thumbnailPreview}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
                unoptimized={thumbnailPreview.startsWith("blob:")}
              />
            </div>
          )}
          <label className="block cursor-pointer flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleThumbChange}
            />
            <div className="border-2 border-dashed border-walnut/30 hover:border-ink p-6 text-center transition-colors">
              <UploadCloud
                size={22}
                strokeWidth={1.2}
                className="mx-auto text-walnut mb-2"
              />
              <p className="text-sm">
                {thumbnailFile ? thumbnailFile.name : "Subir imagem de capa"}
              </p>
            </div>
          </label>
        </div>
      </Field>

      <Field label="Título" required>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Descrição">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input resize-y"
        />
      </Field>

      <Field label="Ordem">
        <input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          className="input w-32"
        />
      </Field>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="mt-1 w-5 h-5 accent-ink"
        />
        <div>
          <p className="font-medium">Publicado no site</p>
          <p className="text-sm text-ink/60">
            Desmarque para ocultar este vídeo do público.
          </p>
        </div>
      </label>

      {uploadProgress && (
        <p className="text-sm text-walnut flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          {uploadProgress}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-walnut/15">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 bg-ink text-bone px-6 py-3.5 text-sm uppercase tracking-ultra-wide min-h-[48px] hover:bg-walnut transition-colors disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {video ? "Salvar alterações" : "Publicar vídeo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 text-sm uppercase tracking-ultra-wide text-ink/60 hover:text-ink min-h-[48px]"
        >
          Cancelar
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.875rem 1rem;
          background-color: #f4efe8;
          border: 1px solid rgba(89, 74, 61, 0.2);
          color: #1a1714;
          font-size: 16px;
          min-height: 48px;
          transition: border-color 200ms ease;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #1a1714;
        }
        @media (min-width: 768px) {
          :global(.input) {
            font-size: inherit;
          }
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block">
        <span className="eyebrow block mb-3">
          {label}
          {required && <span className="text-walnut/60 normal-case ml-1">*</span>}
        </span>
        {children}
      </label>
      {hint && <p className="text-xs text-ink/50 mt-2">{hint}</p>}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}
