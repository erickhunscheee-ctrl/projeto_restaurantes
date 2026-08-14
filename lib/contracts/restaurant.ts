import { nonNegativeNumber, object, optionalString, requiredString, stringIds, ValidationError } from "./validation";

const editableFields = ["tipo_cozinha", "status", "horario_abertura", "horario_fechamento", "foto_url", "telefone", "cep", "endereco", "numero", "complemento", "bairro", "cidade", "estado", "whatsapp_telefone"] as const;

export function parseRestaurantCreate(value: unknown, defaultOwnerId?: string) {
  const body = object(value);
  return {
    restaurant: {
      owner_id: optionalString(body.owner_id) ?? defaultOwnerId,
      nome: requiredString(body.nome, "o nome do restaurante"),
      tipo_cozinha: optionalString(body.tipo_cozinha) ?? "caseira",
      status: optionalString(body.status) ?? "aberto",
    },
    categoryIds: stringIds(body.category_ids) ?? [],
  };
}

export function parseRestaurantUpdate(value: unknown) {
  const body = object(value);
  const changes: Record<string, unknown> = {};
  if (body.nome !== undefined) changes.nome = requiredString(body.nome, "o nome do restaurante");
  for (const field of editableFields) if (body[field] !== undefined) changes[field] = optionalString(body[field]) ?? null;
  for (const field of ["latitude", "longitude"] as const) {
    if (body[field] !== undefined) {
      if (body[field] === null || body[field] === "") changes[field] = null;
      else changes[field] = nonNegativeCoordinate(body[field], field);
    }
  }
  return { id: requiredString(body.id, "o restaurante"), changes, categoryIds: stringIds(body.category_ids) };
}

function nonNegativeCoordinate(value: unknown, field: "latitude" | "longitude") {
  const parsed = Number(value);
  const limit = field === "latitude" ? 90 : 180;
  if (!Number.isFinite(parsed) || parsed < -limit || parsed > limit) throw new ValidationError(`${field} inválida.`);
  return parsed;
}
