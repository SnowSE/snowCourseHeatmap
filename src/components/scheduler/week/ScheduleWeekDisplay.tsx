import { FC, useMemo } from 'react'
import { ScheduleDayComponent } from './ScheduleDayComponent'
import { ClassesWeekTimeLabels } from './ClassesWeekTimeLabels'
import { OnlineCoursesDay } from './OnlineCoursesDay'
import type { Course } from '@/schemas/courses'
import { CourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'

export const ScheduleWeekDisplay: FC<{
  courses: Course[]
  owner?: CourseOwner
  onSelectProfessor?: (professor: string) => void
  onSelectRoom?: (room: string) => void
}> = ({ courses, owner, onSelectProfessor, onSelectRoom }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Separate online courses (courses with no meeting days or all meetings have empty days)
  const { regularCourses, onlineCourses } = useMemo(() => {
    const regular: Course[] = []
    const online: Course[] = []

    courses.forEach((course) => {
      const hasInPersonMeetings = course.meet_info.some(
        (meet) => meet.days.length > 0,
      )

      if (hasInPersonMeetings) {
        regular.push(course)
      } else {
        online.push(course)
      }
    })

    return { regularCourses: regular, onlineCourses: online }
  }, [courses])

  const meetingTimesByDay = useMemo(
    () =>
      days.reduce(
        (acc, day) => {
          acc[day] = regularCourses
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
                  instructors: course.instructors.map((inst) => inst.name),
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
            instructors?: string[]
          }[]
        >,
      ),
    [days, regularCourses],
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
            onSelectProfessor={onSelectProfessor}
            onSelectRoom={onSelectRoom}
          />
        ))}
      </div>
      {onlineCourses.length > 0 && <OnlineCoursesDay courses={onlineCourses} />}
    </div>
  )
}
