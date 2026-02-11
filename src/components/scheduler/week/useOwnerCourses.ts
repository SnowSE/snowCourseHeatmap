import { useMemo } from 'react'
import type { Course } from '@/schemas/courses'
import type { CourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'
import type { StudentSchedule } from '@/schemas/studentSchedule'
import { useStudentScheduleClassList } from '../../../hooks/useStudentSchedules'

export function useOwnerCourses(
  owner: CourseOwner,
  courses: Course[],
  studentSchedules: StudentSchedule[],
): Course[] {
  return useMemo(() => {
    if (owner.professorName) {
      const filtered = courses.filter((course) =>
        course.instructors.some((inst) => inst.name === owner.professorName),
      )

      return filtered
    } else if (owner.roomName) {
      const filtered = courses.filter((course) =>
        course.meet_info.some((meet) => {
          const roomName = meet.building
            ? `${meet.building} ${meet.room}`
            : meet.room
          return roomName === owner.roomName
        }),
      )

      return filtered
    } else if (owner.studentScheduleName) {
      // Find the student schedule
      const schedule = studentSchedules.find(
        (s) => s.name === owner.studentScheduleName,
      )
      if (!schedule) {
        return []
      }

      // Match courses based on department and course number
      const filtered = useStudentScheduleClassList(schedule, courses)

      return filtered
    }
    return []
  }, [courses, owner, studentSchedules])
}
