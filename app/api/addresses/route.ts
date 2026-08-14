import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user-auth";
import { apiError } from "@/lib/api-response";
import { object, requiredString } from "@/lib/contracts/validation";

export async function POST(request: Request) {
  const context = await requireUser(); if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  try {
    const body = object(await request.json());
    const { data, error } = await context.supabase.from("addresses").insert({ user_id: context.user.id, rotulo: requiredString(body.rotulo, "o rótulo"), endereco: requiredString(body.endereco, "o endereço"), padrao: body.padrao !== false, cep: body.cep || null, rua: body.rua || null, numero: body.numero || null, complemento: body.complemento || null, bairro: body.bairro || null, cidade: body.cidade || null, estado: body.estado || null, latitude: body.latitude ?? null, longitude: body.longitude ?? null }).select().single();
    if (error) throw new Error(error.message); return NextResponse.json({ address: data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
