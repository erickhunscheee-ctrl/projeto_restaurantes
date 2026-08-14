export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const contentType = response.headers.get("content-type") ?? "";
  const result = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) throw new Error(result?.error ?? `Falha na requisição (${response.status}).`);
  return result as T;
}

export function jsonRequest(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
