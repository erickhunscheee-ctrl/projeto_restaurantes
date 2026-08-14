import { createClient } from "@/lib/supabase/server";

export async function requireRestaurant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: establishment } = await supabase
    .from("establishments")
    .select("id,nome,telefone,whatsapp_telefone,owner_id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!establishment) return null;
  return { supabase, user, establishment };
}

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 13 || !digits.startsWith("55")) {
    throw new Error("Informe o telefone com DDI 55 e DDD.");
  }
  return digits;
}
