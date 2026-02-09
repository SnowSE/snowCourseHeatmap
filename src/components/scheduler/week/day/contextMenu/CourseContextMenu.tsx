import { FC, useEffect, useRef, useState } from 'react'
import type { z } from 'zod'
import { MeetInfoSchema } from '@/schemas/courses'
import { CourseContextMenuMeetingTimes } from './CourseContextMenuMeetingTimes'
import { RoomContextMenu } from './RoomContextMenu'
import { InstructorContextMenu } from './InstructorContextMenu'

export const CourseContextMenu: FC<{
  position: { x: number; y: number }
  courseName: string
  subjectCode: string
  courseNumber: string
  crn: string
  term: string
  instructors: string[]
  rooms: string[]
  meetInfo: z.infer<typeof MeetInfoSchema>[]
  onClose: () => void
  onSelectProfessor: (professor: string) => void
  onSelectRoom: (room: string) => void
  onDeleteCourse?: () => void
}> = ({
  position,
  courseName,
  subjectCode,
  courseNumber,
  crn,
  term,
  instructors,
  rooms,
  meetInfo,
  onClose,
  onSelectProfessor,
  onSelectRoom,
  onDeleteCourse,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      let newX = position.x
      let newY = position.y

      // Check if menu would go below the viewport
      if (position.y + menuRect.height > viewportHeight) {
        newY = viewportHeight - menuRect.height - 10 // 10px padding from bottom
      }

      // Check if menu would go beyond right edge
      if (position.x + menuRect.width > viewportWidth) {
        newX = viewportWidth - menuRect.width - 10 // 10px padding from right
      }

      // Ensure menu doesn't go above viewport
      if (newY < 10) {
        newY = 10
      }

      // Ensure menu doesn't go beyond left edge
      if (newX < 10) {
        newX = 10
      }

      setAdjustedPosition({ x: newX, y: newY })
    }
  }, [position])

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
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      <div className="mb-3 pb-3 border-b border-slate-600">
        <h3 className="font-bold text-lg text-blue-300">
          {subjectCode} {courseNumber}
        </h3>
        <p className="text-sm text-slate-300">{courseName}</p>
        <p className="text-xs text-slate-400 mt-1">CRN: {crn}</p>
      </div>
      <CourseContextMenuMeetingTimes
        meetInfo={meetInfo}
        crn={crn}
        term={term}
        courseName={courseName}
        targetProfessor={instructors[0] || ''}
      />
      <InstructorContextMenu
        instructors={instructors}
        crn={crn}
        term={term}
        courseName={courseName}
        meetInfo={meetInfo}
        onSelectProfessor={onSelectProfessor}
        onClose={onClose}
      />

      <RoomContextMenu
        rooms={rooms}
        crn={crn}
        term={term}
        courseName={courseName}
        meetInfo={meetInfo}
        instructors={instructors}
        onSelectRoom={onSelectRoom}
        onClose={onClose}
      />

      {/* Delete Course */}
      {onDeleteCourse && (
        <div className="mt-3 pt-3 ">
          <button
            onClick={() => {
              onDeleteCourse()
              onClose()
            }}
            className="w-full text-left px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded transition-colors text-red-300"
          >
            Delete Course from Schedule
          </button>
        </div>
      )}
    </div>
  )
}
