import { FC, useState } from 'react'
import { useCourseDrag } from '@/components/scheduler/contexts/CourseDragContext'
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
  leftPercent?: number
  widthPercent?: number
  instructors?: string[]
  hasConflict?: boolean
  creditHours?: number
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
  leftPercent = 0,
  widthPercent = 100,
  instructors = [],
  hasConflict = false,
  creditHours,
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
          handleDragStart(crn, term, meetInfo, instructors[0], creditHours)
        }}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        title={`${subjectCode} ${courseNumber} - ${courseName}\n${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}${hasConflict ? '\n⚠️ CONFLICT: Schedule overlap detected' : ''}`}
        className={`
          absolute 
          ${hasConflict ? 'bg-red-900/70 border-red-500' : 'bg-slate-700 border-slate-800/90'} 
          border-2 rounded p-1
          overflow-hidden cursor-move hover:bg-slate-950 hover:border-slate-700 transition-colors`}
        style={{
          top: `${topPercent}%`,
          height: `${heightPercent}%`,
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          paddingLeft: leftPercent > 0 ? '0.125rem' : '0.25rem',
          paddingRight:
            leftPercent + widthPercent < 100 ? '0.125rem' : '0.25rem',
        }}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="text-xs truncate flex-1">{courseName}</div>
          {hasConflict && (
            <span
              className="text-red-300 text-xs shrink-0"
              title="Schedule conflict"
            >
              ⚠️
            </span>
          )}
        </div>
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
