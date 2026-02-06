import { FC, useMemo } from 'react'
import { useCourseDrag } from '@/contexts/CourseDragContext'
import { useCoursesInCurrentTerm } from '@/hooks/useCourses'

export const CourseChangesList: FC = () => {
  const { courseChanges, clearCourseChanges } = useCourseDrag()
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const changesWithOriginal = useMemo(() => {
    const courseMap = new Map(courses.map((course) => [course.crn, course]))

    return courseChanges.map((change) => ({
      change,
      original: courseMap.get(change.crn),
    }))
  }, [courseChanges, courses])

  if (courseChanges.length === 0) {
    return null
  }

  return (
    <div className="overflow-y-auto bg-slate-800 border border-slate-600 rounded-lg shadow-xl">
      <div className="sticky top-0 bg-slate-800 border-b border-slate-600 p-3 flex items-center justify-between">
        <h3 className="font-bold text-white">
          Course Changes ({courseChanges.length})
        </h3>
        <button
          onClick={clearCourseChanges}
          className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="p-3 space-y-3">
        {changesWithOriginal.map(({ change, original }, idx) => (
          <div
            key={`${change.crn}-${change.timestamp}-${idx}`}
            className="bg-slate-700/50 border border-slate-600 rounded p-3 space-y-2"
          >
            {/* Course Header */}
            <div className="font-semibold text-blue-300">
              {original
                ? `${original.subject_code} ${original.course_number}`
                : change.crn}
            </div>
            {original && (
              <div className="text-sm text-slate-300 truncate">
                {original.name}
              </div>
            )}

            {/* Professor Change */}
            {original && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Professor:</span>
                <span className="text-slate-200 truncate">
                  {original.instructors.map((i) => i.name).join(', ')}
                </span>
                <span className="text-green-400">→</span>
                <span className="text-green-300 font-medium truncate">
                  {change.targetProfessor || 'N/A'}
                </span>
              </div>
            )}

            {/* Meeting Times Change */}
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Meeting Times:</div>
              {original?.meet_info.map((originalMeet, meetIdx) => {
                const newMeet = change.meet_info[meetIdx]
                return (
                  <div
                    key={meetIdx}
                    className="flex items-start gap-2 text-sm pl-2"
                  >
                    {/* Original */}
                    <div className="flex-1 text-slate-300">
                      <div className="font-mono text-xs">
                        {formatDays(originalMeet.days)}{' '}
                        {formatTime12Hour(originalMeet.start_time)}-
                        {formatTime12Hour(originalMeet.end_time)}
                      </div>
                      {originalMeet.building && (
                        <div className="text-xs text-slate-400">
                          {originalMeet.building} {originalMeet.room}
                        </div>
                      )}
                    </div>

                    <span className="text-green-400 shrink-0">→</span>

                    {/* New */}
                    {newMeet && (
                      <div className="flex-1 text-green-300">
                        <div className="font-mono text-xs font-medium">
                          {formatDays(newMeet.days)}{' '}
                          {formatTime12Hour(newMeet.start_time)}-
                          {formatTime12Hour(newMeet.end_time)}
                        </div>
                        {newMeet.building && (
                          <div className="text-xs text-green-400">
                            {newMeet.building} {newMeet.room}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
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
