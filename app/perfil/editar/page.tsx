"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditProfileForm } from "./edit-profile-form";

export default function EditarPerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ nome: string; telefone: string | null } | null>(null);
  useEffect(() => { fetch("/api/profile", { cache: "no-store" }).then(async (response) => { if (response.status === 401) { router.replace("/login"); return null; } return response.ok ? response.json() : null; }).then((result) => setProfile(result?.profile ?? null)); }, [router]);
  return <main className="flex flex-1 flex-col"><header className="flex items-center gap-3 border-b border-border px-5 py-[18px]"><Link href="/perfil" aria-label="Voltar"><ArrowLeft size={19} /></Link><h1 className="text-base font-medium">Editar perfil</h1></header>{profile ? <EditProfileForm initialName={profile.nome} phone={profile.telefone ?? ""} /> : <p className="p-5 text-sm text-ink-soft">Carregando...</p>}</main>;
}
