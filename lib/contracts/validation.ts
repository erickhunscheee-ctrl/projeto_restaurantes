export class ValidationError extends Error {
  status = 400;
}

export function object(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError("Corpo da requisição inválido.");
  return value as Record<string, unknown>;
}

export function requiredString(value: unknown, label: string) {
  const parsed = typeof value === "string" ? value.trim() : "";
  if (!parsed) throw new ValidationError(`Informe ${label}.`);
  return parsed;
}

export function optionalString(value: unknown) {
  if (value === undefined) return undefined;
  const parsed = String(value).trim();
  return parsed || null;
}

export function nonNegativeNumber(value: unknown, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new ValidationError(`${label} inválido.`);
  return parsed;
}

export function integer(value: unknown, fallback: number) {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new ValidationError("Limite de seleção inválido.");
  return parsed;
}

export function stringIds(value: unknown): string[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) throw new ValidationError("Lista de categorias inválida.");
  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))];
}
