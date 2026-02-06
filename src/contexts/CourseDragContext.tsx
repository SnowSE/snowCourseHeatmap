import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema } from '../schemas/courses'

const CourseDragContext = createContext<
  | {
      isDragging: boolean
      courseChanges: Array<{
        crn: string
        term: string
        targetProfessor: string
        meet_info: z.infer<typeof MeetInfoSchema>[]
        timestamp: number
      }>
      handleDragStart: (
        crn: string,
        term: string,
        originalMeetInfo: z.infer<typeof MeetInfoSchema>[],
      ) => void
      handleDrop: (
        day: string,
        time: string,
        targetProfessor?: string,
        targetRoom?: string,
      ) => void
      removeCourseChange: (crn: string) => void
      clearCourseChanges: () => void
    }
  | undefined
>(undefined)

export function CourseDragProvider({ children }: { children: ReactNode }) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    crn: string | null
    term: string | null
    originalMeetInfo: z.infer<typeof MeetInfoSchema>[] | null
  }>({
    isDragging: false,
    crn: null,
    term: null,
    originalMeetInfo: null,
  })

  const [courseChanges, setCourseChanges] = useState<
    Array<{
      crn: string
      term: string
      targetProfessor: string
      meet_info: z.infer<typeof MeetInfoSchema>[]
      timestamp: number
    }>
  >([])

  const handleDragStart = (
    crn: string,
    term: string,
    originalMeetInfo: z.infer<typeof MeetInfoSchema>[],
  ) => {
    setDragState({
      isDragging: true,
      crn,
      term,
      originalMeetInfo,
    })
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      crn: null,
      term: null,
      originalMeetInfo: null,
    })
  }

  const handleDrop = (
    day: string,
    time: string,
    targetProfessor?: string,
    targetRoom?: string,
  ) => {
    if (dragState.crn && dragState.term && dragState.originalMeetInfo) {
      const originalMeet = dragState.originalMeetInfo[0]
      const endTime = calculateEndTime(time, originalMeet)

      // Build new meet_info - preserve original days but update times
      const newMeetInfo: z.infer<typeof MeetInfoSchema> = {
        days: originalMeet?.days ?? [day],
        start_time: time,
        end_time: endTime,
        // Use target room if provided, otherwise preserve original building/room
        building: targetRoom
          ? targetRoom.split(' ')[0]
          : (originalMeet?.building ?? null),
        building_code: originalMeet?.building_code ?? null,
        room: targetRoom
          ? targetRoom.split(' ').slice(1).join(' ')
          : (originalMeet?.room ?? null),
      }

      // Record the course change (replace existing change for same CRN if exists)
      setCourseChanges((prev) => {
        const existingIndex = prev.findIndex(
          (change) => change.crn === dragState.crn,
        )
        const newChange = {
          crn: dragState.crn!,
          term: dragState.term!,
          targetProfessor: targetProfessor || '',
          meet_info: [newMeetInfo],
          timestamp: Date.now(),
        }

        if (existingIndex >= 0) {
          // Replace existing change
          const updated = [...prev]
          updated[existingIndex] = newChange
          return updated
        } else {
          return [...prev, newChange]
        }
      })
    }

    handleDragEnd()
  }

  const removeCourseChange = (crn: string) => {
    setCourseChanges((prev) => prev.filter((change) => change.crn !== crn))
  }

  const clearCourseChanges = () => {
    setCourseChanges([])
  }

  return (
    <CourseDragContext.Provider
      value={{
        isDragging: dragState.isDragging,
        courseChanges,
        handleDragStart,
        handleDrop,
        removeCourseChange,
        clearCourseChanges,
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
