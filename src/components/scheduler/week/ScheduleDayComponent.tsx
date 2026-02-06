import { FC, useMemo } from 'react'
import { useCourseDrag } from '@/contexts/CourseDragContext'
import type { z } from 'zod'
import { MeetInfoSchema } from '@/schemas/courses'
import type { CourseOwner } from '../ScheduleOwnerList'
import { DraggableCourse } from './DraggableCourse'

interface CourseMeetingInDay {
  courseName: string
  subjectCode: string
  courseNumber: string
  crn: string
  term: string
  start_time: string
  end_time: string
  meet_info: z.infer<typeof MeetInfoSchema>[]
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const ScheduleDayComponent: FC<{
  day: string
  meetings: CourseMeetingInDay[]
  dayStartTime: string
  dayEndTime: string
  owner?: CourseOwner
}> = ({ day, meetings, dayStartTime, dayEndTime, owner }) => {
  const { handleDrop } = useCourseDrag()
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
      <div
        className="relative flex-1 min-h-0  rounded-lg bg-slate-900/30"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(e) => {
          e.preventDefault()
          if (!owner) return

          const rect = e.currentTarget.getBoundingClientRect()
          const y = e.clientY - rect.top
          const percentY = (y / rect.height) * 100
          const droppedMinutes =
            dayStartMinutes + (percentY / 100) * totalDayMinutes

          // Round to nearest 30-minute interval
          const roundedMinutes = Math.round(droppedMinutes / 30) * 30
          const hours = Math.floor(roundedMinutes / 60)
          const minutes = roundedMinutes % 60
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

          handleDrop(day, timeString, owner.professorName, owner.roomName)
        }}
      >
        {/* Time grid lines */}
        {timeGridLines.map((topPercent, idx) => (
          <div
            key={idx}
            className="absolute left-0 right-0 border-t border-slate-700/30"
            style={{ top: `${topPercent}%` }}
          />
        ))}

        {meetingsWithPositions.map((meeting, idx) => (
          <DraggableCourse
            key={`${meeting.crn}-${idx}`}
            courseName={meeting.courseName}
            subjectCode={meeting.subjectCode}
            courseNumber={meeting.courseNumber}
            crn={meeting.crn}
            term={meeting.term}
            startTime={meeting.start_time}
            endTime={meeting.end_time}
            meetInfo={meeting.meet_info}
            topPercent={meeting.topPercent}
            heightPercent={meeting.heightPercent}
          />
        ))}
      </div>
    </div>
  )
}
