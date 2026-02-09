import { createServerFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { withDatabase } from '@/dbUtils'
import type { CourseChange } from '../components/scheduler/contexts/CourseChangesContext'
import { CourseChangeGroupSchema } from './useChangeHooks'

export const getAllChangeGroups = createServerFn().handler(async () => {
  return withDatabase((db) => {
    const groups = db
      .prepare(
        'SELECT id, name, created_at as createdAt FROM course_change_groups ORDER BY name',
      )
      .all() as Array<{
      id: number
      name: string
      createdAt: number
    }>

    return groups.map((group) => {
      const changes = db
        .prepare(
          `
          SELECT id, crn, term, course_name as courseName, target_professor as targetProfessor, meet_info as meetInfo, timestamp 
          FROM course_changes 
          WHERE group_id = ?
        `,
        )
        .all(group.id) as Array<{
        id: number
        crn: string
        term: string
        courseName: string | null
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
          courseName: c.courseName || undefined,
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
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      const result = db
        .prepare(
          'INSERT INTO course_change_groups (name, created_at) VALUES (?, ?)',
        )
        .run(data.name, Date.now())

      return CourseChangeGroupSchema.parse({
        id: result.lastInsertRowid as number,
        name: data.name,
        createdAt: Date.now(),
        changes: [],
      })
    })
  })

export const duplicateChangeGroup = createServerFn()
  .inputValidator(z.object({ oldGroupId: z.number(), newName: z.string() }))
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      // Get the old group and its changes
      const oldGroup = db
        .prepare(
          'SELECT id, name, created_at as createdAt FROM course_change_groups WHERE id = ?',
        )
        .get(data.oldGroupId) as
        | { id: number; name: string; createdAt: number }
        | undefined

      if (!oldGroup) {
        throw new Error('Original group not found')
      }

      const oldChanges = db
        .prepare(
          'SELECT crn, term, course_name as courseName, target_professor as targetProfessor, meet_info as meetInfo, timestamp FROM course_changes WHERE group_id = ?',
        )
        .all(data.oldGroupId) as Array<{
        crn: string
        term: string
        courseName: string | null
        targetProfessor: string
        meetInfo: string
        timestamp: number
      }>

      // Create new group
      const result = db
        .prepare(
          'INSERT INTO course_change_groups (name, created_at) VALUES (?, ?)',
        )
        .run(data.newName, Date.now())

      const newGroupId = result.lastInsertRowid as number

      // Insert changes for new group
      const insert = db.prepare(
        'INSERT INTO course_changes (group_id, crn, term, course_name, target_professor, meet_info, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )

      for (const change of oldChanges) {
        insert.run(
          newGroupId,
          change.crn,
          change.term,
          change.courseName || null,
          change.targetProfessor,
          change.meetInfo,
          change.timestamp,
        )
      }
    })
  })

export const deleteChangeGroup = createServerFn()
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      db.prepare('DELETE FROM course_change_groups WHERE id = ?').run(
        data.groupId,
      )
      return { success: true }
    })
  })

// Rename a change group
export const renameChangeGroup = createServerFn()
  .inputValidator(z.object({ groupId: z.number(), newName: z.string() }))
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      db.prepare('UPDATE course_change_groups SET name = ? WHERE id = ?').run(
        data.newName,
        data.groupId,
      )
      return { success: true }
    })
  })

export const addOrUpdateChange = createServerFn()
  .inputValidator(
    z.object({
      groupId: z.number(),
      change: z.object({
        crn: z.string(),
        term: z.string(),
        courseName: z.string().optional(),
        targetProfessor: z.string(),
        meet_info: z.any(),
        timestamp: z.number(),
      }),
    }),
  )
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      const meetInfoJson = JSON.stringify(data.change.meet_info)

      // Check if change already exists for this CRN in this group
      const existing = db
        .prepare('SELECT id FROM course_changes WHERE group_id = ? AND crn = ?')
        .get(data.groupId, data.change.crn) as { id: number } | undefined

      if (existing) {
        // Update existing
        db.prepare(
          `
          UPDATE course_changes 
          SET term = ?, course_name = ?, target_professor = ?, meet_info = ?, timestamp = ? 
          WHERE id = ?
        `,
        ).run(
          data.change.term,
          data.change.courseName || null,
          data.change.targetProfessor,
          meetInfoJson,
          data.change.timestamp,
          existing.id,
        )
        return { success: true }
      } else {
        // Insert new change
        db.prepare(
          `
          INSERT INTO course_changes (group_id, crn, term, course_name, target_professor, meet_info, timestamp) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        ).run(
          data.groupId,
          data.change.crn,
          data.change.term,
          data.change.courseName || null,
          data.change.targetProfessor,
          meetInfoJson,
          data.change.timestamp,
        )
        return { success: true }
      }
    })
  })

export const removeChange = createServerFn()
  .inputValidator(z.object({ groupId: z.number(), crn: z.string() }))
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      db.prepare(
        'DELETE FROM course_changes WHERE group_id = ? AND crn = ?',
      ).run(data.groupId, data.crn)
      return { success: true }
    })
  })

export const clearChanges = createServerFn()
  .inputValidator(z.object({ groupId: z.number() }))
  .handler(async ({ data }) => {
    return withDatabase((db) => {
      db.prepare('DELETE FROM course_changes WHERE group_id = ?').run(
        data.groupId,
      )
      return { success: true }
    })
  })

// React hooks
export function useChangeGroups() {
  return useQuery({
    queryKey: ['changeGroups'],
    queryFn: () => getAllChangeGroups(),
  })
}

export function useCreateChangeGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createChangeGroup({ data: { name } }),
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

export function useDuplicateChangeGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { oldGroupId: number; newName: string }) =>
      duplicateChangeGroup({ data }),
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

export function useAddOrUpdateChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { groupId: number; change: CourseChange }) =>
      addOrUpdateChange({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useRemoveChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { groupId: number; crn: string }) =>
      removeChange({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}

export function useClearChanges() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (groupId: number) => clearChanges({ data: { groupId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeGroups'] })
    },
  })
}
