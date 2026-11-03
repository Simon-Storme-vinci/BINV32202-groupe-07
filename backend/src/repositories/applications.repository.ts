import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

interface CreateApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface StudentApplicationParams {
  studentId: number;
}

interface ApplicationIdParams {
  id: number;
  studentId: number;
}

export const createApplicationsRepository = (db: Db) => {
  const findCurrentYear = db.prepare(`
    SELECT id, label
    FROM academic_years
    WHERE is_current = 1
  `);
  const findPublishedOffer = db.prepare(`
    SELECT o.id
    FROM offers o
    JOIN academic_years ay ON ay.id = o.academic_year_id
    WHERE o.id = @offerId
      AND o.status = 'PUBLISHED'
      AND ay.is_current = 1
  `);
  const findActive = db.prepare(`
    SELECT 1
    FROM applications
    WHERE offer_id = @offerId
      AND student_id = @studentId
      AND status <> 'WITHDRAWN'
  `);
  const insert = db.prepare<CreateApplicationParams>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
  `);
  const findForStudent = db.prepare<StudentApplicationParams, ApplicationDbo>(`
    SELECT a.id, a.offer_id, a.student_id, o.title AS offer_title,
           c.short_name AS company_short_name, ay.label AS academic_year_label,
           a.status, a.message, a.applied_at
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    WHERE a.student_id = @studentId
      AND ay.is_current = 1
      AND o.status <> 'ARCHIVED'
      AND a.id = (
        SELECT a2.id
        FROM applications a2
        WHERE a2.offer_id = a.offer_id
          AND a2.student_id = a.student_id
        ORDER BY a2.applied_at DESC, a2.id DESC
        LIMIT 1
      )
    ORDER BY a.applied_at DESC, a.id DESC
  `);
  const findById = db.prepare<ApplicationIdParams, ApplicationDbo>(`
    SELECT a.id, a.offer_id, a.student_id, o.title AS offer_title,
           c.short_name AS company_short_name, ay.label AS academic_year_label,
           a.status, a.message, a.applied_at
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    WHERE a.id = @id AND a.student_id = @studentId
  `);
  const withdraw = db.prepare<ApplicationIdParams>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @id
      AND student_id = @studentId
      AND status = 'IN_PROGRESS'
  `);

  return {
    findCurrentYear: (): { id: number; label: string } | undefined =>
      findCurrentYear.get() as { id: number; label: string } | undefined,
    hasPublishedOffer: (offerId: number): boolean =>
      findPublishedOffer.get({ offerId }) !== undefined,
    hasActive: (offerId: number, studentId: number): boolean =>
      findActive.get({ offerId, studentId }) !== undefined,
    create: ({ offerId, studentId, message }: CreateApplicationParams): number =>
      Number(insert.run({ offerId, studentId, message }).lastInsertRowid),
    findForStudent: (studentId: number): ApplicationDbo[] => findForStudent.all({ studentId }),
    findById: (id: number, studentId: number): ApplicationDbo | undefined =>
      findById.get({ id, studentId }),
    withdraw: (id: number, studentId: number): boolean =>
      withdraw.run({ id, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
