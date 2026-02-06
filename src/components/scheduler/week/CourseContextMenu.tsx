import { FC, useEffect, useRef } from 'react'
import type { z } from 'zod'
import { MeetInfoSchema } from '@/schemas/courses'

interface CourseContextMenuProps {
  position: { x: number; y: number }
  courseName: string
  subjectCode: string
  courseNumber: string
  crn: string
  instructors: string[]
  rooms: string[]
  meetInfo: z.infer<typeof MeetInfoSchema>[]
  onClose: () => void
  onSelectProfessor: (professor: string) => void
  onSelectRoom: (room: string) => void
}

const formatTime12Hour = (time: string | null): string => {
  if (!time) return 'N/A'
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

const formatDays = (days: string[]): string => {
  const dayMap: Record<string, string> = {
    Monday: 'M',
    Tuesday: 'T',
    Wednesday: 'W',
    Thursday: 'Th',
    Friday: 'F',
    Saturday: 'Sa',
    Sunday: 'Su',
  }
  return days.map((d) => dayMap[d] || d).join('')
}

export const CourseContextMenu: FC<CourseContextMenuProps> = ({
  position,
  courseName,
  subjectCode,
  courseNumber,
  crn,
  instructors,
  rooms,
  meetInfo,
  onClose,
  onSelectProfessor,
  onSelectRoom,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 min-w-80 max-w-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Course Header */}
      <div className="mb-3 pb-3 border-b border-slate-600">
        <h3 className="font-bold text-lg text-blue-300">
          {subjectCode} {courseNumber}
        </h3>
        <p className="text-sm text-slate-300">{courseName}</p>
        <p className="text-xs text-slate-400 mt-1">CRN: {crn}</p>
      </div>

      {/* Meeting Information */}
      <div className="mb-3 pb-3 border-b border-slate-600">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">
          Meeting Times
        </h4>
        {meetInfo.map((meet, idx) => (
          <div key={idx} className="text-sm text-slate-300 mb-2">
            <div className="font-mono text-xs">
              {formatDays(meet.days)} {formatTime12Hour(meet.start_time)}-
              {formatTime12Hour(meet.end_time)}
            </div>
            {meet.building && (
              <div className="text-xs text-slate-400">
                {meet.building} {meet.room}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructors */}
      {instructors.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">
            Select Professor Schedule
          </h4>
          <div className="space-y-1">
            {instructors.map((instructor, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectProfessor(instructor)
                  onClose()
                }}
                className="w-full text-left px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200"
              >
                {instructor}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      {rooms.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">
            Select Room Schedule
          </h4>
          <div className="space-y-1">
            {rooms.map((room, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectRoom(room)
                  onClose()
                }}
                className="w-full text-left px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200"
              >
                {room}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
