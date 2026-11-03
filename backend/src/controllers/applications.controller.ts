import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { isStudent } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const parsePositiveInteger = (value: unknown, name: string): number => {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new HttpError(400, "INVALID_BODY", `${name} doit être un entier positif`);
  }
  return Number(value);
};

const parseBody = (body: unknown): { offerId: number; message: string | null } => {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "INVALID_BODY", "Le corps de la requête est invalide");
  }
  const record = body as Record<string, unknown>;
  const offerId =
    typeof record.offerId === "number" && Number.isInteger(record.offerId) && record.offerId > 0
      ? record.offerId
      : (() => {
          throw new HttpError(400, "INVALID_BODY", "offerId doit être un entier positif");
        })();
  if (record.message !== undefined && record.message !== null && typeof record.message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "message doit être une chaîne de caractères");
  }
  return { offerId, message: record.message === undefined ? null : record.message as string | null };
};

export const createApplicationsRouter = (service: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    const user = getCurrentUser(req);
    if (!isStudent(user)) {
      throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent consulter leurs candidatures");
    }
    res.json(service.listForStudent(user.id).map(toApplicationDto));
  });

  router.post("/", (req, res) => {
    const user = getCurrentUser(req);
    if (!isStudent(user)) {
      throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent candidater");
    }
    const { offerId, message } = parseBody(req.body);
    res.status(201).json(toApplicationDto(service.create(user.id, offerId, message)));
  });

  router.delete("/:id", (req, res) => {
    const user = getCurrentUser(req);
    if (!isStudent(user)) {
      throw new HttpError(403, "FORBIDDEN", "Seuls les étudiants peuvent retirer une candidature");
    }
    service.withdraw(user.id, parsePositiveInteger(req.params.id, "id"));
    res.status(204).send();
  });

  return router;
};
