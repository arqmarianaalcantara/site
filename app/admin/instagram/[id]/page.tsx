import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InstagramForm } from "@/components/admin/InstagramForm";
import { DeleteInstagramButton } from "@/components/admin/DeleteInstagramButton";
import type { InstagramPost } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditInstagramPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();
  const typed = post as InstagramPost;

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-3xl">
      <Link
        href="/admin/instagram"
        className="inline-flex items-center gap-2 eyebrow link-underline mb-6 sm:mb-8 py-2"
      >
        <ArrowLeft size={14} />
        Voltar para Instagram
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 sm:mb-12">
        <div className="min-w-0">
          <p className="eyebrow">Editar destaque</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3">
            {typed.caption || "Sem legenda"}
          </h1>
        </div>
        <a
          href={typed.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-ultra-wide link-underline py-2"
        >
          <ExternalLink size={14} />
          Ver no Instagram
        </a>
      </div>

      <div className="bg-bone border border-walnut/15 p-5 sm:p-8 lg:p-10">
        <InstagramForm post={typed} />
      </div>

      <section className="mt-8 sm:mt-12 bg-bone border border-red-700/30 p-5 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl text-red-700">
          Zona perigosa
        </h2>
        <p className="text-sm text-ink/60 mt-2">
          Remover este destaque também apaga a capa armazenada. Não pode ser
          desfeito.
        </p>
        <div className="mt-5 sm:mt-6">
          <DeleteInstagramButton
            postId={typed.id}
            label={typed.caption || ""}
          />
        </div>
      </section>
    </div>
  );
}
