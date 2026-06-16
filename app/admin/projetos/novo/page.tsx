import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NovoProjetoPage() {
  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-3xl">
      <Link
        href="/admin/projetos"
        className="inline-flex items-center gap-2 eyebrow link-underline mb-6 sm:mb-8 py-2"
      >
        <ArrowLeft size={14} />
        Voltar para projetos
      </Link>

      <p className="eyebrow">Novo</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-3 mb-8 sm:mb-12">
        Criar projeto
      </h1>

      <div className="bg-bone border border-walnut/15 p-5 sm:p-8 lg:p-10">
        <ProjectForm />
      </div>

      <p className="text-sm text-ink/50 mt-6">
        Depois de criar, você poderá subir as fotos da galeria na próxima tela.
      </p>
    </div>
  );
}
