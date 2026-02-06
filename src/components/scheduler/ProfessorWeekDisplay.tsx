import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { FC, useMemo } from 'react'
import { ClassesWeekDayComponent } from './ProfessorDayComponent'
import { ClassesWeekTimeLabels } from './ClassesWeekTimeLabels'
import { CourseOwner } from './ProfessorList'

export const ProfessorWeekDisplay: FC<{ owner: CourseOwner }> = ({ owner }) => {
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const ownerCourses = useMemo(() => {
    if (owner.professorName) {
      return courses.filter((course) =>
        course.instructors.some((inst) => inst.name === owner.professorName),
      )
    } else if (owner.roomName) {
      return courses.filter((course) =>
        course.meet_info.some((meet) => {
          const roomName = meet.building
            ? `${meet.building} ${meet.room}`
            : meet.room
          return roomName === owner.roomName
        }),
      )
    }
    return []
  }, [courses, owner])

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const meetingTimesByDay = useMemo(
    () =>
      days.reduce(
        (acc, day) => {
          acc[day] = ownerCourses
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
    [days, ownerCourses],
  )

  const start = '07:00'
  const end = '17:00'
  const displayName = owner.professorName || owner.roomName || 'Unknown'

  return (
    <div className="flex flex-col bg-slate-950 rounded-lg border border-slate-600/50 p-1 py-3">
      <h2 className="text-center font-bold">{displayName}</h2>
      <div className="flex gap-3 h-125 ">
        <ClassesWeekTimeLabels startTime={start} endTime={end} />
        <div className="grid grid-cols-5 gap-3 flex-1 h-full">
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
