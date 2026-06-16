import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VideoForm } from "@/components/admin/VideoForm";

export default function NovoVideoPage() {
  return (
    <div className="p-5 sm:p-8 lg:p-14 max-w-3xl">
      <Link
        href="/admin/videos"
        className="inline-flex items-center gap-2 eyebrow link-underline mb-6 sm:mb-8 py-2"
      >
        <ArrowLeft size={14} />
        Voltar para vídeos
      </Link>

      <p className="eyebrow">Novo</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-3 mb-8 sm:mb-12">
        Publicar vídeo
      </h1>

      <div className="bg-bone border border-walnut/15 p-5 sm:p-8 lg:p-10">
        <VideoForm />
      </div>
    </div>
  );
}
