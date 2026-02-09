import { useCoursesInCurrentTerm } from '@/components/studentSchedules/useCourses'
import { useStudentSchedules } from '@/hooks/useStudentSchedules'
import { FC, useState, useRef } from 'react'
import { ScheduleWeekDisplay } from './ScheduleWeekDisplay'
import {
  CourseOwner,
  useCourseOwner,
} from '@/components/scheduler/contexts/CourseOwnerContext'
import { useCourseChanges } from '@/components/scheduler/contexts/CourseChangesContext'
import { useCoursesWithChanges } from '@/components/scheduler/week/useCoursesWithChanges'
import { useOwnerCourses } from '@/components/scheduler/week/useOwnerCourses'
import { useAddOrUpdateChange } from '@/hooks/useCourseChangeGroups'

export const ScheduleOwnerWeekDisplay: FC<{
  owner: CourseOwner
}> = ({ owner }) => {
  const {
    removeCourseOwner,
    addCourseOwner,
    handleDragStart,
    handleDrop,
    ownerNameBeingDragged,
  } = useCourseOwner()
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const { data: studentSchedules = [] } = useStudentSchedules()

  const { courseChanges, activeGroupId } = useCourseChanges()
  const addOrUpdateChangeMutation = useAddOrUpdateChange()

  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Serialize owner to get key for drag and drop
  const serializeOwner = (owner: CourseOwner): string => {
    if (owner.professorName) return `professor:${owner.professorName}`
    if (owner.roomName) return `room:${owner.roomName}`
    if (owner.studentScheduleName)
      return `studentSchedule:${owner.studentScheduleName}`
    return ''
  }

  const ownerKey = serializeOwner(owner)

  const coursesWithChanges = useCoursesWithChanges(courses, courseChanges)

  const ownerCourses = useOwnerCourses(
    owner,
    coursesWithChanges,
    studentSchedules,
  )

  const displayName =
    owner.professorName ||
    owner.roomName ||
    owner.studentScheduleName ||
    'Unknown'

  // Calculate total credits for professor
  const totalCredits = ownerCourses.reduce(
    (sum, course) => sum + (course.credit_hours || 0),
    0,
  )

  const showDropIndicator =
    ownerNameBeingDragged && ownerNameBeingDragged !== ownerKey && isHovering

  const handleDeleteCourse = async (crn: string, term: string) => {
    if (!activeGroupId) {
      return
    }

    try {
      await addOrUpdateChangeMutation.mutateAsync({
        groupId: activeGroupId,
        change: {
          crn,
          term,
          courseName: '__DELETED__',
          targetProfessor: '',
          meet_info: [],
          timestamp: Date.now(),
        },
      })
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col   border border-slate-600/50 py-3 pe-3 relative transition-all ${
        showDropIndicator
          ? 'border-l-4 border-l-blue-500 bg-slate-950 rounded-r-lg'
          : 'bg-slate-950/30 rounded-lg'
      }`}
      onDragOver={(e) => {
        e.preventDefault() // Allow drop
        setIsHovering(true)
      }}
      onDragLeave={() => {
        setIsHovering(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsHovering(false)
        handleDrop(ownerKey)
      }}
    >
      <div className="flex items-center justify-between px-2 mb-1">
        <h2
          className="text-center font-bold flex-1 cursor-move"
          draggable
          onDragStart={(e) => {
            if (containerRef.current) {
              const width = containerRef.current.offsetWidth
              e.dataTransfer.setDragImage(containerRef.current, width / 2, 0)
            }
            handleDragStart(ownerKey)
          }}
          onDragEnd={() => handleDrop(ownerKey)}
        >
          {displayName}{' '}
          {owner.professorName && (
            <span className="text-xs font-bold text-slate-400">
              {totalCredits}
            </span>
          )}
        </h2>
        <button
          onClick={() => removeCourseOwner(owner)}
          className="text-slate-400 hover:text-red-400 transition-colors"
          title="Remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <ScheduleWeekDisplay
        courses={ownerCourses}
        owner={owner}
        onSelectProfessor={(prof) => addCourseOwner({ professorName: prof })}
        onSelectRoom={(room) => addCourseOwner({ roomName: room })}
        onDeleteCourse={activeGroupId ? handleDeleteCourse : undefined}
      />
    </div>
  )
}
