import { Router } from "express";
import { toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const isPeriodCode = (value: string): value is PeriodCode =>
  PERIOD_CODES.includes(value as PeriodCode);

const parsePeriod = (value: unknown): PeriodCode | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !isPeriodCode(value)) {
    throw new HttpError(
      400,
      "INVALID_QUERY",
      "Le paramètre period doit valoir P1, P2 ou OTHER",
    );
  }
  return value;
};

export const createOffersRouter = (offersService: OffersService) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    const period = parsePeriod(req.query.period);
    res.json(offersService.listOffers(getCurrentUser(req), period).map(toOfferDto));
  });

  return router;
};
