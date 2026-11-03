import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";

const MAX_MESSAGE_LENGTH = 300;

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listForStudent: (studentId: number): Application[] =>
    repository.findForStudent(studentId).map(toApplication),

  create: (studentId: number, offerId: number, message: string | null): Application => {
    if (message !== null && message.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(
        400,
        "INVALID_BODY",
        "Le message de candidature ne peut pas dépasser 300 caractères",
      );
    }
    if (!repository.hasPublishedOffer(offerId)) {
      throw new HttpError(404, "NOT_FOUND", "Offre publiée introuvable");
    }
    if (repository.hasActive(offerId, studentId)) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }

    const id = repository.create({ offerId, studentId, message });
    const application = repository.findById(id, studentId);
    if (application === undefined) {
      throw new HttpError(500, "INTERNAL_ERROR", "La candidature créée est introuvable");
    }
    return toApplication(application);
  },

  withdraw: (studentId: number, id: number): void => {
    const application = repository.findById(id, studentId);
    if (application === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_PROCESSED", "Cette candidature a déjà été traitée");
    }
    if (!repository.withdraw(id, studentId)) {
      throw new HttpError(409, "APPLICATION_PROCESSED", "Cette candidature a déjà été traitée");
    }
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
