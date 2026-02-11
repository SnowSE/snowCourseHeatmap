import { createContext, useContext, useState, type ReactNode } from 'react'
import { type z } from 'zod'
import { MeetInfoSchema } from '../../../schemas/courses'
import { useCourseChanges } from './CourseChangesContext'
import { useAddOrUpdateChange } from '@/hooks/useCourseChangeGroups'

const CourseDragContext = createContext<
  | {
      isDragging: boolean
      handleDragStart: (
        crn: string,
        term: string,
        originalMeetInfo: z.infer<typeof MeetInfoSchema>[],
        originalProfessor?: string,
        creditHours?: number,
        courseName?: string,
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
  const { activeGroupName, activeGroupId } = useCourseChanges()
  const addOrUpdateChangeMutation = useAddOrUpdateChange()

  const [dragState, setDragState] = useState<{
    isDragging: boolean
    crn: string | null
    term: string | null
    originalMeetInfo: z.infer<typeof MeetInfoSchema>[] | null
    originalProfessor: string | null
    creditHours: number | null
    courseName: string | null
  }>({
    isDragging: false,
    crn: null,
    term: null,
    originalMeetInfo: null,
    originalProfessor: null,
    creditHours: null,
    courseName: null,
  })

  const handleDragStart = (
    crn: string,
    term: string,
    originalMeetInfo: z.infer<typeof MeetInfoSchema>[],
    originalProfessor?: string,
    creditHours?: number,
    courseName?: string,
  ) => {
    setDragState({
      isDragging: true,
      crn,
      term,
      originalMeetInfo,
      originalProfessor: originalProfessor || null,
      creditHours: creditHours ?? null,
      courseName: courseName || null,
    })
  }

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      crn: null,
      term: null,
      originalMeetInfo: null,
      originalProfessor: null,
      creditHours: null,
      courseName: null,
    })
  }

  const handleDrop = (
    day: string,
    time: string,
    targetProfessor?: string,
    targetRoom?: string,
    isStudentSchedule?: boolean,
  ) => {
    if (!activeGroupName) {
      alert(
        '⚠️ Please select or create a change group before making course changes.',
      )
      handleDragEnd()
      return
    }

    if (dragState.crn && dragState.term && dragState.originalMeetInfo) {
      const originalMeet = dragState.originalMeetInfo[0]

      // Determine new days based on drop pattern
      const newDays = determineNewDays(originalMeet?.days ?? [], day)

      const endTime = calculateEndTime(
        time,
        originalMeet,
        newDays,
        dragState.creditHours ?? undefined,
      )

      const newMeetInfo = buildNewMeetInfo(
        newDays,
        time,
        endTime,
        originalMeet,
        targetRoom,
        isStudentSchedule,
      )

      const professorToUse = determineProfessor(
        isStudentSchedule,
        targetRoom,
        targetProfessor,
        dragState.originalProfessor,
      )

      if (activeGroupId) {
        addOrUpdateChangeMutation.mutate({
          groupId: activeGroupId,
          change: {
            crn: dragState.crn,
            term: dragState.term,
            targetProfessor: professorToUse,
            courseName: dragState.courseName || undefined,
            meet_info: [newMeetInfo],
            timestamp: Date.now(),
          },
        })
      }
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

const determineNewDays = (
  originalDays: string[],
  droppedDay: string,
): string[] => {
  const mwfDays = ['Monday', 'Wednesday', 'Friday']
  const tthDays = ['Tuesday', 'Thursday']

  if (originalDays.length === 1) {
    // Single day class - just change to the dropped day
    return [droppedDay]
  }

  // Multi-day class - check pattern
  const isMWFClass = originalDays.every((d) => mwfDays.includes(d))
  const isTTHClass = originalDays.every((d) => tthDays.includes(d))
  const droppedOnMWF = mwfDays.includes(droppedDay)
  const droppedOnTTH = tthDays.includes(droppedDay)

  if (isMWFClass && droppedOnTTH) {
    // MWF class dropped on T/TH - change to T/TH pattern
    return tthDays
  } else if (isTTHClass && droppedOnMWF) {
    // T/TH class dropped on MWF - change to MWF pattern
    return mwfDays
  } else {
    // Keep original pattern if drop doesn't match a pattern change
    return originalDays
  }
}

const calculateEndTime = (
  time: string,
  originalMeet?: z.infer<typeof MeetInfoSchema>,
  newDays?: string[],
  creditHours?: number,
): string => {
  const newStart = time.split(':').map(Number)
  let durationMinutes: number

  // Get the original duration
  const originalDuration = getOriginalDuration(originalMeet)

  // Only recalculate duration if the number of meeting days has changed
  if (
    creditHours &&
    newDays &&
    originalMeet?.days &&
    newDays.length !== originalMeet.days.length
  ) {
    const numberOfMeetings = newDays.length
    // Each credit hour = 50 minutes per week (standard contact time), divided by number of meetings
    // e.g., 3 credits meeting MWF (3 days) = 150/3 = 50 min each
    // e.g., 3 credits meeting TTh (2 days) = 150/2 = 75 min each
    durationMinutes = Math.round((creditHours * 50) / numberOfMeetings)
  } else {
    // Preserve original duration if number of meetings hasn't changed
    durationMinutes = originalDuration
  }

  const newEndMinutes = newStart[0] * 60 + newStart[1] + durationMinutes
  const endHours = Math.floor(newEndMinutes / 60)
  const endMinutes = newEndMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
}

const getOriginalDuration = (
  originalMeet?: z.infer<typeof MeetInfoSchema>,
): number => {
  if (originalMeet?.start_time && originalMeet?.end_time) {
    const originalStart = originalMeet.start_time.split(':').map(Number)
    const originalEnd = originalMeet.end_time.split(':').map(Number)
    return (
      originalEnd[0] * 60 +
      originalEnd[1] -
      (originalStart[0] * 60 + originalStart[1])
    )
  }
  return 50
}

const buildNewMeetInfo = (
  newDays: string[],
  startTime: string,
  endTime: string,
  originalMeet?: z.infer<typeof MeetInfoSchema>,
  targetRoom?: string,
  isStudentSchedule?: boolean,
): z.infer<typeof MeetInfoSchema> => {
  return {
    days: newDays,
    start_time: startTime,
    end_time: endTime,
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
}

const determineProfessor = (
  isStudentSchedule?: boolean,
  targetRoom?: string,
  targetProfessor?: string,
  originalProfessor?: string | null,
): string => {
  // If dropped on student schedule, preserve original professor
  if (isStudentSchedule) {
    return originalProfessor || ''
  }
  // If dropped on a room (targetRoom provided but no targetProfessor), preserve original professor
  if (targetRoom && !targetProfessor) {
    return originalProfessor || ''
  }
  // Otherwise use target professor
  return targetProfessor || ''
}
