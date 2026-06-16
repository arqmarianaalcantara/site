"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn, WHATSAPP_LINK } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/projetos", label: "Projetos" },
  { href: "/videos", label: "Vídeos" },
  { href: "/sobre", label: "Sobre" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-smooth",
        scrolled || open
          ? "bg-bone/90 backdrop-blur-md border-b border-walnut/10"
          : "bg-gradient-to-b from-ink/55 via-ink/20 to-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-16 lg:h-24">
        <Link
          href="/"
          className="block relative"
          aria-label="Mariana Alcântara · Arquitetura e Ambientação"
        >
          <Image
            src="/logo.webp"
            alt="Mariana Alcântara · Arquitetura e Ambientação"
            width={1494}
            height={274}
            priority
            className={cn(
              "h-7 sm:h-8 lg:h-10 w-auto transition-[filter] duration-300",
              scrolled || open ? "" : "brightness-0 invert"
            )}
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide transition-colors",
                pathname === link.href
                  ? "text-ink"
                  : "text-ink/60 hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-ultra-wide border border-ink/80 px-5 py-2.5 transition-colors hover:bg-ink hover:text-bone"
          >
            Solicitar orçamento
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden w-11 h-11 grid place-items-center -mr-2"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-walnut/10 bg-bone">
          <nav className="container py-8 flex flex-col gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display text-2xl sm:text-3xl py-1",
                  pathname === link.href ? "text-ink" : "text-ink/40"
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 self-start"
            >
              Solicitar orçamento
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
