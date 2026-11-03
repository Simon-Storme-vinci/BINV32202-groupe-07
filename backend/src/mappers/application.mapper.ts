import type { Application, ApplicationDbo, ApplicationDto } from "../models/application.ts";

export const toApplication = (row: ApplicationDbo): Application => ({
  id: row.id,
  offerId: row.offer_id,
  studentId: row.student_id,
  offerTitle: row.offer_title,
  companyShortName: row.company_short_name,
  academicYear: row.academic_year_label,
  status: row.status,
  message: row.message,
  appliedAt: row.applied_at,
});

export const toApplicationDto = (application: Application): ApplicationDto => ({
  id: application.id,
  offerId: application.offerId,
  offerTitle: application.offerTitle,
  companyShortName: application.companyShortName,
  academicYear: application.academicYear,
  status: application.status,
  message: application.message,
  appliedAt: application.appliedAt,
});
