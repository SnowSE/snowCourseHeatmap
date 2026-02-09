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

    for (const change of courseChanges) {
      const existingCourse = courseMap.get(change.crn)

      // Check if this is a deletion change (empty meet_info and empty professor)
      const isDeletion =
        change.meet_info.length === 0 &&
        (!change.targetProfessor || change.targetProfessor === '')

      if (existingCourse) {
        if (isDeletion) {
          console.log('[useCoursesWithChanges] Deleting course:', change.crn)
          // Remove the course from the map for deletion changes
          courseMap.delete(change.crn)
        } else {
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
      } else {
        // Create a new course for changes without an existing course
        console.log(
          '[useCoursesWithChanges] Creating new course for:',
          change.crn,
          change.courseName,
        )

        // Parse course name (e.g., "CMSC 131" -> subject_code: "CMSC", course_number: "131")
        const nameParts = (change.courseName || 'NEW 000').split(' ')
        const subject_code = nameParts[0] || 'NEW'
        const course_number = nameParts[1] || '000'

        const newCourse: Course = {
          name: change.courseName || `New Course ${change.crn}`,
          term: courses[0]?.term || {
            name: change.term,
            start_at: '',
            end_at: '',
            code: change.term,
            is_registered: null,
          },
          subject_code,
          course_number,
          section_number: '001',
          crn: change.crn,
          credit_hours: 3,
          start_date: courses[0]?.start_date || '',
          end_date: courses[0]?.end_date || '',
          campus: 'Main Campus',
          part_of_term: 'Full Term',
          grade_mode: 'Regular',
          meet_info: change.meet_info,
          instructors: [
            {
              name: change.targetProfessor,
              email: null,
              primary_instructor: true,
            },
          ],
          enrollment: {
            max: 0,
            enrolled: 0,
            waitlist: 0,
            waitlist_capacity: 0,
          },
          requisite: null,
        }

        courseMap.set(change.crn, newCourse)
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
