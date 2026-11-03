import { useState } from "react";
import ApplicationTable from "../components/ApplicationTable.tsx";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import type { Application } from "../models/application.ts";
import { useApplications } from "../hooks/useApplications.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, withdraw } = useApplications(token, onUnauthorized);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleWithdraw = (application: Application) => {
    if (window.confirm(`Retirer votre candidature à « ${application.offerTitle} » ?`)) {
      setActionError(null);
      void withdraw(application.id).catch((reason: unknown) => {
        setActionError(reason instanceof Error ? reason.message : "Retrait impossible");
      });
    }
  };

  if (error) return <ErrorState message={error} />;
  if (isLoading) return <LoadingState />;

  return (
    <section>
      <h1>Mes candidatures</h1>
      {actionError && <ErrorState message={actionError} />}
      {applications.length === 0 ? (
        <EmptyState message="Vous n'avez aucune candidature pour l'année en cours." />
      ) : (
        <ApplicationTable applications={applications} onWithdraw={handleWithdraw} />
      )}
    </section>
  );
};

export default ApplicationsPage;
