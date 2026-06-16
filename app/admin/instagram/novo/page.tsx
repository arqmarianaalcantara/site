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
      <h1 className="font-display text-3xl sm:text-4xl mt-3 mb-8 sm:mb-12">
        Novo destaque do Instagram
      </h1>

      <div className="bg-bone border border-walnut/15 p-5 sm:p-8 lg:p-10">
        <InstagramForm />
      </div>

      <div className="bg-stone-100/60 border border-walnut/15 p-5 sm:p-6 mt-6 text-sm text-ink/70 space-y-2">
        <p className="font-medium text-ink">Como pegar a URL no Instagram:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Abra o post, reel ou IGTV no Instagram</li>
          <li>Toque nos três pontinhos (...) e escolha "Copiar link"</li>
          <li>Volte aqui e cole no campo acima</li>
        </ol>
      </div>
    </div>
  );
}
