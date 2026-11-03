import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const asStudent = (id: number = STUDENT.LUCAS_DUPONT) => tokenFor("STUDENT", id);

describe("applications", () => {
  it("crée une candidature puis refuse le doublon actif", async () => {
    const first = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP, message: "Je suis motivée" });

    expect(first.status).toBe(201);
    expect(first.body.status).toBe("IN_PROGRESS");
    expect(first.body.message).toBe("Je suis motivée");

    const duplicate = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it("liste uniquement les candidatures de l'étudiant connecté", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      offerId: OFFER.FLEET_APP,
      status: "IN_PROGRESS",
    });
  });

  it("retire logiquement une candidature et autorise une nouvelle candidature", async () => {
    const created = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP });

    const withdrawn = await request(app)
      .delete(`/applications/${created.body.id}`)
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO));

    expect(withdrawn.status).toBe(204);

    const replacement = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP });

    expect(replacement.status).toBe(201);
    expect(replacement.body.id).not.toBe(created.body.id);
  });

  it("refuse de retirer une candidature déjà traitée", async () => {
    const response = await request(app)
      .delete(`/applications/${3}`)
      .set("Authorization", asStudent(STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_PROCESSED");
  });

  it("valide le message et l'offre publiée courante", async () => {
    const tooLong = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP, message: "x".repeat(301) });
    expect(tooLong.status).toBe(400);

    const archived = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.PDF_REPORTS });
    expect(archived.status).toBe(404);
  });
});
