"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/client-api";

export type AdminRestaurant = {
  id: string; nome: string; status: string; telefone?: string | null; cep?: string | null;
  endereco?: string | null; numero?: string | null; complemento?: string | null; bairro?: string | null;
  cidade?: string | null; estado?: string | null; latitude?: number | null; longitude?: number | null;
  whatsapp_telefone?: string | null; establishment_categories?: { category_id: string }[];
};
export type AdminCategory = { id: string; nome: string; slug?: string; image_url: string | null; ordem: number; ativo: boolean };
export type AdminDish = { id: string; nome: string; preco_base: number; categoria: string | null; disponivel_hoje: boolean };

export function useAdminRestaurants() {
  return useQuery({ queryKey: ["admin", "restaurants"], queryFn: async () => (await apiRequest<{ restaurants: AdminRestaurant[] }>("/api/admin/restaurants")).restaurants, staleTime: 30_000 });
}

export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: async () => (await apiRequest<{ categories: AdminCategory[] }>("/api/admin/categories")).categories, staleTime: 30_000 });
}

export function useAdminDishes(establishmentId: string) {
  return useQuery({ queryKey: ["admin", "dishes", establishmentId], queryFn: async () => (await apiRequest<{ dishes: AdminDish[] }>(`/api/admin/dishes?establishment_id=${establishmentId}`)).dishes, enabled: Boolean(establishmentId), staleTime: 15_000 });
}
