import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema, type Course } from '../schemas/courses'

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
function timeToMinutes(time: string): number {
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

export function useConflictDetection() {
  const { courseChanges } = useCourseChanges()

  const getConflictsForChange = (
    change: CourseChange,
    allCourses: Course[],
  ): ConflictInfo[] => {
    if (!change.targetProfessor) return []

    // Apply all existing changes plus the new change to get the current state
    const courseMap = new Map(allCourses.map((course) => [course.crn, course]))
    const allChanges = [...courseChanges, change]

    for (const ch of allChanges) {
      const existingCourse = courseMap.get(ch.crn)
      if (existingCourse) {
        const updatedCourse = {
          ...existingCourse,
          meet_info: ch.meet_info,
        }

        if (ch.targetProfessor && ch.targetProfessor !== '') {
          updatedCourse.instructors = [
            {
              name: ch.targetProfessor,
              email: null,
              primary_instructor: true,
            },
          ]
        }

        courseMap.set(ch.crn, updatedCourse)
      }
    }

    // Get all courses for the target professor
    const professorCourses = Array.from(courseMap.values()).filter((course) =>
      course.instructors.some((inst) => inst.name === change.targetProfessor),
    )

    // Check for time conflicts
    const conflicts: ConflictInfo[] = []

    for (const newMeet of change.meet_info) {
      if (!newMeet.start_time || !newMeet.end_time) continue

      const newStart = timeToMinutes(newMeet.start_time)
      const newEnd = timeToMinutes(newMeet.end_time)

      for (const course of professorCourses) {
        // Skip the course being changed
        if (course.crn === change.crn) continue

        for (const existingMeet of course.meet_info) {
          if (!existingMeet.start_time || !existingMeet.end_time) continue

          // Check if days overlap
          const daysOverlap = newMeet.days.some((day) =>
            existingMeet.days.includes(day),
          )

          if (!daysOverlap) continue

          // Check if times overlap
          const existingStart = timeToMinutes(existingMeet.start_time)
          const existingEnd = timeToMinutes(existingMeet.end_time)

          const timesOverlap =
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)

          if (timesOverlap) {
            conflicts.push({
              conflictingCourse: course,
              conflictingMeetInfo: existingMeet,
              newCourseCrn: change.crn,
              newCourseMeetInfo: newMeet,
            })
          }
        }
      }
    }

    return conflicts
  }

  return { getConflictsForChange }
}
