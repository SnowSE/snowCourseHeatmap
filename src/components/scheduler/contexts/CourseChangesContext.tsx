import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema, type Course } from '../../../schemas/courses'
import { type StudentSchedule } from '@/schemas/studentSchedule'
import { useChangeGroups, type CourseChangeGroup } from '@/hooks/useChangeHooks'

export type CourseChange = {
  crn: string
  term: string
  targetProfessor: string
  meet_info: z.infer<typeof MeetInfoSchema>[]
  timestamp: number
}

export type ConflictInfo = {
  conflictingCourse: Course
  conflictingMeetInfo: z.infer<typeof MeetInfoSchema>
  newCourseCrn: string
  newCourseMeetInfo: z.infer<typeof MeetInfoSchema>
  studentSchedule?: StudentSchedule
  roomConflict?: boolean
}

const CourseChangesContext = createContext<
  | {
      courseChanges: CourseChange[]
      activeGroupName: string | null
      activeGroupId: number | null
      groupNames: string[]
      groups: CourseChangeGroup[]
      setActiveGroupName: (groupName: string | null) => void
      isLoading: boolean
    }
  | undefined
>(undefined)

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function CourseChangesProvider({ children }: { children: ReactNode }) {
  const [activeGroupName, setActiveGroupNameState] = useState<string | null>(
    null,
  )

  const { data: groups = [], isLoading } = useChangeGroups()

  const groupNames = groups.map((g: CourseChangeGroup) => g.name)

  const activeGroup = groups.find(
    (g: CourseChangeGroup) => g.name === activeGroupName,
  )

  const courseChanges = activeGroup?.changes ?? []
  const activeGroupId = activeGroup?.id ?? null

  const setActiveGroupName = (groupName: string | null) => {
    setActiveGroupNameState(groupName)
  }

  return (
    <CourseChangesContext.Provider
      value={{
        courseChanges,
        activeGroupName,
        activeGroupId,
        groupNames,
        groups,
        setActiveGroupName,
        isLoading,
      }}
    >
      {children}
    </CourseChangesContext.Provider>
  )
}

export function useCourseChanges() {
  const context = useContext(CourseChangesContext)
  if (!context) {
    throw new Error(
      'useCourseChanges must be used within CourseChangesProvider',
    )
  }
  return context
}
