"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, RefreshCcw, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import type { InstagramMediaType, InstagramPost } from "@/lib/types";
import {
  createInstagramPost,
  updateInstagramPost,
} from "@/app/admin/instagram/actions";

interface Props {
  post?: InstagramPost;
}

const MEDIA_TYPES: { value: InstagramMediaType; label: string }[] = [
  { value: "photo", label: "Foto" },
  { value: "carousel", label: "Carrossel (várias fotos)" },
  { value: "video", label: "Vídeo" },
  { value: "reel", label: "Reel" },
];

function detectFromUrl(url: string): InstagramMediaType {
  if (/\/reels?\//.test(url)) return "reel";
  if (/\/tv\//.test(url)) return "video";
  return "photo";
}

export function InstagramForm({ post }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState(post?.url ?? "");
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [mediaType, setMediaType] = useState<InstagramMediaType>(
    post?.media_type ?? "photo"
  );
  const [orderIndex, setOrderIndex] = useState(post?.order_index ?? 0);
  const [published, setPublished] = useState(post?.published ?? true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    post?.thumbnail_url ?? null
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [refetchThumb, setRefetchThumb] = useState(false);

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    if (file) setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    if (!post) {
      const detected = detectFromUrl(value);
      setMediaType(detected);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Cola a URL do post");
      return;
    }

    startTransition(async () => {
      try {
        const metadata = {
          url: url.trim(),
          caption: caption.trim(),
          media_type: mediaType,
          order_index: orderIndex,
          published,
        };

        let thumbPayload = null;
        if (thumbnailFile) {
          thumbPayload = {
            name: thumbnailFile.name,
            type: thumbnailFile.type,
            base64: await fileToBase64(thumbnailFile),
          };
        }

        const result = post
          ? await updateInstagramPost(
              post.id,
              metadata,
              thumbPayload,
              refetchThumb
            )
          : await createInstagramPost(metadata, thumbPayload);

        if ("error" in result && result.error) {
          toast.error(result.error);
          return;
        }

        const thumbHint =
          "thumbnail" in result && result.thumbnail
            ? result.thumbnail === "auto"
              ? " (capa pega automaticamente do Instagram)"
              : result.thumbnail === "uploaded"
                ? " (capa enviada por você)"
                : " (sem capa, vai aparecer um card visual)"
            : "";

        toast.success(
          (post ? "Destaque atualizado" : "Destaque publicado") + thumbHint
        );
        if (!post) router.push("/admin/instagram");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro inesperado";
        toast.error(msg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Field
        label="URL do post"
        required
        hint="Cola a URL completa de um post, reel ou IGTV. O sistema tenta puxar a capa sozinho do Instagram."
      >
        <input
          type="url"
          required
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.instagram.com/p/..."
          className="input"
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
          <p className="font-medium">Visível na home</p>
          <p className="text-sm text-ink/60">
            Só os 6 primeiros marcados como visíveis aparecem no site.
          </p>
        </div>
      </label>

      {/* Opções avançadas */}
      <details
        className="bg-stone-100/40 border border-walnut/15 px-5 py-4 group"
        open={advancedOpen}
        onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-sm uppercase tracking-ultra-wide text-ink/70 select-none flex items-center justify-between">
          <span>Opções avançadas (legenda, capa, ordem)</span>
          <span className="text-walnut/60 group-open:rotate-180 transition-transform">▾</span>
        </summary>

        <div className="mt-6 space-y-6">
          <Field
            label="Legenda (opcional)"
            hint="Texto curto que aparece em hover no card. Em branco também fica bom."
          >
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input resize-y"
              maxLength={140}
            />
            <p className="text-xs text-ink/40 mt-1">{caption.length}/140</p>
          </Field>

          <Field
            label="Tipo de mídia"
            hint="Detectado automaticamente pela URL. Pode mudar se preferir."
          >
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as InstagramMediaType)}
              className="input"
            >
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Capa personalizada (opcional)"
            hint="Se você não enviar, o sistema tenta pegar do Instagram. Se nem isso der, o card vai mostrar um visual em gradiente."
          >
            <div className="flex items-start gap-6 flex-wrap">
              {thumbnailPreview && (
                <div className="relative w-28 aspect-square bg-stone-100 shrink-0">
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
              <label className="block cursor-pointer flex-1 min-w-[200px]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleThumbChange}
                />
                <div className="border-2 border-dashed border-walnut/30 hover:border-ink p-5 text-center transition-colors">
                  <UploadCloud
                    size={20}
                    strokeWidth={1.2}
                    className="mx-auto text-walnut mb-2"
                  />
                  <p className="text-sm">
                    {thumbnailFile
                      ? thumbnailFile.name
                      : "Subir uma imagem (opcional)"}
                  </p>
                </div>
              </label>
            </div>
          </Field>

          {post && (
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
                  Buscar capa do Instagram de novo
                </p>
                <p className="text-sm text-ink/60">
                  Útil se a capa veio errada ou se você atualizou o post.
                </p>
              </div>
            </label>
          )}

          <Field label="Ordem" hint="Menor número aparece primeiro na home.">
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="input w-32"
            />
          </Field>
        </div>
      </details>

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
          {post ? "Salvar alterações" : "Adicionar destaque"}
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
          {required && (
            <span className="text-walnut/60 normal-case ml-1">*</span>
          )}
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
