import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, APPLICATION, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const asStudent = (id: number = STUDENT.LUCAS_DUPONT) => tokenFor("STUDENT", id);
const asAdministrator = (id: number = ADMINISTRATOR.ANNE_LECLERCQ) => tokenFor("ADMIN", id);

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

  it("liste les statuts de candidature de l'étudiant connecté", async () => {
    const selected = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.MATEUSZ_KOWALSKI));
    const rejected = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.LEA_MERTENS));
    const withdrawn = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.INES_HADDAD));

    expect(selected.status).toBe(200);
    expect(selected.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APPLICATION.MATEUSZ_CLOUD_MIGRATION,
          status: "SELECTED",
        }),
      ]),
    );
    expect(rejected.status).toBe(200);
    expect(rejected.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APPLICATION.LEA_CLOUD_MIGRATION,
          status: "REJECTED",
        }),
      ]),
    );
    expect(withdrawn.status).toBe(200);
    expect(withdrawn.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APPLICATION.INES_BILLING_API,
          status: "WITHDRAWN",
        }),
      ]),
    );
  });

  it("retire logiquement une candidature et autorise une nouvelle candidature", async () => {
    const created = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP });

    expect(created.status).toBe(201);
    expect(created.body.message).toBeNull();

    const withdrawn = await request(app)
      .delete(`/applications/${created.body.id}`)
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO));

    expect(withdrawn.status).toBe(204);

    const listed = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO));

    expect(listed.status).toBe(200);
    expect(listed.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.body.id,
          status: "WITHDRAWN",
        }),
      ]),
    );

    const replacement = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.FLEET_APP });

    expect(replacement.status).toBe(201);
    expect(replacement.body.id).not.toBe(created.body.id);
  });

  it("refuse à un étudiant de retirer la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .delete(`/applications/${APPLICATION.LUCAS_FLEET_APP}`)
      .set("Authorization", asStudent(STUDENT.INES_HADDAD));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");

    const ownerApplications = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.LUCAS_DUPONT));

    expect(ownerApplications.status).toBe(200);
    expect(ownerApplications.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APPLICATION.LUCAS_FLEET_APP,
          status: "IN_PROGRESS",
        }),
      ]),
    );
  });

  it("refuse l'accès aux candidatures pour un utilisateur non étudiant", async () => {
    const token = asAdministrator();
    const listed = await request(app).get("/applications").set("Authorization", token);
    const created = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: OFFER.FLEET_APP });
    const withdrawn = await request(app)
      .delete(`/applications/${APPLICATION.LUCAS_FLEET_APP}`)
      .set("Authorization", token);

    for (const response of [listed, created, withdrawn]) {
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
  });

  it("refuse de retirer une candidature déjà traitée", async () => {
    const response = await request(app)
      .delete(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}`)
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

  it("refuse une candidature à une offre non publiée de l'année courante", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO))
      .send({ offerId: OFFER.CLIENT_PORTAL });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");

    const applications = await request(app)
      .get("/applications")
      .set("Authorization", asStudent(STUDENT.AMINATA_DIALLO));

    expect(applications.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ offerId: OFFER.CLIENT_PORTAL }),
      ]),
    );
  });
});
