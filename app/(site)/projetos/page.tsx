import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { getPublishedProjects } from "@/lib/queries";
import { CATEGORY_LABEL } from "@/lib/types";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Galeria completa de projetos residenciais de Mariana Alcântara. Apartamentos, quartos, cozinhas e ambientes sob medida.",
};

export default async function ProjetosPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      {/* Header */}
      <section className="container pt-28 sm:pt-40 lg:pt-48 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 sm:gap-12 lg:gap-20 items-end">
          <Reveal>
            <p className="eyebrow">Portfólio</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="font-display text-fluid-hero leading-[1.05] sm:leading-[0.95] text-balance">
              Projetos
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-ink/70 max-w-2xl leading-relaxed">
              Espaços que refletem essência e estilo de vida, criados sob medida
              para as necessidades de cada cliente.
            </p>
          </Reveal>
        </div>

        <div className="hairline mt-12 sm:mt-20" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 text-center max-w-2xl mx-auto">
          {[
            { value: "+1000", label: "Ambientes" },
            { value: "+600", label: "Projetos" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl whitespace-nowrap">
                {s.value}
              </p>
              <p className="eyebrow mt-1.5 sm:mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="container pb-20 sm:pb-28 lg:pb-40">
        {projects.length === 0 ? (
          <p className="text-center text-ink/60 py-32">
            Em breve, novos projetos por aqui.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-12 sm:gap-y-16 lg:gap-y-24">
            {projects.map((project, i) => {
              return (
                <Reveal key={project.id} delay={(i % 2) * 0.1}>
                  <Link
                    href={`/projetos/${project.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                      {project.cover_url && (
                        <Image
                          src={project.cover_url}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-[1.4s] ease-smooth group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </div>
                    <div className="mt-4 sm:mt-6 flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <p className="eyebrow">
                          {CATEGORY_LABEL[
                            project.category as keyof typeof CATEGORY_LABEL
                          ] ?? project.category}
                        </p>
                        <h2 className="font-display text-xl sm:text-2xl lg:text-3xl mt-2 truncate">
                          {project.title}
                        </h2>
                      </div>
                      <ArrowUpRight
                        size={22}
                        strokeWidth={1.4}
                        className="shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
