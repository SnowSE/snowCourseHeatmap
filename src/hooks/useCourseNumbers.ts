import { useMemo } from 'react'
import { useCourses } from './useCourses'

export function useCourseNumbers(department: string) {
  const { data: coursesData = {} } = useCourses()

  const courseNumbers = useMemo(() => {
    if (!department) return []

    const numbersSet = new Set<string>()

    // Iterate through all terms and courses
    Object.values(coursesData).forEach((courses) => {
      courses.forEach((course) => {
        if (
          course.subject_code === department.toUpperCase() &&
          course.course_number
        ) {
          numbersSet.add(course.course_number)
        }
      })
    })

    // Return sorted array of unique course numbers
    return Array.from(numbersSet).sort()
  }, [coursesData, department])

  return courseNumbers
}
