import type { SupabaseClient } from "@supabase/supabase-js";

type Client = SupabaseClient<any, any, any>;
type DishCreate = { establishment_id: string; nome: string; preco_base: number; categoria: string | null; disponivel_hoje: boolean };
type OptionInput = { grupo: string; nome: string; preco_adicional: number; selecao_min: number; selecao_max: number; ordem: number };

export async function listDishes(client: Client, establishmentId?: string | null) {
  const query = client.from("dishes").select("*, dish_options(*)").order("criado_em", { ascending: false });
  const { data, error } = establishmentId ? await query.eq("establishment_id", establishmentId) : await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDish(client: Client, input: DishCreate) {
  const { data, error } = await client.from("dishes").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDish(client: Client, id: string, changes: Record<string, unknown>, establishmentId?: string) {
  let query = client.from("dishes").update(changes).eq("id", id);
  if (establishmentId) query = query.eq("establishment_id", establishmentId);
  const { data, error } = await query.select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDish(client: Client, id: string, establishmentId?: string) {
  let query = client.from("dishes").delete().eq("id", id);
  if (establishmentId) query = query.eq("establishment_id", establishmentId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

async function requireOwnedDish(client: Client, dishId: string, establishmentId: string) {
  const { data, error } = await client.from("dishes").select("id").eq("id", dishId).eq("establishment_id", establishmentId).maybeSingle();
  if (error || !data) throw new Error("Prato não encontrado.");
}

export async function createDishOption(client: Client, dishId: string, input: OptionInput, establishmentId?: string) {
  if (establishmentId) await requireOwnedDish(client, dishId, establishmentId);
  const { data, error } = await client.from("dish_options").insert({ dish_id: dishId, ...input }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDishOption(client: Client, id: string, input: OptionInput, establishmentId?: string) {
  if (establishmentId) {
    const { data } = await client.from("dish_options").select("dish_id").eq("id", id).maybeSingle();
    if (!data) throw new Error("Componente não encontrado.");
    await requireOwnedDish(client, data.dish_id, establishmentId);
  }
  const { data, error } = await client.from("dish_options").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDishOption(client: Client, id: string, establishmentId?: string) {
  if (establishmentId) {
    const { data } = await client.from("dish_options").select("dish_id").eq("id", id).maybeSingle();
    if (!data) throw new Error("Componente não encontrado.");
    await requireOwnedDish(client, data.dish_id, establishmentId);
  }
  const { error } = await client.from("dish_options").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
