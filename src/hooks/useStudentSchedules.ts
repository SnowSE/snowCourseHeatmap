import { createServerFn } from '@tanstack/react-start'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import z from 'zod'
import {
  StudentScheduleSchema,
  StudentClassSchema,
  type StudentSchedule,
} from '../schemas/studentSchedule'
import { withDatabase } from '@/dbUtils'

export const getAllStudentSchedules = createServerFn().handler(async () => {
  'use server'
  return withDatabase((db) => {
    const schedules = db
      .prepare(
        `
          SELECT 
            s.id,
            s.name,
            s.created_at,
            s.updated_at,
            COALESCE(
              json_group_array(
                json_object(
                  'id', c.id,
                  'schedule_id', c.schedule_id,
                  'department', c.department,
                  'course_name', c.course_name
                )
              ) FILTER (WHERE c.id IS NOT NULL),
              '[]'
            ) as classes
          FROM student_schedules s
          LEFT JOIN student_classes c ON s.id = c.schedule_id
          GROUP BY s.id, s.name, s.created_at, s.updated_at
          ORDER BY s.name ASC
        `,
      )
      .all() as Array<{
      id: number
      name: string
      created_at: number
      updated_at: number
      classes: string
    }>

    const schedulesWithClasses = schedules.map((schedule) => ({
      ...schedule,
      classes: JSON.parse(schedule.classes),
    }))

    return z.array(StudentScheduleSchema).parse(schedulesWithClasses)
  })
})

export const getStudentSchedule = createServerFn()
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data: { id } }) => {
    'use server'
    return withDatabase((db) => {
      const schedule = db
        .prepare(
          `
            SELECT 
              s.id,
              s.name,
              s.created_at,
              s.updated_at,
              COALESCE(
                json_group_array(
                  json_object(
                    'id', c.id,
                    'schedule_id', c.schedule_id,
                    'department', c.department,
                    'course_name', c.course_name
                  )
                ) FILTER (WHERE c.id IS NOT NULL),
                '[]'
              ) as classes
            FROM student_schedules s
            LEFT JOIN student_classes c ON s.id = c.schedule_id
            WHERE s.id = @id
            GROUP BY s.id, s.name, s.created_at, s.updated_at
          `,
        )
        .get({ id }) as
        | {
            id: number
            name: string
            created_at: number
            updated_at: number
            classes: string
          }
        | undefined

      if (!schedule) {
        return null
      }

      return StudentScheduleSchema.parse({
        ...schedule,
        classes: JSON.parse(schedule.classes),
      })
    })
  })

export const createStudentSchedule = createServerFn()
  .inputValidator(
    z.object({
      name: z.string(),
      classes: z.array(StudentClassSchema).default([]),
    }),
  )
  .handler(async ({ data: { name, classes } }) => {
    'use server'
    return withDatabase((db) => {
      return db.transaction(() => {
        const result = db
          .prepare('INSERT INTO student_schedules (name) VALUES (@name)')
          .run({ name })

        const scheduleId = result.lastInsertRowid as number

        if (classes.length > 0) {
          const insertClass = db.prepare(`
            INSERT INTO student_classes (schedule_id, department, course_name)
            VALUES (@scheduleId, @department, @courseName)
          `)

          for (const cls of classes) {
            insertClass.run({
              scheduleId,
              department: cls.department,
              courseName: cls.course_name,
            })
          }
        }

        const schedule = db
          .prepare(
            `
              SELECT 
                s.id,
                s.name,
                s.created_at,
                s.updated_at,
                COALESCE(
                  json_group_array(
                    json_object(
                      'id', c.id,
                      'schedule_id', c.schedule_id,
                      'department', c.department,
                      'course_name', c.course_name
                    )
                  ) FILTER (WHERE c.id IS NOT NULL),
                  '[]'
                ) as classes
              FROM student_schedules s
              LEFT JOIN student_classes c ON s.id = c.schedule_id
              WHERE s.id = @scheduleId
              GROUP BY s.id, s.name, s.created_at, s.updated_at
            `,
          )
          .get({ scheduleId }) as {
          id: number
          name: string
          created_at: number
          updated_at: number
          classes: string
        }

        return StudentScheduleSchema.parse({
          ...schedule,
          classes: JSON.parse(schedule.classes),
        })
      })()
    })
  })

export const updateStudentSchedule = createServerFn()
  .inputValidator(
    z.object({
      id: z.number(),
      name: z.string(),
      classes: z.array(StudentClassSchema),
    }),
  )
  .handler(async ({ data: { id, name, classes } }) => {
    'use server'
    return withDatabase((db) => {
      return db.transaction(() => {
        db.prepare(
          `
            UPDATE student_schedules 
            SET name = @name, updated_at = strftime('%s', 'now') 
            WHERE id = @id
          `,
        ).run({ name, id })

        db.prepare('DELETE FROM student_classes WHERE schedule_id = @id').run({
          id,
        })

        if (classes.length > 0) {
          const insertClass = db.prepare(`
            INSERT INTO student_classes (schedule_id, department, course_name)
            VALUES (@id, @department, @courseName)
          `)

          for (const cls of classes) {
            insertClass.run({
              id,
              department: cls.department,
              courseName: cls.course_name,
            })
          }
        }

        const schedule = db
          .prepare(
            `
              SELECT 
                s.id,
                s.name,
                s.created_at,
                s.updated_at,
                COALESCE(
                  json_group_array(
                    json_object(
                      'id', c.id,
                      'schedule_id', c.schedule_id,
                      'department', c.department,
                      'course_name', c.course_name
                    )
                  ) FILTER (WHERE c.id IS NOT NULL),
                  '[]'
                ) as classes
              FROM student_schedules s
              LEFT JOIN student_classes c ON s.id = c.schedule_id
              WHERE s.id = @id
              GROUP BY s.id, s.name, s.created_at, s.updated_at
            `,
          )
          .get({ id }) as {
          id: number
          name: string
          created_at: number
          updated_at: number
          classes: string
        }

        return StudentScheduleSchema.parse({
          ...schedule,
          classes: JSON.parse(schedule.classes),
        })
      })()
    })
  })

export const deleteStudentSchedule = createServerFn()
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data: { id } }) => {
    'use server'
    return withDatabase((db) => {
      db.prepare('DELETE FROM student_schedules WHERE id = @id').run({ id })
      return { success: true }
    })
  })

export const removeClassFromSchedule = createServerFn()
  .inputValidator(
    z.object({
      scheduleId: z.number(),
      department: z.string(),
      courseName: z.string(),
    }),
  )
  .handler(async ({ data: { scheduleId, department, courseName } }) => {
    'use server'
    return withDatabase((db) => {
      db.prepare(
        `
          DELETE FROM student_classes 
          WHERE schedule_id = @scheduleId 
            AND department = @department 
            AND course_name = @courseName
            AND schedule_id IN (SELECT id FROM student_schedules WHERE id = @scheduleId)
        `,
      ).run({ scheduleId, department, courseName })

      db.prepare(
        `
          UPDATE student_schedules 
          SET updated_at = strftime('%s', 'now') 
          WHERE id = @scheduleId
        `,
      ).run({ scheduleId })

      return { success: true }
    })
  })

export function useStudentSchedules() {
  return useQuery({
    queryKey: ['studentSchedules'],
    queryFn: () => getAllStudentSchedules(),
  })
}

export function useStudentSchedule(id: number) {
  return useQuery({
    queryKey: ['studentSchedules', id],
    queryFn: () => getStudentSchedule({ data: { id } }),
    enabled: !!id,
  })
}

export function useCreateStudentSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      classes?: StudentSchedule['classes']
    }) =>
      createStudentSchedule({ data: { ...data, classes: data.classes || [] } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentSchedules'] })
    },
  })
}

export function useUpdateStudentSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      id: number
      name: string
      classes: StudentSchedule['classes']
    }) => updateStudentSchedule({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentSchedules'] })
      queryClient.invalidateQueries({
        queryKey: ['studentSchedules', variables.id],
      })
    },
  })
}

export function useDeleteStudentSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteStudentSchedule({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentSchedules'] })
    },
  })
}

export function useRemoveClassFromSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      scheduleId: number
      department: string
      courseName: string
    }) => removeClassFromSchedule({ data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentSchedules'] })
      queryClient.invalidateQueries({
        queryKey: ['studentSchedules', variables.scheduleId],
      })
    },
  })
}

export function useStudentScheduleClassList<
  T extends { subject_code: string; course_number: string },
>(schedule: StudentSchedule | null | undefined, courses: T[]): T[] {
  return courses.filter((course) =>
    schedule?.classes.some(
      (studentClass) =>
        course.subject_code === studentClass.department &&
        course.course_number === studentClass.course_name,
    ),
  )
}
