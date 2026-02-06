import { useMemo } from 'react'
import { useCourses } from './useCourses'

export function useDepartments() {
  const { data: coursesData = {} } = useCourses()

  const departments = useMemo(() => {
    const deptSet = new Set<string>()

    // Iterate through all terms and courses
    Object.values(coursesData).forEach((courses) => {
      courses.forEach((course) => {
        if (course.subject_code) {
          deptSet.add(course.subject_code)
        }
      })
    })

    // Return sorted array of unique departments
    // subject_code serves as both value (ID) and label (title)
    return Array.from(deptSet)
      .sort()
      .map((dept) => ({ value: dept, label: dept }))
  }, [coursesData])

  return departments
}
