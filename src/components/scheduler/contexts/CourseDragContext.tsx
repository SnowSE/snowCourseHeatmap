import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema } from '../../../schemas/courses'
import { useCourseChanges } from './CourseChangesContext'

const CourseDragContext = createContext<
  | {
      isDragging: boolean
      handleDragStart: (
        crn: string,
        term: string,
        originalMeetInfo: z.infer<typeof MeetInfoSchema>[],
        originalProfessor?: string,
      ) => void
      handleDrop: (
        day: string,
        time: string,
        targetProfessor?: string,
        targetRoom?: string,
        isStudentSchedule?: boolean,
      ) => void
    }
  | undefined
>(undefined)

export function CourseDragProvider({ children }: { children: ReactNode }) {
  const { addOrUpdateCourseChange } = useCourseChanges()

  const [dragState, setDragState] = useState<{
    isDragging: boolean
    crn: string | null
    term: string | null
    originalMeetInfo: z.infer<typeof MeetInfoSchema>[] | null
    originalProfessor: string | null
  }>({
    isDragging: false,
    crn: null,
    term: null,
    originalMeetInfo: null,
    originalProfessor: null,
  })

  const handleDragStart = (
    crn: string,
    term: string,
    originalMeetInfo: z.infer<typeof MeetInfoSchema>[],
    originalProfessor?: string,
  ) => {
    setDragState({
      isDragging: true,
      crn,
      term,
      originalMeetInfo,
      originalProfessor: originalProfessor || null,
    })
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      crn: null,
      term: null,
      originalMeetInfo: null,
      originalProfessor: null,
    })
  }

  const handleDrop = (
    day: string,
    time: string,
    targetProfessor?: string,
    targetRoom?: string,
    isStudentSchedule?: boolean,
  ) => {
    if (dragState.crn && dragState.term && dragState.originalMeetInfo) {
      const originalMeet = dragState.originalMeetInfo[0]
      const endTime = calculateEndTime(time, originalMeet)

      // Build new meet_info - preserve original days but update times
      const newMeetInfo: z.infer<typeof MeetInfoSchema> = {
        days: originalMeet?.days ?? [day],
        start_time: time,
        end_time: endTime,
        // If dropped on student schedule, preserve original room
        // Otherwise use target room if provided, or preserve original building/room
        building: isStudentSchedule
          ? (originalMeet?.building ?? null)
          : targetRoom
            ? targetRoom.split(' ')[0]
            : (originalMeet?.building ?? null),
        building_code: originalMeet?.building_code ?? null,
        room: isStudentSchedule
          ? (originalMeet?.room ?? null)
          : targetRoom
            ? targetRoom.split(' ').slice(1).join(' ')
            : (originalMeet?.room ?? null),
      }

      // Record the course change using the changes context
      // If dropped on student schedule, preserve original professor
      const professorToUse = isStudentSchedule
        ? dragState.originalProfessor || ''
        : targetProfessor || ''

      addOrUpdateCourseChange({
        crn: dragState.crn,
        term: dragState.term,
        targetProfessor: professorToUse,
        meet_info: [newMeetInfo],
        timestamp: Date.now(),
      })
    }

    handleDragEnd()
  }

  return (
    <CourseDragContext.Provider
      value={{
        isDragging: dragState.isDragging,
        handleDragStart,
        handleDrop,
      }}
    >
      {children}
    </CourseDragContext.Provider>
  )
}

export function useCourseDrag() {
  const context = useContext(CourseDragContext)
  if (!context) {
    throw new Error('useCourseDrag must be used within CourseDragProvider')
  }
  return context
}

const calculateEndTime = (
  time: string,
  originalMeet?: z.infer<typeof MeetInfoSchema>,
): string => {
  if (originalMeet?.start_time && originalMeet?.end_time) {
    const originalStart = originalMeet.start_time.split(':').map(Number)
    const originalEnd = originalMeet.end_time.split(':').map(Number)
    const durationMinutes =
      originalEnd[0] * 60 +
      originalEnd[1] -
      (originalStart[0] * 60 + originalStart[1])

    const newStart = time.split(':').map(Number)
    const newEndMinutes = newStart[0] * 60 + newStart[1] + durationMinutes
    const endHours = Math.floor(newEndMinutes / 60)
    const endMinutes = newEndMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  } else {
    // Default to 50 minutes if no original duration
    const newStart = time.split(':').map(Number)
    const newEndMinutes = newStart[0] * 60 + newStart[1] + 50
    const endHours = Math.floor(newEndMinutes / 60)
    const endMinutes = newEndMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }
}
