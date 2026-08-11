import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#][^=]*)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function getOrCreateSeedOwner(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((user) => user.email === email);
  if (existing) return existing.id;

  const created = await supabase.auth.admin.createUser({
    email,
    password: randomUUID() + randomUUID(),
    email_confirm: true,
    user_metadata: { seed_marmita_ja: true },
  });
  if (created.error || !created.data.user) throw created.error ?? new Error("Falha ao criar dono de teste");
  return created.data.user.id;
}

const ownerCantina = await getOrCreateSeedOwner("seed-cantina@marmitaja.local");
const ownerFit = await getOrCreateSeedOwner("seed-fit@marmitaja.local");

const establishments = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    owner_id: ownerCantina,
    nome: "Cantina da Nonna",
    tipo_cozinha: "caseira",
    nota_media: 4.8,
    distancia_km: 1.2,
    horario_abertura: "10:30",
    horario_fechamento: "14:30",
    status: "aberto",
    avatar_iniciais: "CN",
    avatar_cor: "#C0392B",
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    owner_id: ownerFit,
    nome: "Verde & Sabor",
    tipo_cozinha: "fit",
    nota_media: 4.6,
    distancia_km: 2.1,
    horario_abertura: "11:00",
    horario_fechamento: "15:00",
    status: "aberto",
    avatar_iniciais: "VS",
    avatar_cor: "#27500A",
  },
];

const dishes = [
  { id: "11000000-0000-4000-8000-000000000001", establishment_id: establishments[0].id, nome: "Frango da Nonna", preco_base: 24.9, categoria: "Tradicional", disponivel_hoje: true, icone_split: 0.35 },
  { id: "12000000-0000-4000-8000-000000000002", establishment_id: establishments[0].id, nome: "Carne de Panela", preco_base: 29.9, categoria: "Tradicional", disponivel_hoje: true, icone_split: 0.55 },
  { id: "21000000-0000-4000-8000-000000000001", establishment_id: establishments[1].id, nome: "Bowl Fit de Frango", preco_base: 27.9, categoria: "Fit", disponivel_hoje: true, icone_split: 0.45 },
  { id: "22000000-0000-4000-8000-000000000002", establishment_id: establishments[1].id, nome: "Bowl Vegano", preco_base: 25.9, categoria: "Vegano", disponivel_hoje: true, icone_split: 0.7 },
];

const options = [
  ["11100000-0000-4000-8000-000000000001", dishes[0].id, "proteina", "Frango grelhado", 0, 1, 1],
  ["11100000-0000-4000-8000-000000000002", dishes[0].id, "acompanhamento", "Arroz branco", 0, 1, 2],
  ["11100000-0000-4000-8000-000000000003", dishes[0].id, "acompanhamento", "Feijão caseiro", 0, 1, 2],
  ["12100000-0000-4000-8000-000000000001", dishes[1].id, "proteina", "Carne de panela", 0, 1, 1],
  ["12100000-0000-4000-8000-000000000002", dishes[1].id, "acompanhamento", "Purê de batata", 2.5, 1, 2],
  ["12100000-0000-4000-8000-000000000003", dishes[1].id, "extra", "Farofa crocante", 1.5, 0, 2],
  ["21100000-0000-4000-8000-000000000001", dishes[2].id, "proteina", "Frango grelhado", 0, 1, 1],
  ["21100000-0000-4000-8000-000000000002", dishes[2].id, "acompanhamento", "Arroz integral", 0, 1, 2],
  ["21100000-0000-4000-8000-000000000003", dishes[2].id, "extra", "Ovo cozido", 2, 0, 2],
  ["22100000-0000-4000-8000-000000000001", dishes[3].id, "proteina", "Grão-de-bico temperado", 0, 1, 1],
  ["22100000-0000-4000-8000-000000000002", dishes[3].id, "acompanhamento", "Legumes assados", 0, 1, 2],
  ["22100000-0000-4000-8000-000000000003", dishes[3].id, "extra", "Molho verde", 1.5, 0, 2],
].map(([id, dish_id, grupo, nome, preco_adicional, selecao_min, selecao_max], ordem) => ({
  id, dish_id, grupo, nome, preco_adicional, selecao_min, selecao_max, ordem,
}));

for (const [table, rows] of [["establishments", establishments], ["dishes", dishes], ["dish_options", options]]) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
}

console.log("Seed concluído: 2 restaurantes, 4 pratos e 12 opções.");
