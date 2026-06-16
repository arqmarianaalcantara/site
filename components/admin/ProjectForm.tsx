"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/lib/types";
import { createProject, updateProject } from "@/app/admin/projetos/actions";

interface Props {
  project?: Project;
}

const CATEGORIES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "quarto", label: "Quarto" },
  { value: "cozinha", label: "Cozinha" },
  { value: "comercial", label: "Comercial" },
  { value: "outro", label: "Outro" },
];

export function ProjectForm({ project }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [category, setCategory] = useState(project?.category ?? "apartamento");
  const [description, setDescription] = useState(project?.description ?? "");
  const [orderIndex, setOrderIndex] = useState(project?.order_index ?? 0);
  const [published, setPublished] = useState(project?.published ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.set("title", title);
    form.set("slug", slug);
    form.set("category", category);
    form.set("description", description);
    form.set("order_index", String(orderIndex));
    if (published) form.set("published", "on");

    startTransition(async () => {
      const result = project
        ? await updateProject(project.id, form)
        : await createProject(form);

      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(project ? "Projeto atualizado" : "Projeto criado");
      if (!project) {
        router.push("/admin/projetos");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Field label="Título" required>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Slug" hint="URL do projeto. Deixe vazio para gerar automaticamente.">
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={title ? `ex: ${title.toLowerCase().replace(/\s+/g, "_")}` : "ex: apto_bossa"}
          className="input"
        />
      </Field>

      <Field label="Categoria">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Project["category"])}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Descrição" hint="Texto exibido na página do projeto.">
        <textarea
          rows={7}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input resize-y"
        />
      </Field>

      <Field label="Ordem" hint="Projetos com menor número aparecem primeiro.">
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
            Desmarque para ocultar este projeto temporariamente.
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
          {project ? "Salvar alterações" : "Criar projeto"}
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
