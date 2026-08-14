import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user-auth";
import { apiError } from "@/lib/api-response";
import { object, requiredString } from "@/lib/contracts/validation";

export async function GET() {
  const context = await requireUser(); if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { data, error } = await context.supabase.from("orders").select("*").eq("user_id", context.user.id).order("criado_em", { ascending: false });
  if (error) return apiError(error); return NextResponse.json({ orders: data ?? [] });
}

export async function POST(request: Request) {
  const context = await requireUser(); if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  try {
    const body = object(await request.json());
    const { data: address } = await context.supabase.from("addresses").select("endereco").eq("user_id", context.user.id).eq("padrao", true).maybeSingle();
    if (!address?.endereco) return NextResponse.json({ error: "Cadastre um endereço de entrega.", code: "address_required" }, { status: 409 });
    const { data: order, error } = await context.supabase.from("orders").insert({ user_id: context.user.id, establishment_id: requiredString(body.establishment_id, "o restaurante"), endereco_entrega: address.endereco, forma_pagamento: "pix", subtotal: 0, taxa_entrega: 0, total: 0 }).select().single();
    if (error || !order) throw new Error(error?.message ?? "Não foi possível criar o pedido.");
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) throw new Error("O pedido está vazio.");
    const { error: itemsError } = await context.supabase.from("order_items").insert(items.map((item) => { const value = object(item); return { order_id: order.id, dish_id: requiredString(value.dish_id, "o prato"), quantidade: Number(value.quantidade), opcoes_selecionadas: value.opcoes_selecionadas ?? [], observacoes: value.observacoes || null, preco_unitario: 0 }; }));
    if (itemsError) throw new Error(itemsError.message);
    const { data: completed } = await context.supabase.from("orders").select("*").eq("id", order.id).single();
    return NextResponse.json({ order: completed ?? order }, { status: 201 });
  } catch (error) { return apiError(error); }
}
