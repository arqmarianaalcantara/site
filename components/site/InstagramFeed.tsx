import Image from "next/image";
import { ArrowUpRight, Images, Instagram, Play } from "lucide-react";
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
      <Icon
        size={13}
        strokeWidth={1.6}
        className={Icon === Play ? "translate-x-0.5" : ""}
      />
    </span>
  );
}

function shortcodeFromUrl(url: string): string {
  try {
    const m = url.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    return m?.[1] ?? "";
  } catch {
    return "";
  }
}

interface CardProps {
  post: InstagramPost;
}

function PostCard({ post }: CardProps) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative aspect-square overflow-hidden bg-stone-100"
      aria-label={post.caption || "Ver post no Instagram"}
    >
      {post.thumbnail_url ? (
        <Image
          src={post.thumbnail_url}
          alt={post.caption || ""}
          fill
          className="object-cover transition-transform duration-[1.4s] ease-smooth group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
      ) : (
        <PlaceholderArt post={post} />
      )}
      <MediaBadge type={post.media_type} />
      {post.caption && (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent text-bone opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <p className="text-xs sm:text-sm line-clamp-3 leading-snug">
            {post.caption}
          </p>
        </div>
      )}
    </a>
  );
}

function PlaceholderArt({ post }: CardProps) {
  const code = shortcodeFromUrl(post.url);
  const palettes: Array<[string, string, string]> = [
    ["#EAE3D8", "#C9B89F", "#594A3D"],
    ["#D9CFC0", "#A6AE9A", "#1A1714"],
    ["#F4EFE8", "#C9B89F", "#1A1714"],
    ["#EAE3D8", "#A6AE9A", "#594A3D"],
    ["#D9CFC0", "#C9B89F", "#1A1714"],
  ];
  const hash = code
    .split("")
    .reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) >>> 0, 7);
  const [c1, c2, c3] = palettes[hash % palettes.length];

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-transform duration-[1.4s] ease-smooth group-hover:scale-105"
      style={{
        background: `radial-gradient(circle at 30% 20%, ${c1}, ${c2} 50%, ${c3})`,
      }}
    >
      <Instagram
        size={36}
        strokeWidth={1.2}
        className="text-bone/90 mb-3"
      />
      <p className="font-display text-bone text-base sm:text-lg leading-tight">
        {post.media_type === "reel"
          ? "Reel"
          : post.media_type === "video"
            ? "Vídeo"
            : post.media_type === "carousel"
              ? "Carrossel"
              : "Post"}
      </p>
      <p className="text-bone/70 text-[0.65rem] uppercase tracking-ultra-wide mt-2">
        @arquiteta.mariana
      </p>
    </div>
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
            <PostCard post={post} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
