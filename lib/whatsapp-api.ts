function baseUrl() {
  const configured = process.env.WHATSAPP_API_BASE_URL
    ?? process.env.WHATSAPP_API_URL?.replace(/\/enviar\/?$/, "");
  if (!configured) throw new Error("WHATSAPP_API_BASE_URL não configurada.");
  return configured.replace(/\/$/, "");
}

export async function callWhatsAppApi(path: string, init?: RequestInit) {
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "X-API-Key": process.env.WHATSAPP_API_KEY ?? "",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}

export async function proxyWhatsAppResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "application/json";
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}
