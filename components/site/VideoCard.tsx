"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Play, Pause, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Video } from "@/lib/types";

interface Props {
  video: Video;
}

export function VideoCard({ video }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden bg-stone-100 text-left"
      >
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-walnut" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

        <span className="absolute top-4 sm:top-5 right-4 sm:right-5 w-12 h-12 grid place-items-center bg-bone/95 text-ink rounded-full transition-all duration-500 group-hover:bg-clay group-hover:scale-110">
          <Play size={16} strokeWidth={1.5} className="translate-x-0.5" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-bone leading-tight text-balance">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-bone/70 text-sm mt-2 line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && <VideoModal video={video} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 w-12 h-12 grid place-items-center text-bone hover:bg-bone/10 transition-colors"
        aria-label="Fechar"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-[min(94vw,720px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={ref}
          src={video.video_url}
          poster={video.thumbnail_url ?? undefined}
          controls
          autoPlay
          playsInline
          className="w-full max-h-[80svh] object-contain bg-black"
        />
        <button
          type="button"
          onClick={toggle}
          className="hidden sm:inline-flex absolute -bottom-16 left-1/2 -translate-x-1/2 items-center gap-2 text-bone/80 hover:text-bone eyebrow"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? "Pausar" : "Reproduzir"}
        </button>
      </motion.div>
    </motion.div>
  );
}
