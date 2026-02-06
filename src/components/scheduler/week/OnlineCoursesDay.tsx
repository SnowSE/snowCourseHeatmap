import { FC } from 'react'
import type { Course } from '@/schemas/courses'

export const OnlineCoursesDay: FC<{
  courses: Course[]
}> = ({ courses }) => {
  return (
    <div className="flex flex-col min-h-0">
      <div className="text-center text-sm">Online</div>
      <div className="flex-1 rounded-lg bg-slate-900/30 p-2 overflow-y-auto">
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.crn}
              className="bg-slate-700 border border-blue-800/10 rounded p-2 text-xs"
            >
              <div className="font-semibold text-blue-300 truncate">
                {course.subject_code} {course.course_number}
              </div>
              <div className="text-slate-300 truncate text-[10px]">
                {course.name}
              </div>
              {course.instructors.length > 0 && (
                <div className="text-slate-400 text-[10px] mt-1 truncate">
                  {course.instructors.map((inst) => inst.name).join(', ')}
                </div>
              )}
            </div>
          ))}
          {courses.length === 0 && (
            <div className="text-slate-500 text-center text-xs py-4">
              No online courses
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
