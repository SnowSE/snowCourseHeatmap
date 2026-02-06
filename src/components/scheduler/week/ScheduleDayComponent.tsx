import { FC, useMemo } from 'react'
import type { z } from 'zod'
import { MeetInfoSchema } from '@/schemas/courses'
import { DraggableCourse } from './DraggableCourse'
import { DroppableDay } from './DroppableDay'
import { CourseOwner } from '@/contexts/CourseOwnerContext'

interface CourseMeetingInDay {
  courseName: string
  subjectCode: string
  courseNumber: string
  crn: string
  term: string
  start_time: string
  end_time: string
  meet_info: z.infer<typeof MeetInfoSchema>[]
  instructors?: string[]
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
  onSelectProfessor?: (professor: string) => void
  onSelectRoom?: (room: string) => void
}> = ({ day, meetings, dayStartTime, dayEndTime, owner, onSelectProfessor, onSelectRoom }) => {
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
      <DroppableDay
        day={day}
        dayStartMinutes={dayStartMinutes}
        dayEndMinutes={dayEndMinutes}
        totalDayMinutes={totalDayMinutes}
        owner={owner}
        timeGridLines={timeGridLines}
      >
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
            instructors={meeting.instructors}
            onSelectProfessor={onSelectProfessor}
            onSelectRoom={onSelectRoom}
          />
        ))}
      </DroppableDay>
    </div>
  )
}
