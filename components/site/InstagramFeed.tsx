import Image from "next/image";
import { ArrowUpRight, Film, Images, Instagram, Play } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { INSTAGRAM_LINK } from "@/lib/utils";
import type { InstagramPost } from "@/lib/types";

function MediaBadge({ type }: { type: InstagramPost["media_type"] }) {
  const Icon =
    type === "video" || type === "reel"
      ? Play
      : type === "carousel"
        ? Images
        : null;
  if (!Icon) return null;
  return (
    <span className="absolute top-4 right-4 w-8 h-8 grid place-items-center bg-bone/95 text-ink rounded-full transition-all duration-500 group-hover:bg-clay">
      <Icon size={13} strokeWidth={1.6} className={Icon === Play ? "translate-x-0.5" : ""} />
    </span>
  );
}

interface Props {
  posts: InstagramPost[];
}

export function InstagramFeed({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="container pb-20 sm:pb-28 lg:pb-40">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Instagram size={12} strokeWidth={1.6} />
              Nos acompanhe
            </p>
            <h2 className="font-display text-fluid-h1 mt-3 sm:mt-4 leading-[1.1] md:leading-[1.05] text-balance">
              No Instagram, dia a dia
              <br className="hidden sm:inline" />
              <em className="italic font-light"> do escritório.</em>
            </h2>
          </div>
          <a
            href={INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 self-start border border-walnut/30 px-5 py-3 hover:bg-ink hover:text-bone hover:border-ink transition-colors"
          >
            <Instagram size={16} strokeWidth={1.5} />
            <span className="text-sm tracking-wide">@arquiteta.mariana</span>
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </a>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 0.08}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block relative aspect-square overflow-hidden bg-stone-100"
              aria-label={post.caption || "Ver post no Instagram"}
            >
              <Image
                src={post.thumbnail_url}
                alt={post.caption || ""}
                fill
                className="object-cover transition-transform duration-[1.4s] ease-smooth group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <MediaBadge type={post.media_type} />
              {post.caption && (
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent text-bone opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-xs sm:text-sm line-clamp-3 leading-snug">
                    {post.caption}
                  </p>
                </div>
              )}
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
