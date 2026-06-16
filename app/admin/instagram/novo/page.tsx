import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InstagramForm } from "@/components/admin/InstagramForm";

export default function NovoInstagramPage() {
  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-3xl">
      <Link
        href="/admin/instagram"
        className="inline-flex items-center gap-2 eyebrow link-underline mb-6 sm:mb-8 py-2"
      >
        <ArrowLeft size={14} />
        Voltar para Instagram
      </Link>

      <p className="eyebrow">Novo</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-3 mb-3">
        Adicionar destaque
      </h1>
      <p className="text-ink/60 mb-8 sm:mb-12">
        Cole a URL do post e pronto. O resto é com a gente.
      </p>

      <div className="bg-bone border border-walnut/15 p-5 sm:p-8 lg:p-10">
        <InstagramForm />
      </div>

      <div className="bg-stone-100/60 border border-walnut/15 p-5 sm:p-6 mt-6 text-sm text-ink/70 space-y-2">
        <p className="font-medium text-ink">Como pegar a URL no Instagram:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Abra o post, reel ou IGTV no Instagram</li>
          <li>Toque nos três pontinhos (...) e escolha "Copiar link"</li>
          <li>Cola aqui em cima e clica em "Adicionar destaque"</li>
        </ol>
      </div>
    </div>
  );
}
