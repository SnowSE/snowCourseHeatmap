import { FC } from 'react'
import type { Course } from '../schemas/courses'

export const CoursesList: FC<{ courses: Course[] }> = ({ courses }) => {
  if (courses.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold text-white">
        Loaded Courses ({courses.length})
      </h2>
      <ul className="space-y-2">
        {courses.map((course) => (
          <li
            key={course.crn}
            className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-lg backdrop-blur-sm"
          >
            <h3 className="text-lg font-medium text-white">
              {course.subject_code} {course.course_number} - {course.name}
            </h3>
            <p className="mt-1 text-sm text-white/70">
              CRN: {course.crn} | Term: {course.term.name} | Instructors:{' '}
              {course.instructors.map((inst) => inst.name).join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
