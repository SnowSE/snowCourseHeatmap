import { useMemo } from 'react'
import type { Course } from '@/schemas/courses'
import type { CourseChange } from '@/components/scheduler/contexts/CourseChangesContext'

export function useCoursesWithChanges(
  courses: Course[],
  courseChanges: CourseChange[],
): Course[] {
  return useMemo(() => {
    if (!courseChanges || courseChanges.length === 0) {
      console.log(
        '[useCoursesWithChanges] No changes, returning original courses:',
        courses.length,
      )
      return courses
    }

    const courseMap = new Map(courses.map((course) => [course.crn, course]))
    console.log(
      '[useCoursesWithChanges] Starting with courses:',
      courseMap.size,
    )
    console.log(
      '[useCoursesWithChanges] Applying changes:',
      courseChanges.length,
    )

    for (const change of courseChanges) {
      const existingCourse = courseMap.get(change.crn)
      if (existingCourse) {
        console.log(
          '[useCoursesWithChanges] Applying change to:',
          change.crn,
          'Target prof:',
          change.targetProfessor,
        )
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

    const result = Array.from(courseMap.values())
    console.log(
      '[useCoursesWithChanges] Final courses after changes:',
      result.length,
    )
    return result
  }, [courses, courseChanges])
}
