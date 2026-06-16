import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (err) {
    // Nunca derrubar a página inteira por falha do middleware.
    console.error("[middleware]", err);
    return NextResponse.next({ request });
  }
}

export const config = {
  // Só roda no admin. As outras rotas não precisam de sessão Supabase no Edge.
  matcher: ["/admin/:path*"],
};
