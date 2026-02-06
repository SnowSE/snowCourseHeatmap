import { FC, useMemo } from 'react'
import {
  useCourseChanges,
  useConflictDetection,
} from '@/contexts/CourseChangesContext'
import { useCoursesInCurrentTerm } from '@/hooks/useCourses'

export const CourseChangesList: FC = () => {
  const { courseChanges, removeCourseChange, clearCourseChanges } =
    useCourseChanges()
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const { getConflictsForChange } = useConflictDetection()

  const changesWithOriginal = useMemo(() => {
    const courseMap = new Map(courses.map((course) => [course.crn, course]))

    return courseChanges.map((change) => ({
      change,
      original: courseMap.get(change.crn),
      conflicts: getConflictsForChange(change, courses),
    }))
  }, [courseChanges, courses, getConflictsForChange])

  if (courseChanges.length === 0) {
    return null
  }

  return (
    <div className="overflow-y-auto bg-slate-800 shadow-xl rounded-lg">
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="">Course Changes ({courseChanges.length})</h3>
        <button
          onClick={clearCourseChanges}
          className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded transition-colors"
        >
          Clear
        </button>
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

            {conflicts.length > 0 && (
              <div className="mt-2 pt-2 border-t border-red-500/30">
                <div className="flex items-start gap-2 text-xs text-red-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <div className="font-semibold mb-1">
                      Conflict Warning: {change.targetProfessor} double-booked
                    </div>
                    <ul className="space-y-1 text-red-200/80">
                      {conflicts.map((conflict, conflictIdx) => (
                        <li key={conflictIdx}>
                          {conflict.conflictingCourse.subject_code}{' '}
                          {conflict.conflictingCourse.course_number} (
                          {formatDays(conflict.conflictingMeetInfo.days)}{' '}
                          {formatTime12Hour(
                            conflict.conflictingMeetInfo.start_time,
                          )}
                          -
                          {formatTime12Hour(
                            conflict.conflictingMeetInfo.end_time,
                          )}
                          )
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const VisualizeChanges: FC<{
  original: ReturnType<typeof useCoursesInCurrentTerm>['data'][number]
  change: ReturnType<typeof useCourseChanges>['courseChanges'][number]
}> = ({ original, change }) => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 text-sm items-center">
      <div className="space-y-2">
        {/* Professor - only if changed */}
        {original.instructors.map((i) => i.name).join(', ') !==
          change.targetProfessor && (
          <div className="text-rose-200/80 truncate">
            {original.instructors.map((i) => i.name).join(', ')}
          </div>
        )}

        {/* Meeting Times - only if changed */}
        {original.meet_info.map((originalMeet, meetIdx) => {
          const newMeet = change.meet_info[meetIdx]
          const timesChanged =
            newMeet &&
            (originalMeet.start_time !== newMeet.start_time ||
              originalMeet.end_time !== newMeet.end_time ||
              formatDays(originalMeet.days) !== formatDays(newMeet.days))
          const roomChanged =
            newMeet &&
            (originalMeet.building !== newMeet.building ||
              originalMeet.room !== newMeet.room)

          if (!timesChanged && !roomChanged) return null

          return (
            <div key={meetIdx} className="text-rose-200/80">
              {timesChanged && (
                <div className="font-mono text-xs">
                  {formatDays(originalMeet.days)}{' '}
                  {formatTime12Hour(originalMeet.start_time)}-
                  {formatTime12Hour(originalMeet.end_time)}
                </div>
              )}
              {roomChanged && originalMeet.building && (
                <div className="text-xs text-slate-400">
                  {originalMeet.building} {originalMeet.room}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-start pt-0.5">
        <span className="text-green-400">→</span>
      </div>

      <div className="space-y-2">
        {original.instructors.map((i) => i.name).join(', ') !==
          change.targetProfessor && (
          <div className="text-emerald-200 truncate">
            {change.targetProfessor || 'N/A'}
          </div>
        )}

        {change.meet_info.map((newMeet, meetIdx) => {
          const originalMeet = original.meet_info[meetIdx]
          const timesChanged =
            originalMeet &&
            (originalMeet.start_time !== newMeet.start_time ||
              originalMeet.end_time !== newMeet.end_time ||
              formatDays(originalMeet.days) !== formatDays(newMeet.days))
          const roomChanged =
            originalMeet &&
            (originalMeet.building !== newMeet.building ||
              originalMeet.room !== newMeet.room)

          if (!timesChanged && !roomChanged) return null

          return (
            <div key={meetIdx} className="text-emerald-200">
              {timesChanged && (
                <div className="font-mono text-xs font-medium">
                  {formatDays(newMeet.days)}{' '}
                  {formatTime12Hour(newMeet.start_time)}-
                  {formatTime12Hour(newMeet.end_time)}
                </div>
              )}
              {roomChanged && newMeet.building && (
                <div className="text-xs text-emerald-200">
                  {newMeet.building} {newMeet.room}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const formatTime12Hour = (time: string | null): string => {
  if (!time) return 'N/A'
  const [hours, minutes] = time.split(':').map(Number)
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')}`
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
