import type { SupabaseClient } from "@supabase/supabase-js";

type Client = SupabaseClient<any, any, any>;

export async function listRestaurants(client: Client) {
  const { data, error } = await client.from("establishments").select("*, establishment_categories(category_id)").order("criado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createRestaurant(client: Client, restaurant: Record<string, unknown>, categoryIds: string[]) {
  const { data, error } = await client.from("establishments").insert(restaurant).select().single();
  if (error) throw new Error(error.message);
  if (categoryIds.length) await replaceRestaurantCategories(client, data.id, categoryIds);
  return data;
}

export async function updateRestaurant(client: Client, id: string, changes: Record<string, unknown>, categoryIds: string[] | null) {
  let restaurant = null;
  if (Object.keys(changes).length) {
    const { data, error } = await client.from("establishments").update(changes).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    restaurant = data;
  }
  if (categoryIds) await replaceRestaurantCategories(client, id, categoryIds);
  return restaurant;
}

export async function deleteRestaurant(client: Client, id: string) {
  const { error } = await client.from("establishments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function replaceRestaurantCategories(client: Client, id: string, categoryIds: string[]) {
  const { error: deleteError } = await client.from("establishment_categories").delete().eq("establishment_id", id);
  if (deleteError) throw new Error(deleteError.message);
  if (!categoryIds.length) return;
  const { error } = await client.from("establishment_categories").insert(categoryIds.map((categoryId) => ({ establishment_id: id, category_id: categoryId })));
  if (error) throw new Error(error.message);
}
