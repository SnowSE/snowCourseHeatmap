import { FC, useState } from 'react'
import { useCourseDrag } from '@/contexts/CourseDragContext'
import type { z } from 'zod'
import { MeetInfoSchema } from '@/schemas/courses'
import { CourseContextMenu } from './CourseContextMenu'

const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export const DraggableCourse: FC<{
  courseName: string
  subjectCode: string
  courseNumber: string
  crn: string
  term: string
  startTime: string
  endTime: string
  meetInfo: z.infer<typeof MeetInfoSchema>[]
  topPercent: number
  heightPercent: number
  instructors?: string[]
  onSelectProfessor?: (professor: string) => void
  onSelectRoom?: (room: string) => void
}> = ({
  courseName,
  subjectCode,
  courseNumber,
  crn,
  term,
  startTime,
  endTime,
  meetInfo,
  topPercent,
  heightPercent,
  instructors = [],
  onSelectProfessor,
  onSelectRoom,
}) => {
  const { handleDragStart } = useCourseDrag()
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
  } | null>(null)

  const rooms = Array.from(
    new Set(
      meetInfo
        .filter((meet) => meet.building && meet.room)
        .map((meet) => `${meet.building} ${meet.room}`),
    ),
  )

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          handleDragStart(crn, term, meetInfo)
        }}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        title={`${subjectCode} ${courseNumber} - ${courseName}\n${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`}
        className="
        absolute left-0 right-0 mx-1 
        bg-slate-700 border border-blue-800/10 rounded p-1
        overflow-hidden cursor-move hover:bg-slate-950 hover:border-slate-700 transition-colors"
        style={{
          top: `${topPercent}%`,
          height: `${heightPercent}%`,
        }}
      >
        <div className="text-xs truncate">{courseName}</div>
        <div className="text-xs">
          {subjectCode} {courseNumber}
        </div>
      </div>

      {contextMenu && (
        <CourseContextMenu
          position={contextMenu}
          courseName={courseName}
          subjectCode={subjectCode}
          courseNumber={courseNumber}
          crn={crn}
          instructors={instructors}
          rooms={rooms}
          meetInfo={meetInfo}
          onClose={() => setContextMenu(null)}
          onSelectProfessor={(prof) => onSelectProfessor?.(prof)}
          onSelectRoom={(room) => onSelectRoom?.(room)}
        />
      )}
    </>
  )
}
