import { z } from 'zod'

export const TermSchema = z.object({
  name: z.string(),
  start_at: z.string(),
  end_at: z.string(),
  code: z.string(),
  is_registered: z.boolean().nullable(),
})

export const MeetInfoSchema = z.object({
  days: z.array(z.string()),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  building: z.string().nullable(),
  building_code: z.string().nullable(),
  room: z.string().nullable(),
})

export const InstructorSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  primary_instructor: z.boolean(),
})

export const EnrollmentSchema = z.object({
  max: z.number(),
  enrolled: z.number(),
  waitlist: z.number(),
  waitlist_capacity: z.number(),
})

export const CourseSchema = z.object({
  name: z.string(),
  term: TermSchema,
  subject_code: z.string(),
  course_number: z.string(),
  section_number: z.string(),
  crn: z.string(),
  credit_hours: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  campus: z.string(),
  part_of_term: z.string(),
  grade_mode: z.string().nullable(),
  meet_info: z.array(MeetInfoSchema),
  instructors: z.array(InstructorSchema),
  enrollment: EnrollmentSchema,
  requisite: z.string().nullable(),
})

export type Term = z.infer<typeof TermSchema>
export type MeetInfo = z.infer<typeof MeetInfoSchema>
export type Instructor = z.infer<typeof InstructorSchema>
export type Enrollment = z.infer<typeof EnrollmentSchema>
export type Course = z.infer<typeof CourseSchema>
