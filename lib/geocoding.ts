import { reverseGeocodeWithStadiaMaps } from "./geocoding/stadiamaps";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  residential?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  state_code?: string;
  postcode?: string;
  [key: string]: string | undefined;
};

type NominatimResponse = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: NominatimAddress;
  error?: string;
};

let lastRequestAt = 0;

export async function reverseGeocode(latitude: number, longitude: number) {
  const provider = (process.env.GEOCODING_PROVIDER ?? "nominatim").toLowerCase();
  if (provider === "stadiamaps") {
    return reverseGeocodeWithStadiaMaps(latitude, longitude);
  }

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { status: 400, body: { error: "Coordenadas inválidas." } };
  }

  const contactEmail = process.env.GEOCODING_CONTACT_EMAIL;
  if (!contactEmail) {
    return { status: 500, body: { error: "Configure GEOCODING_CONTACT_EMAIL no servidor." } };
  }

  const now = Date.now();
  if (now - lastRequestAt < 1_000) {
    return { status: 429, body: { error: "Aguarde um instante e tente novamente." } };
  }
  lastRequestAt = now;

  const baseUrl = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
  const endpoint = new URL("reverse", `${baseUrl.replace(/\/$/, "")}/`);
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("lat", latitude.toFixed(6));
  endpoint.searchParams.set("lon", longitude.toFixed(6));
  endpoint.searchParams.set("addressdetails", "1");
  endpoint.searchParams.set("layer", "address");
  endpoint.searchParams.set("accept-language", "pt-BR,pt");
  endpoint.searchParams.set("email", contactEmail);

  try {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": `MarmitaJa/1.0 (${contactEmail})`,
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { status: 502, body: { error: "O serviço de localização não respondeu." } };

    const result = await response.json() as NominatimResponse;
    if (result.error || !result.address) {
      return { status: 404, body: { error: "Endereço não encontrado para esta localização." } };
    }
    const address = result.address;
    const isoState = address["ISO3166-2-lvl4"]?.split("-").at(-1);
    return {
      status: 200,
      body: {
        location: {
          cep: address.postcode ?? "",
          endereco: address.road ?? address.pedestrian ?? address.residential ?? "",
          numero: address.house_number ?? "",
          bairro: address.suburb ?? address.neighbourhood ?? address.city_district ?? "",
          cidade: address.city ?? address.town ?? address.village ?? address.municipality ?? "",
          estado: address.state_code ?? isoState ?? address.state ?? "",
          latitude: Number(result.lat ?? latitude).toFixed(6),
          longitude: Number(result.lon ?? longitude).toFixed(6),
          endereco_completo: result.display_name ?? "",
        },
        attribution: "© OpenStreetMap contributors",
      },
    };
  } catch {
    return { status: 504, body: { error: "Não foi possível consultar a localização." } };
  }
}
