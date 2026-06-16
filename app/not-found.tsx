import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[80svh] grid place-items-center px-6">
        <div className="text-center max-w-md">
          <p className="eyebrow">Erro 404</p>
          <h1 className="font-display text-6xl mt-4 leading-none">
            Página
            <br />
            <em className="italic font-light">não encontrada.</em>
          </h1>
          <p className="text-ink/60 mt-6">
            O endereço que você procurou não existe ou foi movido.
          </p>
          <Link href="/" className="btn-primary mt-10 inline-flex">
            Voltar para o início
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
