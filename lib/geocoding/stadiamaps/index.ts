type StadiaContextItem = { name?: string; abbreviation?: string };

type StadiaFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    formatted_address_line?: string;
    address_components?: { number?: string; street?: string; postal_code?: string };
    context?: {
      iso_3166_2?: string;
      whosonfirst?: {
        neighbourhood?: StadiaContextItem;
        borough?: StadiaContextItem;
        locality?: StadiaContextItem;
        county?: StadiaContextItem;
        region?: StadiaContextItem;
      };
    };
  };
};

type StadiaResponse = {
  features?: StadiaFeature[];
  geocoding?: { attribution?: string; error?: string };
};

const BRAZILIAN_STATE_CODES: Record<string, string> = {
  acre: "AC", alagoas: "AL", amapá: "AP", amazonas: "AM", bahia: "BA",
  ceará: "CE", "distrito federal": "DF", "espírito santo": "ES", goiás: "GO",
  maranhão: "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
  "minas gerais": "MG", pará: "PA", paraíba: "PB", paraná: "PR",
  pernambuco: "PE", piauí: "PI", "rio de janeiro": "RJ",
  "rio grande do norte": "RN", "rio grande do sul": "RS", rondônia: "RO",
  roraima: "RR", "santa catarina": "SC", "são paulo": "SP", sergipe: "SE",
  tocantins: "TO",
};

function normalizeState(region?: StadiaContextItem, isoCode?: string) {
  const fromIso = isoCode?.split("-").at(-1);
  if (fromIso?.length === 2) return fromIso.toUpperCase();
  if (region?.abbreviation?.length === 2) return region.abbreviation.toUpperCase();
  return BRAZILIAN_STATE_CODES[region?.name?.toLocaleLowerCase("pt-BR") ?? ""] ?? region?.name ?? "";
}

export async function reverseGeocodeWithStadiaMaps(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { status: 400, body: { error: "Coordenadas inválidas." } };
  }

  const apiKey = process.env.STADIA_MAPS_API_KEY;
  if (!apiKey) {
    return { status: 500, body: { error: "Configure STADIA_MAPS_API_KEY no servidor." } };
  }

  const baseUrl = process.env.STADIA_MAPS_BASE_URL ?? "https://api.stadiamaps.com";
  const endpoint = new URL("geocoding/v2/reverse", `${baseUrl.replace(/\/$/, "")}/`);
  endpoint.searchParams.set("point.lat", latitude.toFixed(6));
  endpoint.searchParams.set("point.lon", longitude.toFixed(6));
  endpoint.searchParams.set("boundary.country", "BRA");
  endpoint.searchParams.set("layers", "address,street");
  endpoint.searchParams.set("size", "1");
  endpoint.searchParams.set("lang", "pt-BR");

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/geo+json, application/json",
        Authorization: `Stadia-Auth ${apiKey}`,
      },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 401 || response.status === 403) {
      return { status: 502, body: { error: "A chave do Stadia Maps foi recusada." } };
    }
    if (response.status === 429) {
      return { status: 429, body: { error: "O limite mensal do Stadia Maps foi atingido." } };
    }
    if (!response.ok) {
      return { status: 502, body: { error: "O serviço de localização não respondeu." } };
    }

    const result = await response.json() as StadiaResponse;
    const feature = result.features?.[0];
    const properties = feature?.properties;
    const components = properties?.address_components;
    const context = properties?.context;
    const hierarchy = context?.whosonfirst;
    const coordinates = feature?.geometry?.coordinates;

    if (result.geocoding?.error || !feature || !properties) {
      return { status: 404, body: { error: "Endereço não encontrado para esta localização." } };
    }

    return {
      status: 200,
      body: {
        location: {
          cep: components?.postal_code ?? "",
          endereco: components?.street ?? properties.name ?? "",
          numero: components?.number ?? "",
          bairro: hierarchy?.neighbourhood?.name ?? hierarchy?.borough?.name ?? "",
          cidade: hierarchy?.locality?.name ?? hierarchy?.county?.name ?? "",
          estado: normalizeState(hierarchy?.region, context?.iso_3166_2),
          latitude: Number(coordinates?.[1] ?? latitude).toFixed(6),
          longitude: Number(coordinates?.[0] ?? longitude).toFixed(6),
          endereco_completo: properties.formatted_address_line ?? properties.name ?? "",
        },
        attribution: result.geocoding?.attribution ?? "https://stadiamaps.com/attribution/",
        provider: "stadiamaps",
      },
    };
  } catch {
    return { status: 504, body: { error: "Não foi possível consultar a localização." } };
  }
}
