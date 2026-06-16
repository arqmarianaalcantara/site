import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Eye, EyeOff, Plus } from "lucide-react";
import { getAllInstagramPosts } from "@/lib/queries";
import { INSTAGRAM_MEDIA_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  const posts = await getAllInstagramPosts();

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div>
          <p className="eyebrow">Rede social</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3">Instagram</h1>
          <p className="text-ink/60 mt-2 text-sm sm:text-base">
            {posts.length}{" "}
            {posts.length === 1 ? "destaque cadastrado" : "destaques cadastrados"}{" "}
            · até 6 aparecem na home
          </p>
        </div>
        <Link
          href="/admin/instagram/novo"
          className="inline-flex items-center justify-center gap-2 bg-ink text-bone px-6 py-3.5 text-sm uppercase tracking-ultra-wide min-h-[48px] hover:bg-walnut transition-colors self-start"
        >
          <Plus size={16} />
          Novo destaque
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-bone border border-walnut/15 p-10 sm:p-12 text-center">
          <p className="text-ink/60">
            Nenhum destaque ainda. Cole a URL de um post ou reel pra começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/instagram/${post.id}`}
              className="group bg-bone border border-walnut/15 hover:border-ink transition-colors block"
            >
              <div className="relative aspect-square bg-stone-100">
                {post.thumbnail_url && (
                  <Image
                    src={post.thumbnail_url}
                    alt={post.caption || "Post Instagram"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}
                <span
                  className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-[0.6rem] uppercase tracking-ultra-wide ${
                    post.published
                      ? "bg-bone/95 text-ink"
                      : "bg-ink/80 text-bone"
                  }`}
                >
                  {post.published ? <Eye size={10} /> : <EyeOff size={10} />}
                  {post.published ? "Visível" : "Oculto"}
                </span>
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-ink/85 text-bone px-2 py-1 text-[0.6rem] uppercase tracking-ultra-wide">
                  {INSTAGRAM_MEDIA_LABEL[post.media_type]}
                </span>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-ink/70 line-clamp-2 min-h-[2.4em]">
                  {post.caption || "Sem legenda"}
                </p>
                <p className="text-[0.65rem] uppercase tracking-ultra-wide text-walnut/60 mt-2 flex items-center gap-1">
                  <ExternalLink size={9} />
                  {new URL(post.url).pathname.replace(/\/$/, "")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
