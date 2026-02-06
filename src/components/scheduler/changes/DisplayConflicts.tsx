import { FC } from 'react'
import { ConflictInfo } from '@/components/scheduler/contexts/CourseChangesContext'

export const DisplayConflicts: FC<{
  conflicts: ConflictInfo[]
  targetProfessor: string
}> = ({ conflicts, targetProfessor }) => {
  if (conflicts.length === 0) {
    return null
  }

  // Separate conflicts by type
  const professorConflicts = conflicts.filter(
    (c) => !c.studentSchedule && !c.roomConflict,
  )
  const studentScheduleConflicts = conflicts.filter((c) => c.studentSchedule)
  const roomConflicts = conflicts.filter((c) => c.roomConflict)

  return (
    <div className=" space-y-2">
      {professorConflicts.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-rose-300">
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
              Conflict Warning: {targetProfessor} double-booked
            </div>
            <ul className="space-y-1 text-rose-200/80">
              {professorConflicts.map((conflict, conflictIdx) => (
                <li key={conflictIdx}>
                  {conflict.conflictingCourse.subject_code}{' '}
                  {conflict.conflictingCourse.course_number} (
                  {formatDays(conflict.conflictingMeetInfo.days)}{' '}
                  {formatTime12Hour(conflict.conflictingMeetInfo.start_time)}-
                  {formatTime12Hour(conflict.conflictingMeetInfo.end_time)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {studentScheduleConflicts.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-rose-300">
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
              Student Schedule Conflict
              {studentScheduleConflicts.length > 1 ? 's' : ''}
            </div>
            <ul className="space-y-1 text-rose-200/80">
              {studentScheduleConflicts.map((conflict, conflictIdx) => (
                <li key={conflictIdx}>
                  <span className="font-medium">
                    {conflict.studentSchedule!.name}:
                  </span>{' '}
                  {conflict.conflictingCourse.subject_code}{' '}
                  {conflict.conflictingCourse.course_number} (
                  {formatDays(conflict.conflictingMeetInfo.days)}{' '}
                  {formatTime12Hour(conflict.conflictingMeetInfo.start_time)}-
                  {formatTime12Hour(conflict.conflictingMeetInfo.end_time)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {roomConflicts.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-rose-300">
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
              Room Conflict{roomConflicts.length > 1 ? 's' : ''}
            </div>
            <ul className="space-y-1 text-rose-200/80">
              {roomConflicts.map((conflict, conflictIdx) => (
                <li key={conflictIdx}>
                  <span className="font-medium">
                    {conflict.conflictingMeetInfo.building}{' '}
                    {conflict.conflictingMeetInfo.room}:
                  </span>{' '}
                  {conflict.conflictingCourse.subject_code}{' '}
                  {conflict.conflictingCourse.course_number} (
                  {formatDays(conflict.conflictingMeetInfo.days)}{' '}
                  {formatTime12Hour(conflict.conflictingMeetInfo.start_time)}-
                  {formatTime12Hour(conflict.conflictingMeetInfo.end_time)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
