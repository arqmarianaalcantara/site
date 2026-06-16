import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Quote, Star } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import { getPublishedProjects } from "@/lib/queries";
import { CATEGORY_LABEL } from "@/lib/types";
import { WHATSAPP_LINK } from "@/lib/utils";
import {
  GOOGLE_RATING,
  GOOGLE_REVIEW_LINK,
  TESTIMONIALS as ALL_TESTIMONIALS,
} from "@/lib/testimonials";

export const revalidate = 60;

const TESTIMONIALS = ALL_TESTIMONIALS.slice(0, 6);

const SERVICES = [
  {
    number: "01",
    title: "Projetos residenciais",
    text: "Desenhamos seu espaço sob medida para o seu estilo de vida, com soluções pensadas detalhe por detalhe.",
  },
  {
    number: "02",
    title: "Ambientação",
    text: "Curadoria estratégica de móveis, materiais e objetos para criar ambientes com identidade, conforto e significado.",
  },
  {
    number: "03",
    title: "Gestão de obras",
    text: "Acompanhamento completo, da escolha dos fornecedores ao resultado final, com rigor em prazos e orçamento.",
  },
  {
    number: "04",
    title: "Reformas",
    text: "Transformamos seu espaço com planejamento preciso, extraindo o melhor da estrutura existente.",
  },
];

export default async function HomePage() {
  const projects = await getPublishedProjects();
  const featured = projects.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-end pb-16 sm:pb-20 lg:pb-32 pt-28 sm:pt-32">
        {featured[0]?.cover_url && (
          <Image
            src={featured[0].cover_url}
            alt=""
            fill
            priority
            className="object-cover -z-10"
            sizes="100vw"
          />
        )}
        {!featured[0]?.cover_url && (
          <div className="absolute inset-0 -z-10 bg-stone-100" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bone/30 via-transparent to-ink/70" />

        <div className="container">
          <Reveal>
            <p className="eyebrow text-bone/90 mb-4 sm:mb-6">
              Escritório de arquitetura · Aracaju, SE
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="font-display text-fluid-hero text-bone leading-[1.05] sm:leading-[0.95] tracking-ultra-tight max-w-5xl text-balance">
              Espaços pensados
              <br />
              <em className="italic font-light">com propósito.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:items-center">
              <Link
                href="/projetos"
                className="inline-flex items-center justify-center sm:justify-start gap-3 bg-bone text-ink px-6 sm:px-7 py-3.5 sm:py-4 text-sm uppercase tracking-ultra-wide min-h-[48px] transition-all duration-300 hover:bg-clay sm:hover:px-8"
              >
                Ver projetos
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center sm:justify-start gap-3 text-bone text-sm uppercase tracking-ultra-wide border border-bone/40 sm:border-0 sm:border-b py-3.5 sm:py-0 sm:pb-3 min-h-[48px] sm:min-h-0 hover:border-bone transition-colors"
              >
                Iniciar uma conversa
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Marquee */}
      <Marquee
        items={[
          "Estética",
          "Conforto",
          "Propósito",
          "Acolhimento",
          "Funcionalidade",
        ]}
      />

      {/* Intro / mission */}
      <section className="container py-20 sm:py-28 lg:py-40">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-28 items-start">
          <Reveal>
            <p className="eyebrow">Manifesto</p>
            <p className="mt-4 sm:mt-6 font-display text-xs italic text-walnut/70">
              02 / 24
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="font-display text-fluid-h1 leading-[1.1] md:leading-[1.05] text-balance">
              Arquitetura que escuta antes de propor. Que enxerga o ritmo da
              casa, a luz que entra pela manhã, o gesto que se repete no fim do
              dia.
            </h2>
            <p className="mt-6 sm:mt-10 text-base sm:text-lg text-ink/70 max-w-prose">
              No escritório, cada projeto começa por uma conversa franca. Daí
              nasce uma arquitetura honesta, com materiais reais, proporções
              equilibradas e a leveza de quem sabe o que tirar.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured projects */}
      <section className="container pb-16 sm:pb-20">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <p className="eyebrow">Projetos selecionados</p>
              <h2 className="font-display text-fluid-h1 mt-3 sm:mt-4 leading-[1.1] md:leading-[1.05]">
                Trabalhos recentes
              </h2>
            </div>
            <Link
              href="/projetos"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-ultra-wide link-underline self-start"
            >
              Ver todos os projetos
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-x-8 md:gap-y-16 lg:gap-12">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.1}>
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
                      {CATEGORY_LABEL[project.category as keyof typeof CATEGORY_LABEL] ?? project.category}
                    </p>
                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl mt-2 truncate">
                      {project.title}
                    </h3>
                  </div>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.4}
                    className="shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-stone-100/60 py-20 sm:py-28 lg:py-40 mt-16 sm:mt-20">
        <div className="container">
          <Reveal>
            <p className="eyebrow text-center">Escritório</p>
            <h2 className="font-display text-fluid-h1 text-center mt-3 sm:mt-4 max-w-3xl mx-auto text-balance leading-[1.1] md:leading-[1.05]">
              Quatro serviços, uma só forma de fazer.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-x-10 lg:gap-x-12 gap-y-10 sm:gap-y-12 md:gap-y-16 mt-12 sm:mt-16 lg:mt-20 max-w-5xl mx-auto">
            {SERVICES.map((service, i) => (
              <Reveal key={service.number} delay={i * 0.08}>
                <div className="flex gap-4 sm:gap-6">
                  <span className="font-display text-xl sm:text-2xl text-walnut/50 italic shrink-0">
                    {service.number}
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl">{service.title}</h3>
                    <p className="mt-2 sm:mt-3 text-ink/70 max-w-md">{service.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="container py-20 sm:py-28 lg:py-40">
        <div className="grid grid-cols-2 divide-x divide-walnut/15 max-w-3xl mx-auto">
          {[
            { value: "+1000", label: "Ambientes entregues" },
            { value: "+600", label: "Projetos realizados" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="px-4 sm:px-8 md:px-12 first:pl-0 last:pr-0 text-center">
                <p className="font-display text-4xl sm:text-5xl lg:text-fluid-h1 leading-none">
                  {stat.value}
                </p>
                <p className="eyebrow mt-3 sm:mt-4">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container pb-20 sm:pb-28 lg:pb-40">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-16">
            <div>
              <p className="eyebrow">Palavra de quem viveu</p>
              <h2 className="font-display text-fluid-h1 mt-3 sm:mt-4 max-w-2xl text-balance leading-[1.1] md:leading-[1.05]">
                Histórias dos clientes
                <br />
                do escritório.
              </h2>
            </div>
            <a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 self-start border border-walnut/30 px-5 py-3 hover:bg-ink hover:text-bone hover:border-ink transition-colors"
            >
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    strokeWidth={0}
                    fill="currentColor"
                    className="text-clay"
                  />
                ))}
              </span>
              <span className="text-sm">
                <strong className="font-medium">{GOOGLE_RATING.average.toFixed(1).replace(".", ",")}</strong>
                <span className="text-ink/60 ml-1 group-hover:text-bone/70">
                  · {GOOGLE_RATING.total} avaliações no Google
                </span>
              </span>
            </a>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.author} delay={i * 0.08}>
              <figure className="bg-bone p-7 sm:p-10 border border-walnut/15 h-full flex flex-col">
                <Quote
                  size={28}
                  strokeWidth={1}
                  className="text-clay mb-4 sm:mb-6 -scale-x-100"
                />
                <blockquote className="text-ink/80 leading-relaxed flex-1 text-[0.95rem] sm:text-base">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 sm:mt-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow text-walnut">{t.author}</p>
                    <p className="text-[0.7rem] text-ink/40 mt-1">{t.date}</p>
                  </div>
                  <span className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={11}
                        strokeWidth={0}
                        fill="currentColor"
                        className="text-clay"
                      />
                    ))}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 sm:mt-14 text-center">
            <Link
              href="/avaliacoes"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-ultra-wide link-underline"
            >
              Ver todas as 22 avaliações
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container pb-20 sm:pb-28">
        <Reveal>
          <div className="bg-ink text-bone px-6 sm:px-8 lg:px-20 py-14 sm:py-20 lg:py-32 text-center">
            <p className="eyebrow text-clay">Vamos começar?</p>
            <h2 className="font-display text-fluid-hero mt-4 sm:mt-6 leading-[1.05] sm:leading-[0.95] text-balance">
              O seu projeto começa
              <br />
              <em className="italic font-light">com uma conversa.</em>
            </h2>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-bone text-ink px-7 sm:px-8 py-4 sm:py-5 mt-8 sm:mt-12 text-sm uppercase tracking-ultra-wide min-h-[48px] transition-all duration-300 hover:bg-clay"
            >
              Solicitar orçamento
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
