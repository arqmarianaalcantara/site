import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, EyeOff, Play } from "lucide-react";
import { getAllVideos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await getAllVideos();

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div>
          <p className="eyebrow">Em movimento</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3">Vídeos</h1>
          <p className="text-ink/60 mt-2 text-sm sm:text-base">
            {videos.length} {videos.length === 1 ? "vídeo" : "vídeos"}
          </p>
        </div>
        <Link
          href="/admin/videos/novo"
          className="inline-flex items-center justify-center gap-2 bg-ink text-bone px-6 py-3.5 text-sm uppercase tracking-ultra-wide min-h-[48px] hover:bg-walnut transition-colors self-start"
        >
          <Plus size={16} />
          Novo vídeo
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="bg-bone border border-walnut/15 p-10 sm:p-12 text-center">
          <p className="text-ink/60">Nenhum vídeo ainda. Publique o primeiro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/admin/videos/${video.id}`}
              className="group bg-bone border border-walnut/15 hover:border-ink transition-colors block"
            >
              <div className="relative aspect-[9/16] sm:aspect-[3/4] bg-stone-100">
                {video.thumbnail_url ? (
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-walnut text-bone">
                    <Play size={28} strokeWidth={1.2} />
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] uppercase tracking-ultra-wide ${
                    video.published
                      ? "bg-bone/95 text-ink"
                      : "bg-ink/80 text-bone"
                  }`}
                >
                  {video.published ? (
                    <>
                      <Eye size={11} />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff size={11} />
                      Oculto
                    </>
                  )}
                </span>
                <span className="absolute bottom-3 left-3 w-10 h-10 grid place-items-center bg-bone/95 text-ink rounded-full">
                  <Play size={14} strokeWidth={1.5} className="translate-x-0.5" />
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h2 className="font-display text-base sm:text-xl group-hover:text-walnut transition-colors truncate">
                  {video.title}
                </h2>
                {video.description && (
                  <p className="text-xs sm:text-sm text-ink/60 mt-1.5 sm:mt-2 line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
