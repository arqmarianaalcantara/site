import { Reveal } from "@/components/site/Reveal";
import { VideoCard } from "@/components/site/VideoCard";
import { getPublishedVideos } from "@/lib/queries";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Vídeos",
  description:
    "Tours em vídeo dos projetos finalizados de Mariana Alcântara. Veja os ambientes em movimento.",
};

export default async function VideosPage() {
  const videos = await getPublishedVideos();

  return (
    <>
      <section className="container pt-28 sm:pt-40 lg:pt-48 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 sm:gap-12 lg:gap-20 items-end">
          <Reveal>
            <p className="eyebrow">Em movimento</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="font-display text-fluid-hero leading-[1.05] sm:leading-[0.95] text-balance">
              Vídeos
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-ink/70 max-w-2xl leading-relaxed">
              Tours pelos ambientes finalizados. A arquitetura ganha outro
              significado quando vista no ritmo da casa.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container pb-20 sm:pb-28 lg:pb-40">
        {videos.length === 0 ? (
          <Reveal>
            <div className="text-center py-20 sm:py-32 px-6 border border-walnut/15 bg-stone-100/30">
              <p className="font-display text-2xl sm:text-3xl">Em breve.</p>
              <p className="mt-3 sm:mt-4 text-ink/60">
                Os primeiros tours em vídeo serão publicados aqui.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {videos.map((v, i) => (
              <Reveal key={v.id} delay={(i % 3) * 0.08}>
                <VideoCard video={v} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
