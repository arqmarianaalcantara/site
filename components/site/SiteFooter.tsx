import Image from "next/image";
import Link from "next/link";
import { CONTACT, INSTAGRAM_LINK, WHATSAPP_LINK } from "@/lib/utils";
import { Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-bone mt-20 sm:mt-32">
      <div className="container py-16 sm:py-20 lg:py-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-10 lg:gap-20">
          <div className="sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo.webp"
              alt="Mariana Alcântara · Arquitetura e Ambientação"
              width={1494}
              height={274}
              className="h-9 sm:h-10 w-auto brightness-0 invert mb-6 sm:mb-8"
            />
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 sm:mt-4 leading-[1.1] sm:leading-[1.05] text-balance">
              Vamos transformar
              <br />
              o seu espaço.
            </h2>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-6 sm:mt-10 text-sm uppercase tracking-ultra-wide border-b border-clay/60 pb-2 hover:border-bone transition-colors"
            >
              Iniciar uma conversa
            </a>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <p className="eyebrow text-clay">Contato</p>
            <div className="space-y-3 text-bone/80 leading-relaxed text-[0.95rem]">
              <p>
                <a
                  href={`tel:+${CONTACT.phoneRaw}`}
                  className="link-underline inline-block py-1"
                >
                  {CONTACT.phone}
                </a>
              </p>
              <p>{CONTACT.address}</p>
              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 link-underline mt-2 py-1"
              >
                <Instagram size={16} strokeWidth={1.4} />
                @arquiteta.mariana
              </a>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <p className="eyebrow text-clay">Navegação</p>
            <ul className="space-y-2 sm:space-y-3 text-bone/80">
              <li>
                <Link href="/" className="link-underline inline-block py-1">
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/projetos"
                  className="link-underline inline-block py-1"
                >
                  Projetos
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="link-underline inline-block py-1"
                >
                  Vídeos
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="link-underline inline-block py-1"
                >
                  Sobre
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-bone/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs uppercase tracking-ultra-wide text-bone/50">
          <p>© {new Date().getFullYear()} Arquiteta Mariana Alcântara</p>
          <p>Aracaju, Sergipe</p>
        </div>
      </div>
    </footer>
  );
}
