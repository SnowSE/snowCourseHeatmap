import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { FC, useMemo } from 'react'
import { ScheduleWeekDisplay } from './ScheduleWeekDisplay'
import { CourseOwner } from '../ScheduleOwnerList'

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

  const displayName = owner.professorName || owner.roomName || 'Unknown'

  return (
    <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-600/50 p-1 py-3">
      <h2 className="text-center font-bold">{displayName}</h2>
      <ScheduleWeekDisplay courses={ownerCourses} />
    </div>
  )
}
