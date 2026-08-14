"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MessageCircle, Shapes, Store, UtensilsCrossed } from "lucide-react";

const navigation = [
  { href: "/admin/restaurantes", label: "Restaurantes", icon: Store },
  { href: "/admin/categorias", label: "Categorias", icon: Shapes },
  { href: "/admin/pratos", label: "Pratos", icon: UtensilsCrossed },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-neutral-050">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-neutral-000 md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white"><LayoutGrid size={19} /></span>
          <div><p className="text-sm font-semibold text-neutral-900">Administração</p><p className="text-[11px] text-ink-soft">Painel da plataforma</p></div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? "bg-primary-500 text-white" : "text-neutral-700 hover:bg-neutral-050"}`}><Icon size={18} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="border-t border-border px-5 py-4 text-[11px] text-ink-soft">Marmita Já · Plataforma</div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-neutral-000 md:hidden">
        <div className="flex items-center gap-2 px-4 py-3"><LayoutGrid size={18} className="text-primary-500" /><p className="text-sm font-semibold">Administração</p></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${active ? "bg-primary-500 text-white" : "bg-neutral-050 text-neutral-700"}`}><Icon size={14} />{item.label}</Link>;
          })}
        </nav>
      </header>

      <div className="min-h-full min-w-0 md:ml-64">{children}</div>
    </div>
  );
}
