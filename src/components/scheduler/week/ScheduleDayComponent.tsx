import { FC, useMemo } from 'react'

interface CourseMeetingInDay {
  courseName: string
  subjectCode: string
  courseNumber: string
  crn: string
  start_time: string
  end_time: string
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export const ScheduleWeekDayComponent: FC<{
  day: string
  meetings: CourseMeetingInDay[]
  dayStartTime: string
  dayEndTime: string
}> = ({ day, meetings, dayStartTime, dayEndTime }) => {
  const dayStartMinutes = timeToMinutes(dayStartTime)
  const dayEndMinutes = timeToMinutes(dayEndTime)
  const totalDayMinutes = dayEndMinutes - dayStartMinutes

  const meetingsWithPositions = useMemo(() => {
    return meetings.map((meeting) => {
      const startMinutes = timeToMinutes(meeting.start_time)
      const endMinutes = timeToMinutes(meeting.end_time)

      // Clamp end time to not exceed day end time
      const clampedEndMinutes = Math.min(endMinutes, dayEndMinutes)
      const duration = clampedEndMinutes - startMinutes

      const topPercent =
        ((startMinutes - dayStartMinutes) / totalDayMinutes) * 100
      const heightPercent = (duration / totalDayMinutes) * 100

      return {
        ...meeting,
        topPercent,
        heightPercent,
      }
    })
  }, [meetings, dayStartMinutes, dayEndMinutes, totalDayMinutes])

  const timeGridLines = useMemo(() => {
    const lines: number[] = []
    // Generate lines every 30 minutes
    for (
      let minutes = dayStartMinutes;
      minutes <= dayEndMinutes;
      minutes += 30
    ) {
      const topPercent = ((minutes - dayStartMinutes) / totalDayMinutes) * 100
      lines.push(topPercent)
    }
    return lines
  }, [dayStartMinutes, dayEndMinutes, totalDayMinutes])

  return (
    <div className="flex flex-col gap-2 h-full">
      <h3 className="text-lg font-semibold text-blue-300 text-center">{day}</h3>
      <div className="relative flex-1 min-h-0  rounded-lg bg-slate-900/30">
        {/* Time grid lines */}
        {timeGridLines.map((topPercent, idx) => (
          <div
            key={idx}
            className="absolute left-0 right-0 border-t border-slate-700/30"
            style={{ top: `${topPercent}%` }}
          />
        ))}

        {meetingsWithPositions.map((meeting, idx) => (
          <div
            key={`${meeting.crn}-${idx}`}
            title={`${meeting.subjectCode} ${meeting.courseNumber} - ${meeting.courseName}\n${formatTime12Hour(meeting.start_time)} - ${formatTime12Hour(meeting.end_time)}`}
            className="
              absolute left-0 right-0 mx-1 
              bg-slate-700 border border-blue-800/10 rounded p-1
              overflow-hidden cursor-pointer hover:bg-slate-950 hover:border-slate-700 transition-colors"
            style={{
              top: `${meeting.topPercent}%`,
              height: `${meeting.heightPercent}%`,
            }}
          >
            <div className="text-xs truncate">{meeting.courseName}</div>
            <div className="text-xs">
              {meeting.subjectCode} {meeting.courseNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
