import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, EyeOff } from "lucide-react";
import { getAllProjects } from "@/lib/queries";
import { CATEGORY_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProjetosPage() {
  const projects = await getAllProjects();

  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-3">Projetos</h1>
          <p className="text-ink/60 mt-2 text-sm sm:text-base">
            {projects.length}{" "}
            {projects.length === 1 ? "projeto cadastrado" : "projetos cadastrados"}
          </p>
        </div>
        <Link
          href="/admin/projetos/novo"
          className="inline-flex items-center justify-center gap-2 bg-ink text-bone px-6 py-3.5 text-sm uppercase tracking-ultra-wide min-h-[48px] hover:bg-walnut transition-colors self-start"
        >
          <Plus size={16} />
          Novo projeto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-bone border border-walnut/15 p-10 sm:p-12 text-center">
          <p className="text-ink/60">Nenhum projeto ainda. Crie o primeiro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projetos/${project.id}`}
              className="group bg-bone border border-walnut/15 hover:border-ink transition-colors block"
            >
              <div className="relative aspect-[4/5] bg-stone-100">
                {project.cover_url ? (
                  <Image
                    src={project.cover_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-ink/40 text-sm">
                    Sem capa
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] uppercase tracking-ultra-wide ${
                    project.published
                      ? "bg-bone/95 text-ink"
                      : "bg-ink/80 text-bone"
                  }`}
                >
                  {project.published ? (
                    <>
                      <Eye size={11} />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff size={11} />
                      Oculto
                    </>
                  )}
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <p className="eyebrow text-[0.6rem] sm:text-[0.7rem]">
                  {CATEGORY_LABEL[
                    project.category as keyof typeof CATEGORY_LABEL
                  ] ?? project.category}
                </p>
                <h2 className="font-display text-base sm:text-xl mt-1.5 sm:mt-2 group-hover:text-walnut transition-colors truncate">
                  {project.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
