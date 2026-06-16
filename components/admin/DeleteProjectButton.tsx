"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProject } from "@/app/admin/projetos/actions";

interface Props {
  projectId: string;
  title: string;
}

export function DeleteProjectButton({ projectId, title }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      }
    });
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-ultra-wide border border-red-700 text-red-700 hover:bg-red-700 hover:text-bone transition-colors"
      >
        <Trash2 size={14} />
        Apagar projeto
      </button>
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      <p className="text-sm text-ink/80">
        Para confirmar, digite o nome do projeto:{" "}
        <strong className="font-medium">{title}</strong>
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        className="w-full px-4 py-3 bg-stone-100 border border-walnut/20 focus:outline-none focus:border-ink"
        placeholder={title}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmText !== title || pending}
          className="inline-flex items-center gap-2 bg-red-700 text-bone px-5 py-3 text-sm uppercase tracking-ultra-wide hover:bg-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Confirmar exclusão
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText("");
          }}
          className="text-sm text-ink/60 hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
