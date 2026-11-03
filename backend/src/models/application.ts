export const APPLICATION_STATUSES = [
  "IN_PROGRESS",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationDbo {
  id: number;
  offer_id: number;
  student_id: number;
  offer_title: string;
  company_short_name: string;
  academic_year_label: string;
  status: ApplicationStatus;
  message: string | null;
  applied_at: string;
}

export interface Application {
  id: number;
  offerId: number;
  studentId: number;
  offerTitle: string;
  companyShortName: string;
  academicYear: string;
  status: ApplicationStatus;
  message: string | null;
  appliedAt: string;
}

export interface ApplicationDto {
  id: number;
  offerId: number;
  offerTitle: string;
  companyShortName: string;
  academicYear: string;
  status: ApplicationStatus;
  message: string | null;
  appliedAt: string;
}
