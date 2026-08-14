import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeWhatsAppPhone } from "@/lib/restaurant-auth";
import { callWhatsAppApi } from "@/lib/whatsapp-api";

type Client = SupabaseClient<any, any, any>;
export type WhatsAppEstablishment = { id: string; nome: string; whatsapp_telefone?: string | null };

export async function findWhatsAppEstablishment(client: Client, id: string) {
  const { data, error } = await client.from("establishments").select("id,nome,whatsapp_telefone").eq("id", id).maybeSingle();
  if (error || !data) throw new Error("Restaurante não encontrado.");
  return data as WhatsAppEstablishment;
}

export async function getWhatsAppSession(establishment: WhatsAppEstablishment) {
  if (!establishment.whatsapp_telefone) return null;
  return callWhatsAppApi(`/sessoes/${encodeURIComponent(establishment.whatsapp_telefone)}/status`);
}

export async function createWhatsAppSession(client: Client, establishment: WhatsAppEstablishment, rawPhone: unknown) {
  const phone = normalizeWhatsAppPhone(String(rawPhone ?? ""));
  const response = await callWhatsAppApi("/sessoes", { method: "POST", body: JSON.stringify({ telefone: phone, nome_label: establishment.nome }) });
  if (response.ok || response.status === 409) {
    const { error } = await client.from("establishments").update({ whatsapp_telefone: phone }).eq("id", establishment.id);
    if (error) throw new Error(error.message);
  }
  return response;
}

export async function reconnectWhatsAppSession(establishment: WhatsAppEstablishment) {
  if (!establishment.whatsapp_telefone) throw new Error("Crie a sessão primeiro.");
  return callWhatsAppApi(`/sessoes/${encodeURIComponent(establishment.whatsapp_telefone)}/reconectar`, { method: "POST" });
}

export async function getWhatsAppQrCode(establishment: WhatsAppEstablishment) {
  if (!establishment.whatsapp_telefone) throw new Error("Crie a sessão primeiro.");
  return callWhatsAppApi(`/sessoes/${encodeURIComponent(establishment.whatsapp_telefone)}/qrcode`);
}

export async function removeWhatsAppSession(client: Client, establishment: WhatsAppEstablishment) {
  if (!establishment.whatsapp_telefone) return null;
  const response = await callWhatsAppApi(`/sessoes/${encodeURIComponent(establishment.whatsapp_telefone)}`, { method: "DELETE" });
  if (response.ok || response.status === 404) {
    const { error } = await client.from("establishments").update({ whatsapp_telefone: null }).eq("id", establishment.id);
    if (error) throw new Error(error.message);
  }
  return response;
}
