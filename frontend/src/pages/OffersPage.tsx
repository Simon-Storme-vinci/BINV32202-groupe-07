import { useState, type FormEvent } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import type { Offer, PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";
import { useApplications } from "../hooks/useApplications.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const PERIOD_OPTIONS: { value: PeriodCode | ""; label: string }[] = [
  { value: "", label: "Toutes les périodes" },
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "OTHER", label: "Autre" },
];

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [period, setPeriod] = useState<PeriodCode | "">("");
  const { offers, isLoading, error } = useOffers(
    token,
    onUnauthorized,
    period === "" ? undefined : period,
  );

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        {user.kind === "STUDENT" ? (
          <StudentOffers offers={offers} token={token} onUnauthorized={onUnauthorized} />
        ) : (
          <OfferTable offers={offers} />
        )}
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label htmlFor="offer-period">Période</label>
      <select
        id="offer-period"
        value={period}
        onChange={(event) => setPeriod(event.target.value as PeriodCode | "")}
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {renderContent()}
    </section>
  );
};

export default OffersPage;

interface StudentOffersProps {
  offers: Offer[];
  token: string;
  onUnauthorized: () => void;
}

const StudentOffers = ({ offers, token, onUnauthorized }: StudentOffersProps) => {
  const { applications, apply } = useApplications(token, onUnauthorized);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectableOfferIds = new Set(
    offers
      .filter((offer) => {
        const application = applications.find((item) => item.offerId === offer.id);
        return application === undefined || application.status === "WITHDRAWN";
      })
      .map((offer) => offer.id),
  );

  const closeModal = () => {
    if (isSubmitting) return;
    setSelectedOffer(null);
    setMessage("");
    setError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedOffer === null) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await apply(selectedOffer.id, message);
      setSelectedOffer(null);
      setMessage("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Candidature impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <OfferTable
        offers={offers}
        selectableOfferIds={selectableOfferIds}
        onApply={(offer) => {
          setError(null);
          setSelectedOffer(offer);
        }}
      />
      {selectedOffer && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className="application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="application-modal-title">Candidater à cette offre</h2>
            <p>{selectedOffer.title}</p>
            <form onSubmit={submit}>
              <label htmlFor="application-message">Message (facultatif)</label>
              <textarea
                id="application-message"
                value={message}
                maxLength={300}
                onChange={(event) => setMessage(event.target.value)}
              />
              {error && <ErrorState message={error} />}
              <div className="modal-actions">
                <button type="button" className="button" onClick={closeModal} disabled={isSubmitting}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi…" : "Confirmer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
};
