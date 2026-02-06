import { FC, useMemo } from 'react'
import { ScheduleWeekDayComponent } from './ScheduleDayComponent'
import { ClassesWeekTimeLabels } from './ClassesWeekTimeLabels'
import type { Course } from '@/schemas/courses'

interface ScheduleWeekDisplayProps {
  courses: Course[]
}

export const ScheduleWeekDisplay: FC<ScheduleWeekDisplayProps> = ({
  courses,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const meetingTimesByDay = useMemo(
    () =>
      days.reduce(
        (acc, day) => {
          acc[day] = courses
            .flatMap((course) =>
              course.meet_info
                .filter(
                  (meet) =>
                    meet.days.includes(day) && meet.start_time && meet.end_time,
                )
                .map((meet) => ({
                  courseName: course.name,
                  subjectCode: course.subject_code,
                  courseNumber: course.course_number,
                  crn: course.crn,
                  start_time: meet.start_time!,
                  end_time: meet.end_time!,
                })),
            )
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
          return acc
        },
        {} as Record<
          string,
          {
            courseName: string
            subjectCode: string
            courseNumber: string
            crn: string
            start_time: string
            end_time: string
          }[]
        >,
      ),
    [days, courses],
  )

  const start = '07:00'
  const end = '17:00'

  return (
    <div className="flex gap-3 h-125">
      <ClassesWeekTimeLabels startTime={start} endTime={end} />
      <div className="grid grid-cols-5 gap-3 flex-1 h-full">
        {days.map((day) => (
          <ScheduleWeekDayComponent
            key={day}
            day={day}
            meetings={meetingTimesByDay[day]}
            dayStartTime={start}
            dayEndTime={end}
          />
        ))}
      </div>
    </div>
  )
}
