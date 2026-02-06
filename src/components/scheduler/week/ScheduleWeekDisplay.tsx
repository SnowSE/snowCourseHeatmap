import { FC, useMemo } from 'react'
import { ScheduleDayComponent } from './ScheduleDayComponent'
import { ClassesWeekTimeLabels } from './ClassesWeekTimeLabels'
import type { Course } from '@/schemas/courses'
import type { CourseOwner } from '../ScheduleOwnerList'

interface ScheduleWeekDisplayProps {
  courses: Course[]
  owner?: CourseOwner
}

export const ScheduleWeekDisplay: FC<ScheduleWeekDisplayProps> = ({
  courses,
  owner,
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
                  term: course.term.code,
                  start_time: meet.start_time!,
                  end_time: meet.end_time!,
                  meet_info: course.meet_info,
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
            term: string
            start_time: string
            end_time: string
            meet_info: {
              days: string[]
              start_time: string | null
              end_time: string | null
              building: string | null
              building_code: string | null
              room: string | null
            }[]
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
      <div className="grid grid-cols-5 gap-1 flex-1 h-full">
        {days.map((day) => (
          <ScheduleDayComponent
            key={day}
            day={day}
            meetings={meetingTimesByDay[day]}
            dayStartTime={start}
            dayEndTime={end}
            owner={owner}
          />
        ))}
      </div>
    </div>
  )
}
