import { createServerFn } from '@tanstack/react-start'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { z } from 'zod'
import { withDatabase } from '@/dbUtils'
import { MeetInfoSchema } from '@/schemas/courses'

export const CourseChangeSchema = z.object({
  id: z.number().optional(),
  crn: z.string(),
  term: z.string(),
  targetProfessor: z.string(),
  meet_info: z.array(MeetInfoSchema),
  timestamp: z.number(),
})

export const CourseChangeGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.number(),
  changes: z.array(CourseChangeSchema),
})

export type CourseChange = z.infer<typeof CourseChangeSchema>
export type CourseChangeGroup = z.infer<typeof CourseChangeGroupSchema>

export const getAllChangeGroups = createServerFn().handler(async () => {
  return withDatabase((db) => {
    const groups = db
      .prepare(
        'SELECT id, name, created_at as createdAt FROM course_change_groups ORDER BY name'
      )
      .all() as Array<{
        id: number
        name: string
        createdAt: number
      }>

    return groups.map((group) => {
      const changes = db
        .prepare(
          'SELECT id, crn, term, target_professor as targetProfessor, meet_info as meetInfo, timestamp FROM course_changes WHERE group_id = ?'
        )
        .all(group.id) as Array<{
          id: number
          crn: string
          term: string
          targetProfessor: string
          meetInfo: string
          timestamp: number
        }>

      return CourseChangeGroupSchema.parse({
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        changes: changes.map((c) => ({
          id: c.id,
          crn: c.crn,
          term: c.term,
          targetProfessor: c.targetProfessor,
          meet_info: JSON.parse(c.meetInfo),
          timestamp: c.timestamp,
        })),
      })
    })
  })
})

export const createChangeGroup = createServerFn()
  .inputValidator(z.object({ name: z.string() }))
  .handler(async ({ data: { name } }) => {
    return withDatabase((db) => {
      const result = db
        .prepare('INSERT INTO course_change_groups (name, created_at) VALUES (@name, @createdAt)')
        .run({ name, createdAt: Date.now() })

      return CourseChangeGroupSchema.parse({
        id: result.lastInsertRowid as number,
        name,
        createdAt: Date.now(),
        changes: [],
      })
    })
  })

export const deleteChangeGroup = createServerFn()
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data: { groupId } }) => {
    return withDatabase((db) => {
      db.prepare('DELETE FROM course_change_groups WHERE id = @groupId').run({ groupId })
      return { success: true }
    })
  })

export const renameChangeGroup = createServerFn()
  .inputValidator(z.object({ groupId: z.number(), newName: z.string() }))
  .handler(async ({ data: { groupId, newName } }) => {
    return withDatabase((db) => {
      db.prepare('UPDATE course_change_groups SET name = @newName WHERE id = @groupId')
        .run({ newName, groupId })
      return { success: true }
    })
  })

export const addOrUpdateCourseChange = createServerFn()
  .inputValidator(
    z.object({
      groupId: z.number(),
      change: CourseChangeSchema,
    })
  )
  .handler(async ({ data: { groupId, change } }) => {
    return withDatabase((db) => {
      const meetInfoJson = JSON.stringify(change.meet_info)

      // Check if change already exists for this CRN in this group
      const existing = db
        .prepare('SELECT id FROM course_changes WHERE group_id = @groupId AND crn = @crn')
        .get({ groupId, crn: change.crn }) as { id: number } | undefined

      if (existing) {
        // Update existing
        db.prepare(
          'UPDATE course_changes SET term = @term, target_professor = @targetProfessor, meet_info = @meetInfo, timestamp = @timestamp WHERE id = @id'
        ).run({
          term: change.term,
          targetProfessor: change.targetProfessor,
          meetInfo: meetInfoJson,
          timestamp: change.timestamp,
          id: existing.id,
        })
        return CourseChangeSchema.parse({ id: existing.id, ...change })
      } else {
        // Insert new change
        const result = db
          .prepare(
            'INSERT INTO course_changes (group_id, crn, term, target_professor, meet_info, timestamp) VALUES (@groupId, @crn, @term, @targetProfessor, @meetInfo, @timestamp)'
          )
          .run({
            groupId,
            crn: change.crn,
            term: change.term,
            targetProfessor: change.targetProfessor,
            meetInfo: meetInfoJson,
            timestamp: change.timestamp,
          })
        return CourseChangeSchema.parse({
          id: result.lastInsertRowid as number,
          ...change,
        })
      }
    })
  })

export const removeCourseChange = createServerFn()
  .inputValidator(z.object({ groupId: z.number(), crn: z.string() }))
  .handler(async ({ data: { groupId, crn } }) => {
    return withDatabase((db) => {
      db.prepare('DELETE FROM course_changes WHERE group_id = @groupId AND crn = @crn')
        .run({ groupId, crn })
      return { success: true }
    })
  })

export const clearCourseChanges = createServerFn()
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data: { groupId } }) => {
    return withDatabase((db) => {
      db.prepare('DELETE FROM course_changes WHERE group_id = @groupId').run({ groupId })
      return { success: true }
    })
  })

// React Hooks
export function useChangeGroups() {
  return useQuery({
    queryKey: ['changeGroups'],
    queryFn: () => getAllChangeGroups(),
  })
}

export function useCreateChangeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => createChangeGroup({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useDeleteChangeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => deleteChangeGroup({ data: { groupId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useRenameChangeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { groupId: number; newName: string }) =>
      renameChangeGroup({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useAddOrUpdateCourseChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { groupId: number; change: CourseChange }) =>
      addOrUpdateCourseChange({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useRemoveCourseChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { groupId: number; crn: string }) =>
      removeCourseChange({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useClearCourseChanges() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => clearCourseChanges({ data: { groupId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}
