import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-100/40">
      {user && <AdminNav userEmail={user.email ?? ""} />}
      <div className={user ? "lg:pl-64" : ""}>{children}</div>
    </div>
  );
}
