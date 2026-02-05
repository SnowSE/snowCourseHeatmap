import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { FC, useMemo } from 'react'
import { ClassesWeekDayComponent } from './ProfessorDayComponent'
import { ClassesWeekTimeLabels } from './ClassesWeekTimeLabels'

export const ProfessorWeekDisplay: FC<{ professorName: string }> = ({
  professorName,
}) => {
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const professorCourses = useMemo(
    () =>
      courses.filter((course) =>
        course.instructors.some((inst) => inst.name === professorName),
      ),
    [courses, professorName],
  )

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const meetingTimesByDay = useMemo(
    () =>
      days.reduce(
        (acc, day) => {
          acc[day] = professorCourses
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
    [days, professorCourses],
  )

  const start = "07:00"
  const end = "17:00"

  return (
    <div className="flex flex-col">
      <h2 className="text-end font-bold">{professorName}</h2>
      <div className="flex gap-3 flex-1 min-h-0">
        <ClassesWeekTimeLabels startTime={start} endTime={end} />
        <div className="grid grid-cols-5 gap-3 flex-1 min-h-0">
          {days.map((day) => (
            <ClassesWeekDayComponent
              key={day}
              day={day}
              meetings={meetingTimesByDay[day]}
              dayStartTime={start}
              dayEndTime={end}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
