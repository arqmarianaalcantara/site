"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", {
        description: "Verifique seu email e senha.",
      });
      return;
    }
    const next = search.get("next") ?? "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-[100svh] grid place-items-center px-5 py-10 bg-stone-100/40">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-12">
          <Image
            src="/logo.webp"
            alt="Mariana Alcântara · Arquitetura e Ambientação"
            width={1494}
            height={274}
            priority
            className="h-10 sm:h-12 w-auto mx-auto"
          />
          <p className="eyebrow text-walnut/70 mt-5 sm:mt-6">Painel de gestão</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bone p-6 sm:p-10 border border-walnut/15 space-y-5 sm:space-y-6"
        >
          <div>
            <label htmlFor="email" className="eyebrow block mb-3">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border border-walnut/20 bg-bone text-ink min-h-[48px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="eyebrow block mb-3">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-walnut/20 bg-bone text-ink min-h-[48px] focus:outline-none focus:border-ink transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-bone py-4 text-sm uppercase tracking-ultra-wide min-h-[52px] transition-colors hover:bg-walnut disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-ink/50 mt-6">
          Acesso restrito ao escritório.
        </p>
      </div>
    </div>
  );
}
