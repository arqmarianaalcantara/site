import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { WHATSAPP_LINK } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça Mariana Alcântara, arquiteta e ambientadora. Escritório baseado em Aracaju com projetos em todo o Brasil.",
};

const PRINCIPLES = [
  {
    number: "I.",
    title: "Escuta antes de proposta",
    text: "Cada projeto começa por uma conversa franca sobre quem habita, como vive e o que espera do espaço.",
  },
  {
    number: "II.",
    title: "Materiais honestos",
    text: "Madeira, linho, pedra. Texturas reais que envelhecem bem e contam histórias com o tempo.",
  },
  {
    number: "III.",
    title: "Detalhe é o projeto",
    text: "Pegas, ângulos, juntas. O encanto está no nível milimétrico, e é ali que Mariana investe atenção.",
  },
  {
    number: "IV.",
    title: "Acompanhamento integral",
    text: "Da prancha aos últimos retoques. A presença em obra garante que o resultado entregue se pareça com o resultado prometido.",
  },
];

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="container pt-28 sm:pt-40 lg:pt-48 pb-12 sm:pb-20">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 sm:gap-12 lg:gap-20 items-end">
          <Reveal>
            <p className="eyebrow">Quem está por trás</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="font-display text-fluid-hero leading-[1.05] sm:leading-[0.95] text-balance">
              Mariana <em className="italic font-light">Alcântara</em>
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-ink/70 max-w-2xl leading-relaxed">
              Objetiva, eficiente e atenta a cada detalhe. Transforma espaços em
              lugares acolhedores, magnéticos e funcionais.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Portrait + biography */}
      <section className="container pb-20 sm:pb-28 lg:pb-40">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-12 lg:gap-20 items-start">
          <Reveal>
            <div className="relative aspect-[4/5] bg-stone-100">
              <Image
                src="/sobre.webp"
                alt="Retrato de Mariana Alcântara"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="lg:sticky lg:top-32 space-y-5 sm:space-y-7">
              <p className="font-display text-xl sm:text-2xl lg:text-3xl text-balance leading-[1.25]">
                Com olhar apurado, ela acompanha de perto todas as etapas dos
                projetos, garantindo rigor em cada detalhe.
              </p>
              <p className="text-ink/70 leading-relaxed">
                Seu interesse genuíno pelas pessoas, aliado à escuta atenta e à
                paixão por ambientação, resulta em escolhas personalizadas que
                revelam o melhor que a arquitetura pode oferecer.
              </p>
              <p className="text-ink/70 leading-relaxed">
                O escritório une experiência técnica a atendimento próximo. Uma
                combinação que inspira confiança e se reflete na qualidade dos
                resultados entregues.
              </p>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 sm:mt-6"
              >
                Conversar com Mariana
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-stone-100/60 py-20 sm:py-28 lg:py-40">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Princípios do escritório</p>
            <h2 className="font-display text-fluid-h1 mt-3 sm:mt-4 max-w-3xl text-balance leading-[1.1] md:leading-[1.05]">
              Quatro convicções que guiam cada projeto.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10 sm:gap-y-12 md:gap-y-20 mt-12 sm:mt-16 lg:mt-20 max-w-5xl">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.number} delay={i * 0.08}>
                <div className="flex gap-4 sm:gap-6">
                  <span className="font-display text-xl sm:text-2xl italic text-walnut/60 shrink-0">
                    {p.number}
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl">{p.title}</h3>
                    <p className="mt-2 sm:mt-3 text-ink/70 leading-relaxed">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing quote */}
      <section className="container py-20 sm:py-28 lg:py-40">
        <Reveal>
          <blockquote className="font-display text-2xl sm:text-4xl lg:text-fluid-h1 leading-[1.2] sm:leading-[1.15] text-center max-w-4xl mx-auto text-balance italic font-light px-2">
            "Quando o espaço entende quem vive nele, tudo o que está dentro
            ganha um lugar certo."
          </blockquote>
          <p className="text-center eyebrow mt-6 sm:mt-10 text-walnut">
            Mariana Alcântara
          </p>
        </Reveal>
      </section>
    </>
  );
}
