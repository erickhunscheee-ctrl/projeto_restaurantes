import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "./edit-profile-form";

export default async function EditarPerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("nome,telefone").eq("id", user.id).maybeSingle();

  return <main className="flex flex-1 flex-col">
    <header className="flex items-center gap-3 border-b border-border px-5 py-[18px]">
      <Link href="/perfil" aria-label="Voltar"><ArrowLeft size={19} /></Link>
      <h1 className="text-base font-medium">Editar perfil</h1>
    </header>
    <EditProfileForm userId={user.id} initialName={profile?.nome ?? ""} phone={profile?.telefone ?? user.phone ?? ""} />
  </main>;
}
