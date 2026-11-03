import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offerId: 1,
    offerTitle: "Application React",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    status: "IN_PROGRESS",
    message: null,
    appliedAt: "2026-10-02 18:10:00",
  },
  {
    id: 2,
    offerId: 2,
    offerTitle: "Migration cloud",
    companyShortName: "Datavia",
    academicYear: "2026-2027",
    status: "WITHDRAWN",
    message: null,
    appliedAt: "2026-09-30 10:30:00",
  },
];

describe("ApplicationsPage", () => {
  it("affiche les candidatures et leurs statuts", async () => {
    stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Application React")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
  });

  it("retire une candidature après confirmation", async () => {
    const fetchMock = stubFetch({
      "/api/applications/1": () => new Response(null, { status: 204 }),
      "/api/applications": () => Response.json(applications),
    });
    vi.stubGlobal("confirm", vi.fn(() => true));

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Application React");
    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/applications/1",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });

  it("signale une session expirée", async () => {
    const onUnauthorized = vi.fn();
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
