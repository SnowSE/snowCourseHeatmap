import { z } from 'zod'

export const StudentClassSchema = z.object({
  id: z.number().optional(),
  schedule_id: z.number().optional(),
  department: z.string(),
  course_name: z.string(),
})

export const StudentScheduleSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
  classes: z.array(StudentClassSchema).default([]),
})

export type StudentClass = z.infer<typeof StudentClassSchema>
export type StudentSchedule = z.infer<typeof StudentScheduleSchema>
