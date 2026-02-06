import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type DragEvent,
} from 'react'
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
        onDrop: (
          targetProfessor: string,
          meet_info: z.infer<typeof MeetInfoSchema>[],
        ) => void,
      ) => void
      handleDrop: (
        e: DragEvent,
        targetProfessor: string,
        meet_info: z.infer<typeof MeetInfoSchema>[],
      ) => void
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
    dropCallback:
      | ((
          targetProfessor: string,
          targetMeetInfo: z.infer<typeof MeetInfoSchema>[],
        ) => void)
      | null
  }>({
    isDragging: false,
    crn: null,
    term: null,
    originalMeetInfo: null,
    dropCallback: null,
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
    onDrop: (
      targetProfessor: string,
      meet_info: z.infer<typeof MeetInfoSchema>[],
    ) => void,
  ) => {
    setDragState({
      isDragging: true,
      crn,
      term,
      originalMeetInfo,
      dropCallback: onDrop,
    })
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      crn: null,
      term: null,
      originalMeetInfo: null,
      dropCallback: null,
    })
  }

  const handleDrop = (
    e: DragEvent,
    targetProfessor: string,
    meet_info: z.infer<typeof MeetInfoSchema>[],
  ) => {
    e.preventDefault()

    if (dragState.dropCallback && dragState.crn && dragState.term) {
      // Merge original meet_info with new values to preserve building/room when needed
      const mergedMeetInfo = meet_info.map((newMeet, idx) => {
        const originalMeet = dragState.originalMeetInfo?.[idx]
        
        // Calculate end_time if not provided, based on original duration
        let endTime = newMeet.end_time
        if (!endTime && newMeet.start_time && originalMeet?.start_time && originalMeet?.end_time) {
          const originalStart = originalMeet.start_time.split(':').map(Number)
          const originalEnd = originalMeet.end_time.split(':').map(Number)
          const durationMinutes = (originalEnd[0] * 60 + originalEnd[1]) - (originalStart[0] * 60 + originalStart[1])
          
          const newStart = newMeet.start_time.split(':').map(Number)
          const newEndMinutes = (newStart[0] * 60 + newStart[1]) + durationMinutes
          const endHours = Math.floor(newEndMinutes / 60)
          const endMinutes = newEndMinutes % 60
          endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
        }

        return {
          ...newMeet,
          end_time: endTime,
          // Preserve building/room from original if not specified in drop
          building: newMeet.building ?? originalMeet?.building ?? null,
          building_code: newMeet.building_code ?? originalMeet?.building_code ?? null,
          room: newMeet.room ?? originalMeet?.room ?? null,
        }
      })

      // Record the course change (replace existing change for same CRN if exists)
      setCourseChanges((prev) => {
        const existingIndex = prev.findIndex((change) => change.crn === dragState.crn)
        const newChange = {
          crn: dragState.crn!,
          term: dragState.term!,
          targetProfessor,
          meet_info: mergedMeetInfo,
          timestamp: Date.now(),
        }
        
        if (existingIndex >= 0) {
          // Replace existing change
          const updated = [...prev]
          updated[existingIndex] = newChange
          return updated
        } else {
          // Add new change
          return [...prev, newChange]
        }
      })

      dragState.dropCallback(targetProfessor, mergedMeetInfo)
    }

    handleDragEnd()
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
