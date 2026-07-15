"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Film, Loader2, RefreshCcw, Save, UploadCloud, Youtube } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "@/lib/types";
import { createVideo, updateVideo } from "@/app/admin/videos/actions";
import { extractYouTubeId, isValidYouTubeUrl } from "@/lib/youtube";

interface Props {
  video?: Video;
}

type SourceMode = "youtube" | "upload";

export function VideoForm({ video }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initialMode: SourceMode = video?.youtube_url
    ? "youtube"
    : video?.video_url
      ? "upload"
      : "youtube";
  const [mode, setMode] = useState<SourceMode>(initialMode);

  const [title, setTitle] = useState(video?.title ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [orderIndex, setOrderIndex] = useState(video?.order_index ?? 0);
  const [published, setPublished] = useState(video?.published ?? true);

  const [youtubeUrl, setYoutubeUrl] = useState(video?.youtube_url ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [refetchThumb, setRefetchThumb] = useState(!video);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    video?.thumbnail_url ?? null
  );
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
  }

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    if (file) setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleYoutubeUrlChange(value: string) {
    setYoutubeUrl(value);
    if (video?.youtube_url !== value) setRefetchThumb(true);
    const ytId = extractYouTubeId(value);
    if (ytId && !thumbnailFile) {
      setThumbnailPreview(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "youtube") {
      if (!youtubeUrl.trim()) {
        toast.error("Cole a URL do YouTube");
        return;
      }
      if (!isValidYouTubeUrl(youtubeUrl)) {
        toast.error("URL do YouTube parece inválida");
        return;
      }
    } else {
      if (!video && !videoFile) {
        toast.error("Selecione o arquivo de vídeo");
        return;
      }
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
          const changes: {
            replaceVideoFile?: {
              name: string;
              type: string;
              base64: string;
            } | null;
            newYoutubeUrl?: string | null;
            thumbnailFile?: {
              name: string;
              type: string;
              base64: string;
            } | null;
            refetchYouTubeThumbnail?: boolean;
          } = {
            thumbnailFile: thumbPayload,
          };
          if (mode === "youtube" && youtubeUrl !== (video.youtube_url ?? "")) {
            changes.newYoutubeUrl = youtubeUrl;
            changes.refetchYouTubeThumbnail = refetchThumb;
          }
          if (mode === "upload" && videoFile) {
            setUploadProgress("Enviando vídeo...");
            changes.replaceVideoFile = {
              name: videoFile.name,
              type: videoFile.type,
              base64: await fileToBase64(videoFile),
            };
          }
          const result = await updateVideo(video.id, metadata, changes);
          if ("error" in result && result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Vídeo atualizado");
        } else {
          let source:
            | { kind: "youtube"; youtubeUrl: string }
            | {
                kind: "upload";
                videoFile: { name: string; type: string; base64: string };
              };
          if (mode === "youtube") {
            source = { kind: "youtube", youtubeUrl: youtubeUrl.trim() };
          } else {
            setUploadProgress("Enviando vídeo...");
            source = {
              kind: "upload",
              videoFile: {
                name: videoFile!.name,
                type: videoFile!.type,
                base64: await fileToBase64(videoFile!),
              },
            };
          }
          const result = await createVideo(metadata, source, thumbPayload);
          if ("error" in result && result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Vídeo publicado");
          router.push("/admin/videos");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Falha no envio";
        toast.error(msg);
      } finally {
        setUploadProgress(null);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Escolha da fonte */}
      <div>
        <span className="eyebrow block mb-3">Como quer publicar? *</span>
        <div className="grid grid-cols-2 gap-3">
          <SourceButton
            active={mode === "youtube"}
            icon={Youtube}
            title="Do YouTube"
            hint="Cola a URL do vídeo (mais leve, sem storage)"
            onClick={() => setMode("youtube")}
          />
          <SourceButton
            active={mode === "upload"}
            icon={Film}
            title="Fazer upload"
            hint="Sobe o arquivo direto (MP4 até 500 MB)"
            onClick={() => setMode("upload")}
          />
        </div>
      </div>

      {mode === "youtube" ? (
        <Field
          label="URL do vídeo no YouTube"
          required
          hint="Aceita youtube.com/watch, youtu.be, /embed e /shorts. A capa é pega automaticamente."
        >
          <input
            type="url"
            required
            value={youtubeUrl}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input"
          />
        </Field>
      ) : (
        <Field
          label="Arquivo de vídeo"
          required={!video}
          hint="MP4, MOV ou WebM. Máximo 500 MB. Vídeos verticais funcionam melhor no card."
        >
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              required={!video}
              className="sr-only"
              onChange={handleVideoFileChange}
            />
            <div className="border-2 border-dashed border-walnut/30 hover:border-ink p-8 text-center transition-colors">
              <Film
                size={28}
                strokeWidth={1.2}
                className="mx-auto text-walnut mb-3"
              />
              <p className="font-display text-lg">
                {videoFile
                  ? videoFile.name
                  : video?.video_url
                    ? "Trocar arquivo (opcional)"
                    : "Selecionar arquivo"}
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

      <Field
        label="Capa (thumbnail)"
        hint={
          mode === "youtube"
            ? "O YouTube dá a capa. Você pode subir uma personalizada se quiser."
            : "Imagem mostrada antes do play. Opcional, mas recomendada."
        }
      >
        <div className="flex items-start gap-6 flex-wrap">
          {thumbnailPreview && (
            <div className="relative w-32 aspect-video bg-stone-100 shrink-0">
              <Image
                src={thumbnailPreview}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
                unoptimized={
                  thumbnailPreview.startsWith("blob:") ||
                  thumbnailPreview.includes("img.youtube.com")
                }
              />
            </div>
          )}
          <label className="block cursor-pointer flex-1 min-w-[200px]">
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
                {thumbnailFile
                  ? thumbnailFile.name
                  : "Subir imagem de capa (opcional)"}
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

      {video && mode === "youtube" && (
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={refetchThumb}
            onChange={(e) => setRefetchThumb(e.target.checked)}
            className="mt-1 w-5 h-5 accent-ink"
          />
          <div>
            <p className="font-medium flex items-center gap-2">
              <RefreshCcw size={14} strokeWidth={1.5} />
              Atualizar capa a partir do YouTube
            </p>
            <p className="text-sm text-ink/60">
              Marque se você trocou o vídeo do YouTube ou quer a capa mais
              recente.
            </p>
          </div>
        </label>
      )}

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
          background-color: #f7f4ee;
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

function SourceButton({
  active,
  icon: Icon,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  icon: typeof Film;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "text-left p-4 sm:p-5 border transition-all " +
        (active
          ? "bg-ink text-bone border-ink"
          : "bg-bone text-ink border-walnut/25 hover:border-ink")
      }
    >
      <Icon size={20} strokeWidth={1.4} />
      <p className="font-medium mt-3 text-sm sm:text-base">{title}</p>
      <p
        className={
          "text-xs mt-1 leading-relaxed " +
          (active ? "text-bone/70" : "text-ink/60")
        }
      >
        {hint}
      </p>
    </button>
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
