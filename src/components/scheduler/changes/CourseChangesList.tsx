import { FC, useMemo } from 'react'
import { useCourseChanges } from '@/components/scheduler/contexts/CourseChangesContext'
import { useConflictDetection } from '../contexts/useConflictDetection'
import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { useStudentSchedules } from '@/hooks/useStudentSchedules'
import { DisplayConflicts } from '@/components/scheduler/changes/DisplayConflicts'
import { VisualizeChanges } from './VisualizeChanges'

export const CourseChangesList: FC = () => {
  const { courseChanges, removeCourseChange, clearCourseChanges } =
    useCourseChanges()
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const { data: studentSchedules = [] } = useStudentSchedules()
  const { getConflictsForChange } = useConflictDetection()


  // console.log("courses without professor:", courses.filter(c => c.instructors.length === 0));

  const changesWithOriginal = useMemo(() => {
    const courseMap = new Map(courses.map((course) => [course.crn, course]))

    return courseChanges.map((change) => ({
      change,
      original: courseMap.get(change.crn),
      conflicts: getConflictsForChange(change, courses, studentSchedules),
    }))
  }, [courseChanges, courses, studentSchedules, getConflictsForChange])

  return (
    <div className="overflow-y-auto bg-slate-950/50 shadow-xl rounded-lg">
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="">Course Changes ({courseChanges.length})</h3>
        {courseChanges.length > 0 && (
          <button
            onClick={clearCourseChanges}
            className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="px-3 pb-3 space-y-3">
        {changesWithOriginal.map(({ change, original, conflicts }, idx) => (
          <div
            key={`${change.crn}-${change.timestamp}-${idx}`}
            className="bg-slate-700/50 border border-slate-600 rounded p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-blue-300 pe-2">
                  {original
                    ? `${original.subject_code} ${original.course_number}`
                    : change.crn}{' '}
                </span>
                {original && (
                  <span className="text-sm text-slate-400 truncate">
                    {original.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeCourseChange(change.crn)}
                className="text-slate-400 hover:text-red-400 transition-colors"
                title="Remove change"
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

            {original && (
              <VisualizeChanges original={original} change={change} />
            )}

            <DisplayConflicts
              conflicts={conflicts}
              targetProfessor={change.targetProfessor}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const formatTime12Hour = (time: string | null): string => {
  if (!time) return 'N/A'
  const [hours, minutes] = time.split(':').map(Number)
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')}`
}

export const formatDays = (days: string[]): string => {
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
