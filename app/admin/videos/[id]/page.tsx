import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VideoForm } from "@/components/admin/VideoForm";
import { DeleteVideoButton } from "@/components/admin/DeleteVideoButton";
import type { Video } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (!video) notFound();

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-3xl">
      <Link
        href="/admin/videos"
        className="inline-flex items-center gap-2 eyebrow link-underline mb-6 sm:mb-8 py-2"
      >
        <ArrowLeft size={14} />
        Voltar para vídeos
      </Link>

      <p className="eyebrow">Editar vídeo</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-3 mb-8 sm:mb-12 truncate">
        {video.title}
      </h1>

      <div className="bg-bone border border-walnut/15 p-5 sm:p-8 lg:p-10">
        <VideoForm video={video as Video} />
      </div>

      <div className="mt-6 sm:mt-8 bg-bone border border-walnut/15 p-4 sm:p-6">
        <p className="eyebrow text-walnut">Visualizar</p>
        <video
          src={(video as Video).video_url}
          poster={(video as Video).thumbnail_url ?? undefined}
          controls
          playsInline
          className="mt-3 sm:mt-4 w-full bg-black object-contain max-h-[500px]"
        />
      </div>

      <section className="mt-8 sm:mt-12 bg-bone border border-red-700/30 p-5 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl text-red-700">
          Zona perigosa
        </h2>
        <p className="text-sm text-ink/60 mt-2">
          Apagar o vídeo remove o arquivo e a capa do storage. Não pode ser
          desfeito.
        </p>
        <div className="mt-5 sm:mt-6">
          <DeleteVideoButton videoId={(video as Video).id} title={(video as Video).title} />
        </div>
      </section>
    </div>
  );
}
