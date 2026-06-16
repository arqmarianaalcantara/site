import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getProjectById } from "@/lib/queries";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-5xl">
      <Link
        href="/admin/projetos"
        className="inline-flex items-center gap-2 eyebrow link-underline mb-6 sm:mb-8 py-2"
      >
        <ArrowLeft size={14} />
        Voltar para projetos
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="min-w-0">
          <p className="eyebrow">Editar projeto</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3 truncate">
            {project.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/projetos/${project.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-ultra-wide link-underline py-2"
          >
            <ExternalLink size={14} />
            Ver no site
          </Link>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_1.4fr] gap-6 sm:gap-8">
        <section className="bg-bone border border-walnut/15 p-5 sm:p-8 self-start">
          <h2 className="font-display text-xl sm:text-2xl mb-5 sm:mb-6">
            Informações
          </h2>
          <ProjectForm project={project} />
        </section>

        <section className="bg-bone border border-walnut/15 p-5 sm:p-8">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="font-display text-xl sm:text-2xl">Galeria</h2>
            <span className="text-sm text-ink/60">
              {project.images.length}{" "}
              {project.images.length === 1 ? "foto" : "fotos"}
            </span>
          </div>
          <ImageUploader
            projectId={project.id}
            images={project.images}
            currentCover={project.cover_url}
          />
        </section>
      </div>

      <section className="mt-8 sm:mt-12 bg-bone border border-red-700/30 p-5 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl text-red-700">
          Zona perigosa
        </h2>
        <p className="text-sm text-ink/60 mt-2">
          Apagar o projeto remove todas as fotos e não pode ser desfeito.
        </p>
        <div className="mt-5 sm:mt-6">
          <DeleteProjectButton projectId={project.id} title={project.title} />
        </div>
      </section>
    </div>
  );
}
