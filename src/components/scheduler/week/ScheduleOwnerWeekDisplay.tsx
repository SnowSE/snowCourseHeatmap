import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { FC, useMemo } from 'react'
import { ScheduleWeekDisplay } from './ScheduleWeekDisplay'
import { CourseOwner } from '../ScheduleOwnerList'
import { useCourseDrag } from '@/contexts/CourseDragContext'

export const ScheduleOwnerWeekDisplay: FC<{ owner: CourseOwner }> = ({
  owner,
}) => {
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const { courseChanges } = useCourseDrag()
  
  const coursesWithChanges = useMemo(() => {
    if (!courseChanges || courseChanges.length === 0) return courses

    const courseMap = new Map(courses.map((course) => [course.crn, course]))

    for (const change of courseChanges) {
      const existingCourse = courseMap.get(change.crn)
      if (existingCourse) {
        const updatedCourse = {
          ...existingCourse,
          meet_info: change.meet_info,
        }

        // If moving to a different professor, update instructors
        if (change.targetProfessor && change.targetProfessor !== '') {
          updatedCourse.instructors = [
            {
              name: change.targetProfessor,
              email: null,
              primary_instructor: true,
            },
          ]
        }

        courseMap.set(change.crn, updatedCourse)
      }
    }

    return Array.from(courseMap.values())
  }, [courses, courseChanges])

  const ownerCourses = useMemo(() => {
    if (owner.professorName) {
      return coursesWithChanges.filter((course) =>
        course.instructors.some((inst) => inst.name === owner.professorName),
      )
    } else if (owner.roomName) {
      return coursesWithChanges.filter((course) =>
        course.meet_info.some((meet) => {
          const roomName = meet.building
            ? `${meet.building} ${meet.room}`
            : meet.room
          return roomName === owner.roomName
        }),
      )
    }
    return []
  }, [coursesWithChanges, owner])

  const displayName = owner.professorName || owner.roomName || 'Unknown'

  return (
    <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-600/50 p-1 py-3">
      <h2 className="text-center font-bold">{displayName}</h2>
      <ScheduleWeekDisplay courses={ownerCourses} owner={owner} />
    </div>
  )
}
