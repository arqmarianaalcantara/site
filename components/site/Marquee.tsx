"use client";

interface MarqueeProps {
  items: string[];
}

export function Marquee({ items }: MarqueeProps) {
  const repeated = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-walnut/15 py-4 sm:py-6 bg-stone-100/40">
      <div className="flex gap-10 sm:gap-16 animate-marquee whitespace-nowrap will-change-transform">
        {repeated.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-lg sm:text-xl md:text-2xl text-walnut/70 italic"
          >
            {item}
            <span className="ml-10 sm:ml-16 text-clay/60">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
