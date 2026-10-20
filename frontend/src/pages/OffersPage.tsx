import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import type { PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";

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
        <OfferTable offers={offers} />
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
