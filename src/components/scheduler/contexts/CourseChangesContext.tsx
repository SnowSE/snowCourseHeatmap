import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema, type Course } from '../../../schemas/courses'
import { type StudentSchedule } from '@/schemas/studentSchedule'
import { useStudentScheduleClassList } from '@/hooks/useStudentSchedules'

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
    studentSchedules: StudentSchedule[] = [],
  ): ConflictInfo[] => {
    if (!change.targetProfessor) return []

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

    const professorCourses = Array.from(courseMap.values()).filter((course) =>
      course.instructors.some((inst) => inst.name === change.targetProfessor),
    )

    const conflicts: ConflictInfo[] = []

    for (const newMeet of change.meet_info) {
      if (!newMeet.start_time || !newMeet.end_time) continue

      const newStart = timeToMinutes(newMeet.start_time)
      const newEnd = timeToMinutes(newMeet.end_time)

      for (const course of professorCourses) {
        if (course.crn === change.crn) continue

        for (const existingMeet of course.meet_info) {
          if (!existingMeet.start_time || !existingMeet.end_time) continue

          const daysOverlap = newMeet.days.some((day) =>
            existingMeet.days.includes(day),
          )

          if (!daysOverlap) continue

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

    // Check for conflicts with student schedules
    for (const schedule of studentSchedules) {
      const scheduleCourses = useStudentScheduleClassList(
        schedule,
        Array.from(courseMap.values()),
      )

      for (const newMeet of change.meet_info) {
        if (!newMeet.start_time || !newMeet.end_time) continue

        const newStart = timeToMinutes(newMeet.start_time)
        const newEnd = timeToMinutes(newMeet.end_time)

        for (const course of scheduleCourses) {
          if (course.crn === change.crn) continue

          for (const existingMeet of course.meet_info) {
            if (!existingMeet.start_time || !existingMeet.end_time) continue

            const daysOverlap = newMeet.days.some((day) =>
              existingMeet.days.includes(day),
            )

            if (!daysOverlap) continue

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
                studentSchedule: schedule,
              })
            }
          }
        }
      }
    }

    // Check for room conflicts
    for (const newMeet of change.meet_info) {
      if (
        !newMeet.start_time ||
        !newMeet.end_time ||
        !newMeet.building ||
        !newMeet.room
      )
        continue

      const newStart = timeToMinutes(newMeet.start_time)
      const newEnd = timeToMinutes(newMeet.end_time)
      const newRoomKey = `${newMeet.building} ${newMeet.room}`

      for (const course of Array.from(courseMap.values())) {
        if (course.crn === change.crn) continue

        for (const existingMeet of course.meet_info) {
          if (
            !existingMeet.start_time ||
            !existingMeet.end_time ||
            !existingMeet.building ||
            !existingMeet.room
          )
            continue

          const existingRoomKey = `${existingMeet.building} ${existingMeet.room}`
          if (newRoomKey !== existingRoomKey) continue

          const daysOverlap = newMeet.days.some((day) =>
            existingMeet.days.includes(day),
          )

          if (!daysOverlap) continue

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
              roomConflict: true,
            })
          }
        }
      }
    }

    return conflicts
  }

  return { getConflictsForChange }
}
