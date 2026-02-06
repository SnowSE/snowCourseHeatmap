import { useMemo } from 'react'
import { Course } from '@/schemas/courses'
import { CourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'
import { StudentSchedule } from '@/schemas/studentSchedule'
import { useStudentScheduleClassList } from '@/hooks/useStudentSchedules'

export const useCourseOwners = (
  courses: Course[],
  filter: string,
  studentSchedules: StudentSchedule[] = [],
) => {
  return useMemo(() => {
    const ownerMap = new Map<
      string,
      { owner: CourseOwner; courses: typeof courses }
    >()

    courses.forEach((course) => {
      // Add professor entries
      course.instructors.forEach((instructor) => {
        const key = `professor:${instructor.name}`
        if (!ownerMap.has(key)) {
          ownerMap.set(key, {
            owner: { professorName: instructor.name },
            courses: [],
          })
        }
        ownerMap.get(key)!.courses.push(course)
      })

      // Add room entries
      course.meet_info.forEach((meetInfo) => {
        if (meetInfo.room) {
          const roomName = meetInfo.building
            ? `${meetInfo.building} ${meetInfo.room}`
            : meetInfo.room
          const key = `room:${roomName}`
          if (!ownerMap.has(key)) {
            ownerMap.set(key, {
              owner: { roomName },
              courses: [],
            })
          }
          ownerMap.get(key)!.courses.push(course)
        }
      })
    })

    studentSchedules.forEach((schedule) => {
      const key = `studentSchedule:${schedule.name}`
      if (!ownerMap.has(key)) {
        ownerMap.set(key, {
          owner: { studentScheduleName: schedule.name },
          courses: [],
        })
      }

      const matchingCourses = useStudentScheduleClassList(schedule, courses)
      matchingCourses.forEach((course) => {
        ownerMap.get(key)!.courses.push(course)
      })
    })

    let entries = Array.from(ownerMap.entries()).map(
      ([key, { owner, courses }]) => ({
        key,
        owner,
        displayName:
          owner.professorName ||
          owner.roomName ||
          owner.studentScheduleName ||
          '',
        type: owner.professorName
          ? ('professor' as const)
          : owner.roomName
            ? ('room' as const)
            : ('studentSchedule' as const),
        courses,
        creditCount: courses.reduce(
          (sum, course) => sum + course.credit_hours,
          0,
        ),
      }),
    )

    if (filter) {
      const searchTerms = filter.toLowerCase().trim().split(/\s+/)
      entries = entries.filter((entry) => {
        const displayName = entry.displayName.toLowerCase()
        // All search terms must be present in the display name
        return searchTerms.every((term) => displayName.includes(term))
      })
    }

    return entries.sort((a, b) => {
      if (a.type !== b.type) {
        // Sort order: professor, studentSchedule, room
        if (a.type === 'professor') return -1
        if (b.type === 'professor') return 1
        if (a.type === 'studentSchedule') return -1
        if (b.type === 'studentSchedule') return 1
      }
      return a.displayName.localeCompare(b.displayName)
    })
  }, [courses, filter, studentSchedules])
}
