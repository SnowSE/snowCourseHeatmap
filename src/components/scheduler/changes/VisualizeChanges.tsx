import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { FC } from 'react'
import { useCourseChanges } from '../contexts/CourseChangesContext'
import { formatDays, formatTime12Hour } from './CourseChangesList'

export const VisualizeChanges: FC<{
  original: ReturnType<typeof useCoursesInCurrentTerm>['data'][number]
  change: ReturnType<typeof useCourseChanges>['courseChanges'][number]
}> = ({ original, change }) => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 text-sm items-center">
      <div className="space-y-2">
        {/* Professor - only if changed */}
        {original.instructors.map((i) => i.name).join(', ') !==
          change.targetProfessor && (
          <div className="text-slate-200/80 truncate">
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
            <div key={meetIdx} className="text-slate-200/80">
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
