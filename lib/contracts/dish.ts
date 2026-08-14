import { integer, nonNegativeNumber, object, optionalString, requiredString } from "./validation";

export function parseDishCreate(value: unknown, establishmentId?: string) {
  const body = object(value);
  return {
    establishment_id: establishmentId ?? requiredString(body.establishment_id, "o restaurante"),
    nome: requiredString(body.nome, "o nome do prato"),
    preco_base: nonNegativeNumber(body.preco_base, "Preço"),
    categoria: optionalString(body.categoria) ?? null,
    disponivel_hoje: body.disponivel_hoje !== false,
  };
}

export function parseDishUpdate(value: unknown) {
  const body = object(value);
  const changes: Record<string, unknown> = {};
  if (body.nome !== undefined) changes.nome = requiredString(body.nome, "o nome do prato");
  if (body.preco_base !== undefined) changes.preco_base = nonNegativeNumber(body.preco_base, "Preço");
  if (body.categoria !== undefined) changes.categoria = optionalString(body.categoria) ?? null;
  if (body.disponivel_hoje !== undefined) changes.disponivel_hoje = Boolean(body.disponivel_hoje);
  return { id: requiredString(body.id, "o prato"), changes };
}

export function parseDishOption(value: unknown) {
  const body = object(value);
  const grupo = requiredString(body.grupo, "o grupo");
  if (!["proteina", "acompanhamento", "extra"].includes(grupo)) throw new Error("Grupo do componente inválido.");
  const selecaoMin = integer(body.selecao_min, 0);
  const selecaoMax = integer(body.selecao_max, 1);
  if (selecaoMax < selecaoMin) throw new Error("A seleção máxima não pode ser menor que a mínima.");
  return {
    id: body.id === undefined || body.id === null ? null : requiredString(body.id, "o componente"),
    dishId: body.dish_id === undefined ? null : requiredString(body.dish_id, "o prato"),
    data: {
      grupo,
      nome: requiredString(body.nome, "o nome do componente"),
      preco_adicional: nonNegativeNumber(body.preco_adicional ?? 0, "Preço adicional"),
      selecao_min: selecaoMin,
      selecao_max: selecaoMax,
      ordem: integer(body.ordem, 0),
    },
  };
}
