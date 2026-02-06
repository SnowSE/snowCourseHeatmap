import { useMemo } from 'react'
import { useCourses } from './useCourses'

export function useCourseNumbers(department: string) {
  const { data: coursesData = {} } = useCourses()

  const courseNumbers = useMemo(() => {
    if (!department) return []

    const coursesMap = new Map<string, string>()

    // Iterate through all terms and courses
    Object.values(coursesData).forEach((courses) => {
      courses.forEach((course) => {
        if (
          course.subject_code === department.toUpperCase() &&
          course.course_number
        ) {
          // Map course_number (ID) to course.name (title)
          if (!coursesMap.has(course.course_number)) {
            coursesMap.set(course.course_number, course.name)
          }
        }
      })
    })

    // Return sorted array with course_number as value and course name as label
    return Array.from(coursesMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.value.localeCompare(b.value))
  }, [coursesData, department])

  return courseNumbers
}
