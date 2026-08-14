"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Receipt } from "lucide-react";
import { formatBRL } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { BottomNavbar } from "@/components/bottom-navbar";

export default function PedidosPage() {
  const router = useRouter(); const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => { fetch("/api/orders", { cache: "no-store" }).then(async (response) => { if (response.status === 401) { router.replace("/login"); return null; } return response.ok ? response.json() : null; }).then((result) => { if (result) setOrders(result.orders); }); }, [router]);
  return <main className="flex flex-1 flex-col"><header className="flex items-center gap-3 border-b border-border px-5 py-[18px]"><Link href="/perfil"><ArrowLeft size={19} /></Link><h1 className="text-base font-medium">Meus pedidos</h1></header><div className="flex flex-col gap-2.5 px-5 py-5">{orders === null && <p className="py-12 text-center text-sm text-ink-soft">Carregando...</p>}{orders?.length === 0 && <div className="py-12 text-center"><Receipt size={24} className="mx-auto text-ink-faint" /><p className="mt-2 text-sm text-ink-soft">Você ainda não fez pedidos.</p></div>}{orders?.map((order) => <Link key={order.id} href={`/pedidos/${order.id}`} className="flex items-center justify-between rounded-xl border border-border p-3.5"><div><p className="text-[13px] font-medium">Pedido #{order.id.slice(0, 8)}</p><p className="mt-1 text-[11px] capitalize text-ink-soft">{order.status.replace("_", " ")} · {new Date(order.criado_em).toLocaleDateString("pt-BR")}</p></div><span className="flex items-center gap-2 text-[13px] font-medium text-red-dark">{formatBRL(order.total)}<ChevronRight size={16} /></span></Link>)}</div><BottomNavbar /></main>;
}
