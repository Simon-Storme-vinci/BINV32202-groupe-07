import type { Application } from "../models/application.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
} from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface ApplicationTableProps {
  applications: Application[];
  onWithdraw: (application: Application) => void;
}

const ApplicationTable = ({ applications, onWithdraw }: ApplicationTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Offre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Année</th>
          <th scope="col">Statut</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((application) => (
          <tr key={application.id}>
            <td>{application.offerTitle}</td>
            <td>{application.companyShortName}</td>
            <td>{application.academicYear}</td>
            <td>
              <StatusBadge
                label={APPLICATION_STATUS_LABELS[application.status]}
                tone={APPLICATION_STATUS_TONES[application.status]}
              />
            </td>
            <td>
              {application.status === "IN_PROGRESS" && (
                <button type="button" onClick={() => onWithdraw(application)}>
                  Retirer
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ApplicationTable;
