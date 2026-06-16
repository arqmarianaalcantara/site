"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteInstagramPost } from "@/app/admin/instagram/actions";

interface Props {
  postId: string;
  label: string;
}

export function DeleteInstagramButton({ postId, label }: Props) {
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInstagramPost(postId);
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
        Remover destaque
      </button>
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      <p className="text-sm text-ink/80">
        Tem certeza que quer remover este destaque{" "}
        {label ? <strong>({label})</strong> : ""}?
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex items-center gap-2 bg-red-700 text-bone px-5 py-3 text-sm uppercase tracking-ultra-wide hover:bg-red-800 transition-colors disabled:opacity-40"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="text-sm text-ink/60 hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
