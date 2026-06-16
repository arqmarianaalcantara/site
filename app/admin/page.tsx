import Link from "next/link";
import { ArrowUpRight, FolderOpen, Instagram, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: videoCount },
    { count: publishedProjects },
    { count: instagramCount },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("instagram_posts")
      .select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-6xl">
      <div className="mb-8 sm:mb-12">
        <p className="eyebrow">Painel</p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3">
          Olá, Mariana.
        </h1>
        <p className="text-ink/60 mt-2 sm:mt-3 text-sm sm:text-base">
          Aqui você cuida de tudo que aparece no seu site.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12">
        <Stat label="Projetos" value={projectCount ?? 0} />
        <Stat label="Publicados" value={publishedProjects ?? 0} />
        <Stat label="Vídeos" value={videoCount ?? 0} />
        <Stat label="Instagram" value={instagramCount ?? 0} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card
          href="/admin/projetos"
          title="Gerenciar projetos"
          description="Adicionar, editar, publicar ou remover projetos. Reordenar a galeria, subir fotos."
          icon={FolderOpen}
        />
        <Card
          href="/admin/videos"
          title="Gerenciar vídeos"
          description="Publicar tours em vídeo dos ambientes finalizados, com capa e descrição."
          icon={Video}
        />
        <Card
          href="/admin/instagram"
          title="Destaques do Instagram"
          description="Escolher quais posts e reels aparecem no site. Até 6 destaques na home."
          icon={Instagram}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-bone border border-walnut/15 p-4 sm:p-6">
      <p className="eyebrow text-[0.65rem] sm:text-[0.7rem]">{label}</p>
      <p className="font-display text-2xl sm:text-4xl mt-2 sm:mt-3">{value}</p>
    </div>
  );
}

function Card({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof FolderOpen;
}) {
  return (
    <Link
      href={href}
      className="group bg-bone border border-walnut/15 p-6 sm:p-8 hover:border-ink transition-colors"
    >
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <Icon size={28} strokeWidth={1.2} className="text-walnut" />
        <ArrowUpRight
          size={20}
          strokeWidth={1.4}
          className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
        />
      </div>
      <h2 className="font-display text-xl sm:text-2xl">{title}</h2>
      <p className="text-ink/60 text-sm mt-2 sm:mt-3 leading-relaxed">{description}</p>
    </Link>
  );
}
