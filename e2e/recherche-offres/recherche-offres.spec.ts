import { expect, test, type Page } from "@playwright/test";

test.use({ baseURL: "http://localhost:5173" });

const signInAs = async (page: Page, userName: string) => {
  await page.goto("/");
  await page.getByRole("button", { name: userName, exact: true }).click();
};

test("Scénario 1 — connexion en tant qu’administratrice", async ({ page }) => {
  await signInAs(page, "Anne Leclercq");

  await expect(page.getByText("Anne Leclercq", { exact: true })).toBeVisible();
  await expect(page.getByText("Administrateur", { exact: true })).toBeVisible();
});

test("Scénario 1 — connexion en tant qu’étudiant", async ({ page }) => {
  await signInAs(page, "Lucas Dupont");

  await expect(page.getByText("Lucas Dupont", { exact: true })).toBeVisible();
  await expect(page.getByText("Étudiant", { exact: true })).toBeVisible();
});

test("Scénario 1 — connexion en tant que représentant d’entreprise", async ({ page }) => {
  await signInAs(page, "Claire Dumont");

  await expect(page.getByText("Claire Dumont", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Contact d'entreprise · déposant", { exact: true }),
  ).toBeVisible();
});

test("Scénario 2 — ouverture de la page Offres", async ({ page }) => {
  await signInAs(page, "Anne Leclercq");
  await page.getByRole("link", { name: "Offres", exact: true }).click();

  await expect(page).toHaveURL(/\/offres$/);
  await expect(page.getByRole("heading", { name: "Offres de stage" })).toBeVisible();
});
