import Link from "next/link";
import { ArrowLeft, Quote, Star } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import {
  GOOGLE_RATING,
  GOOGLE_REVIEW_LINK,
  TESTIMONIALS,
} from "@/lib/testimonials";
import { WHATSAPP_LINK } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avaliações",
  description: `${GOOGLE_RATING.total} clientes avaliaram o escritório Mariana Alcântara no Google com nota ${GOOGLE_RATING.average.toFixed(1)}. Leia o que dizem.`,
};

export default function AvaliacoesPage() {
  return (
    <>
      {/* Header */}
      <section className="container pt-28 sm:pt-40 lg:pt-48 pb-12 sm:pb-20">
        <Reveal>
          <Link
            href="/"
            className="inline-flex items-center gap-2 eyebrow link-underline mb-8 py-2"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Voltar ao início
          </Link>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 sm:gap-12 lg:gap-20 items-end">
          <Reveal>
            <p className="eyebrow">Palavra de quem viveu</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="font-display text-fluid-hero leading-[1.05] sm:leading-[0.95] text-balance">
              Avaliações
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-ink/70 max-w-2xl leading-relaxed">
              Todas as histórias dos clientes do escritório, publicadas no
              Google Business Profile.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.3}>
          <div className="hairline mt-12 sm:mt-20" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-8 sm:mt-10">
            <div className="flex items-center gap-4">
              <span className="font-display text-5xl sm:text-6xl">
                {GOOGLE_RATING.average.toFixed(1).replace(".", ",")}
              </span>
              <div>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      strokeWidth={0}
                      fill="currentColor"
                      className="text-clay"
                    />
                  ))}
                </span>
                <p className="eyebrow mt-2">
                  {GOOGLE_RATING.total} avaliações no Google
                </p>
              </div>
            </div>
            <a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost self-start"
            >
              Avaliar no Google
            </a>
          </div>
        </Reveal>
      </section>

      {/* Grid de avaliações */}
      <section className="container pb-20 sm:pb-28 lg:pb-40">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.author + i} delay={(i % 3) * 0.05}>
              <figure className="bg-bone p-6 sm:p-8 border border-walnut/15 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        strokeWidth={0}
                        fill="currentColor"
                        className="text-clay"
                      />
                    ))}
                  </span>
                  <Quote
                    size={20}
                    strokeWidth={1}
                    className="text-clay/60 -scale-x-100"
                  />
                </div>
                <blockquote className="text-ink/80 leading-relaxed flex-1 text-[0.95rem]">
                  {t.text}
                </blockquote>
                <figcaption className="mt-5 sm:mt-6 pt-4 border-t border-walnut/10">
                  <p className="font-medium text-sm">
                    {t.author}
                    {t.isLocalGuide && (
                      <span className="ml-2 text-[0.65rem] uppercase tracking-ultra-wide text-walnut/60">
                        · Local Guide
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">{t.date}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20 sm:pb-28">
        <Reveal>
          <div className="bg-wine text-bone px-6 sm:px-8 lg:px-16 py-12 sm:py-16 lg:py-24 text-center">
            <p className="eyebrow text-bone/70">Sua história começa aqui</p>
            <h2 className="font-display text-fluid-h1 mt-4 sm:mt-6 leading-[1.1] md:leading-[1.05] text-balance">
              Pronta para o seu projeto
              <br />
              <em className="italic font-light">virar uma destas histórias?</em>
            </h2>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-bone text-wine px-7 sm:px-8 py-4 sm:py-5 mt-8 sm:mt-10 text-sm uppercase tracking-ultra-wide min-h-[48px] transition-all duration-300 hover:bg-wine-deep hover:text-bone"
            >
              Falar com Mariana
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
