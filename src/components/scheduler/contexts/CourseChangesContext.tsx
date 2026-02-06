import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema, type Course } from '../../../schemas/courses'
import { type StudentSchedule } from '@/schemas/studentSchedule'

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
      addOrUpdateCourseChange: (change: CourseChange) => void
      removeCourseChange: (crn: string) => void
      clearCourseChanges: () => void
    }
  | undefined
>(undefined)

// Helper function to convert time string to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function CourseChangesProvider({ children }: { children: ReactNode }) {
  const [courseChanges, setCourseChanges] = useState<CourseChange[]>([])

  const addOrUpdateCourseChange = (change: CourseChange) => {
    setCourseChanges((prev) => {
      const existingIndex = prev.findIndex((c) => c.crn === change.crn)
      if (existingIndex >= 0) {
        // Replace existing change
        const updated = [...prev]
        updated[existingIndex] = change
        return updated
      } else {
        // Add new change
        return [...prev, change]
      }
    })
  }

  const removeCourseChange = (crn: string) => {
    setCourseChanges((prev) => prev.filter((change) => change.crn !== crn))
  }

  const clearCourseChanges = () => {
    setCourseChanges([])
  }

  return (
    <CourseChangesContext.Provider
      value={{
        courseChanges,
        addOrUpdateCourseChange,
        removeCourseChange,
        clearCourseChanges,
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
