import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ProjectGallery } from "@/components/site/ProjectGallery";
import { getProjectBySlug, getPublishedProjects } from "@/lib/queries";
import { CATEGORY_LABEL } from "@/lib/types";
import { WHATSAPP_LINK } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description.slice(0, 160),
    openGraph: {
      title: project.title,
      description: project.description.slice(0, 160),
      images: project.cover_url ? [{ url: project.cover_url }] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const all = await getPublishedProjects();
  const others = all.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      {project.cover_url && (
        <section className="relative h-[70svh] sm:h-[80svh] min-h-[440px] sm:min-h-[560px]">
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/50" />
          <div className="absolute inset-x-0 bottom-0 container pb-10 sm:pb-16 lg:pb-24">
            <Reveal>
              <p className="eyebrow text-bone/90">
                {CATEGORY_LABEL[
                  project.category as keyof typeof CATEGORY_LABEL
                ] ?? project.category}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <h1 className="font-display text-fluid-hero text-bone leading-[1.05] sm:leading-[0.95] mt-3 sm:mt-4">
                {project.title}
              </h1>
            </Reveal>
          </div>
        </section>
      )}

      {/* Breadcrumb */}
      <div className="container pt-8 sm:pt-12">
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 eyebrow link-underline py-2"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Todos os projetos
        </Link>
      </div>

      {/* Description */}
      <section className="container py-12 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 sm:gap-12 lg:gap-20">
          <Reveal>
            <p className="eyebrow">Sobre o projeto</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-display text-xl sm:text-2xl lg:text-3xl leading-[1.4] sm:leading-[1.35] text-balance">
              {project.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="container pb-20 sm:pb-28 lg:pb-40">
        <Reveal>
          <p className="eyebrow mb-6 sm:mb-10">Galeria · {project.images.length} fotos</p>
        </Reveal>
        <ProjectGallery images={project.images} />
      </section>

      {/* Other projects */}
      {others.length > 0 && (
        <section className="bg-stone-100/60 py-20 sm:py-28 lg:py-40">
          <div className="container">
            <Reveal>
              <p className="eyebrow">Continue explorando</p>
              <h2 className="font-display text-fluid-h1 mt-3 sm:mt-4 leading-[1.1] md:leading-[1.05]">
                Outros projetos
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-16">
              {others.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08}>
                  <Link href={`/projetos/${p.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                      {p.cover_url && (
                        <Image
                          src={p.cover_url}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-[1.2s] ease-smooth group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                      )}
                    </div>
                    <div className="mt-4 sm:mt-5 flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg sm:text-xl truncate">
                        {p.title}
                      </h3>
                      <ArrowUpRight
                        size={18}
                        strokeWidth={1.4}
                        className="shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-20 sm:py-28">
        <Reveal>
          <div className="bg-ink text-bone px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-24 text-center">
            <h2 className="font-display text-fluid-h1 leading-[1.1] md:leading-[1.05] text-balance">
              Imagina o seu projeto
              <br />
              <em className="italic font-light">com esse cuidado.</em>
            </h2>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-bone text-ink px-7 sm:px-8 py-4 sm:py-5 mt-8 sm:mt-10 text-sm uppercase tracking-ultra-wide min-h-[48px] transition-all duration-300 hover:bg-clay"
            >
              Falar com Mariana
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
