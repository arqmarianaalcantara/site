"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/actions";

interface Props {
  userEmail: string;
}

const LINKS = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/admin/videos", label: "Vídeos", icon: Video },
];

export function AdminNav({ userEmail }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-ink text-bone hidden lg:flex flex-col z-40">
        <div className="px-6 py-7 border-b border-bone/10">
          <Image
            src="/logo.webp"
            alt="Mariana Alcântara"
            width={1494}
            height={274}
            className="h-8 w-auto brightness-0 invert"
          />
          <p className="eyebrow text-clay/80 mt-3">Painel de gestão</p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                isActive(link.href)
                  ? "bg-bone/10 text-bone"
                  : "text-bone/75 hover:text-bone hover:bg-bone/5"
              )}
            >
              <link.icon size={16} strokeWidth={1.4} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-bone/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-sm text-bone/70 hover:text-bone hover:bg-bone/5 transition-colors"
          >
            <ExternalLink size={16} strokeWidth={1.4} />
            Ver site público
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 text-sm text-bone/70 hover:text-bone hover:bg-bone/5 transition-colors w-full"
            >
              <LogOut size={16} strokeWidth={1.4} />
              Sair
            </button>
          </form>
          <p className="px-4 pt-2 text-[0.7rem] text-bone/40 truncate">
            {userEmail}
          </p>
        </div>
      </aside>

      {/* Top bar (mobile + tablet) */}
      <div className="lg:hidden sticky top-0 z-40 bg-ink text-bone border-b border-bone/10">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt="Mariana Alcântara"
              width={1494}
              height={274}
              className="h-6 w-auto brightness-0 invert"
            />
            <span className="text-[0.6rem] uppercase tracking-ultra-wide text-clay/80 hidden xs:inline">
              · Painel
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 grid place-items-center -mr-2"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-ink/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[min(82vw,320px)] bg-ink text-bone flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 border-b border-bone/10 flex items-start justify-between">
              <div>
                <Image
                  src="/logo.webp"
                  alt="Mariana Alcântara"
                  width={1494}
                  height={274}
                  className="h-7 w-auto brightness-0 invert"
                />
                <p className="eyebrow text-clay/80 mt-3">Painel de gestão</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-10 h-10 grid place-items-center -mr-2"
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 text-base transition-colors",
                    isActive(link.href)
                      ? "bg-bone/10 text-bone"
                      : "text-bone/80 hover:text-bone hover:bg-bone/5"
                  )}
                >
                  <link.icon size={18} strokeWidth={1.4} />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-3 py-3 border-t border-bone/10 space-y-1">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-4 py-3 text-sm text-bone/70 hover:text-bone hover:bg-bone/5 transition-colors"
              >
                <ExternalLink size={16} strokeWidth={1.4} />
                Ver site público
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-bone/70 hover:text-bone hover:bg-bone/5 transition-colors w-full"
                >
                  <LogOut size={16} strokeWidth={1.4} />
                  Sair
                </button>
              </form>
              <p className="px-4 pt-2 pb-1 text-[0.7rem] text-bone/40 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
