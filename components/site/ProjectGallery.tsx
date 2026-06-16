"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProjectImage } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  images: ProjectImage[];
}

export function ProjectGallery({ images }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () =>
      setActive((i) =>
        i === null ? null : (i - 1 + images.length) % images.length
      ),
    [images.length]
  );

  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, next, prev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <p className="text-center text-ink/50 py-20">
        As fotos deste projeto serão publicadas em breve.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 lg:gap-4">
        {images.map((img, i) => {
          const mobileSpan =
            i % 5 === 0 ? "col-span-2 aspect-[4/3]" : "col-span-1 aspect-square";
          const desktopSpan =
            i % 7 === 0
              ? "md:col-span-12 md:aspect-[16/9]"
              : i % 7 === 1
                ? "md:col-span-7 md:aspect-[4/3]"
                : i % 7 === 2
                  ? "md:col-span-5 md:aspect-[3/4]"
                  : i % 7 === 3
                    ? "md:col-span-6 md:aspect-[4/5]"
                    : i % 7 === 4
                      ? "md:col-span-6 md:aspect-[4/5]"
                      : i % 7 === 5
                        ? "md:col-span-5 md:aspect-[3/4]"
                        : "md:col-span-7 md:aspect-[4/3]";

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative overflow-hidden bg-stone-100 group ${mobileSpan} ${desktopSpan}`}
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 50vw"
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center touch-pan-y"
            onClick={close}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 w-12 h-12 grid place-items-center text-bone hover:bg-bone/10 transition-colors z-10"
              aria-label="Fechar"
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="hidden sm:grid absolute left-3 lg:left-8 w-12 h-12 place-items-center text-bone hover:bg-bone/10 transition-colors z-10"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={28} strokeWidth={1.2} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="hidden sm:grid absolute right-3 lg:right-8 w-12 h-12 place-items-center text-bone hover:bg-bone/10 transition-colors z-10"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={28} strokeWidth={1.2} />
            </button>

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[min(96vw,1400px)] h-[min(80svh,900px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[active].url}
                alt={images[active].alt || ""}
                fill
                className="object-contain"
                sizes="96vw"
                priority
              />
            </motion.div>

            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-bone/70 eyebrow flex items-center gap-3 sm:hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="w-10 h-10 grid place-items-center text-bone hover:bg-bone/10"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={22} strokeWidth={1.4} />
              </button>
              <span>
                {active + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="w-10 h-10 grid place-items-center text-bone hover:bg-bone/10"
                aria-label="Próxima imagem"
              >
                <ChevronRight size={22} strokeWidth={1.4} />
              </button>
            </div>
            <div className="hidden sm:block absolute bottom-6 left-1/2 -translate-x-1/2 text-bone/70 eyebrow">
              {active + 1} de {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
