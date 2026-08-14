"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function RestaurantLogout() {
  const router = useRouter();
  return <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/restaurante/login"); router.refresh(); }} aria-label="Sair" className="text-ink-soft"><LogOut size={18} /></button>;
}
