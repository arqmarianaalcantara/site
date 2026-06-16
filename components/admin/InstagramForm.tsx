"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Save, UploadCloud } from "lucide-react";
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

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!post && !thumbnailFile) {
      toast.error("Selecione uma imagem de capa");
      return;
    }
    if (!url.trim()) {
      toast.error("Cole a URL do post");
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
          ? await updateInstagramPost(post.id, metadata, thumbPayload)
          : await createInstagramPost(metadata, thumbPayload!);

        if ("error" in result && result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(post ? "Destaque atualizado" : "Destaque publicado");
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
        hint="Cole a URL completa de um post, reel ou IGTV. Ex: https://www.instagram.com/p/Cxx.../ ou /reel/...."
      >
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/..."
          className="input"
        />
      </Field>

      <Field
        label="Imagem de capa"
        required={!post}
        hint="A capa que aparece no site. Use uma foto quadrada (1:1) com ao menos 600x600px."
      >
        <div className="flex items-start gap-6 flex-wrap">
          {thumbnailPreview && (
            <div className="relative w-32 aspect-square bg-stone-100 shrink-0">
              <Image
                src={thumbnailPreview}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
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
            <div className="border-2 border-dashed border-walnut/30 hover:border-ink p-6 text-center transition-colors">
              <UploadCloud
                size={22}
                strokeWidth={1.2}
                className="mx-auto text-walnut mb-2"
              />
              <p className="text-sm">
                {thumbnailFile
                  ? thumbnailFile.name
                  : post
                    ? "Trocar capa (opcional)"
                    : "Selecionar capa"}
              </p>
            </div>
          </label>
        </div>
      </Field>

      <Field label="Tipo de mídia">
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
        label="Legenda (opcional)"
        hint="Texto curto que aparece embaixo da capa no site. Deixe em branco se não quiser."
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

      <Field label="Ordem" hint="Menor número aparece primeiro.">
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
          <p className="font-medium">Visível na home</p>
          <p className="text-sm text-ink/60">
            Só os 6 primeiros marcados como visíveis aparecem no site.
          </p>
        </div>
      </label>

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
          {post ? "Salvar alterações" : "Publicar destaque"}
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
