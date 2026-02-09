import { useCoursesInCurrentTerm } from '@/components/studentSchedules/useCourses'
import { FC } from 'react'
import { useCourseChanges } from '../contexts/CourseChangesContext'
import { formatDays, formatTime12Hour } from './CourseChangesList'

export const VisualizeChanges: FC<{
  original:
    | ReturnType<typeof useCoursesInCurrentTerm>['data'][number]
    | undefined
  change: ReturnType<typeof useCourseChanges>['courseChanges'][number]
}> = ({ original, change }) => {
  // If no original, show everything as new (with "None" as old values)
  const originalProfessor = original
    ? original.instructors.map((i) => i.name).join(', ')
    : 'None'
  const professorChanged = originalProfessor !== change.targetProfessor

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 text-sm items-center">
      <div className="space-y-2">
        {professorChanged && (
          <div className="text-slate-200/80 truncate">{originalProfessor}</div>
        )}

        {change.meet_info.map((newMeet, meetIdx) => {
          const originalMeet = original?.meet_info[meetIdx]
          const timesChanged =
            !originalMeet ||
            originalMeet.start_time !== newMeet.start_time ||
            originalMeet.end_time !== newMeet.end_time ||
            formatDays(originalMeet.days) !== formatDays(newMeet.days)
          const roomChanged =
            !originalMeet ||
            originalMeet.building !== newMeet.building ||
            originalMeet.room !== newMeet.room

          if (!timesChanged && !roomChanged) return null

          return (
            <div key={meetIdx} className="text-slate-200/80">
              {timesChanged && (
                <div className="font-mono text-xs">
                  {originalMeet ? (
                    <>
                      {formatDays(originalMeet.days)}{' '}
                      {formatTime12Hour(originalMeet.start_time)}-
                      {formatTime12Hour(originalMeet.end_time)}
                    </>
                  ) : (
                    'None'
                  )}
                </div>
              )}
              {roomChanged && (
                <div className="text-xs text-slate-400">
                  {originalMeet?.building && originalMeet?.room
                    ? `${originalMeet.building} ${originalMeet.room}`
                    : 'None'}
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
        {professorChanged && (
          <div className="text-emerald-200 truncate">
            {change.targetProfessor || 'N/A'}
          </div>
        )}

        {change.meet_info.map((newMeet, meetIdx) => {
          const originalMeet = original?.meet_info[meetIdx]
          const timesChanged =
            !originalMeet ||
            originalMeet.start_time !== newMeet.start_time ||
            originalMeet.end_time !== newMeet.end_time ||
            formatDays(originalMeet.days) !== formatDays(newMeet.days)
          const roomChanged =
            !originalMeet ||
            originalMeet.building !== newMeet.building ||
            originalMeet.room !== newMeet.room

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
              {roomChanged && (
                <div className="text-xs text-emerald-200">
                  {newMeet.building && newMeet.room
                    ? `${newMeet.building} ${newMeet.room}`
                    : 'No room'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
