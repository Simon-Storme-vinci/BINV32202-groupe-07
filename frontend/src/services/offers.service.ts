import type { Offer } from "../models/offer.ts";
import type { PeriodCode } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";

export const getOffers = async (
  token: string,
  period?: PeriodCode,
  search?: string,
  signal?: AbortSignal,
): Promise<Offer[]> => {
  const params = new URLSearchParams();
  if (period !== undefined) params.set("period", period);
  const trimmedSearch = search?.trim();
  if (trimmedSearch) params.set("q", trimmedSearch);
  const query = params.toString().replace(/\+/g, "%20");
  const response = await fetch(`${API_URL}/offers${query ? `?${query}` : ""}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
