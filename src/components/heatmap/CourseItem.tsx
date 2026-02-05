import { FC } from 'react'
import type { Course } from '../../schemas/courses'

export const CourseItem: FC<{
  course: Course
  isSelected: boolean
  onToggle: () => void
}> = ({ course, isSelected, onToggle }) => {
  return (
    <label className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-lg backdrop-blur-sm block cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white">
            {course.subject_code} {course.course_number} - {course.name}
          </h3>
          <p className="mt-1 text-sm text-white/70">
            CRN: {course.crn} | Term: {course.term.name} | Instructors:{' '}
            {course.instructors.map((inst) => inst.name).join(', ')}
          </p>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1 h-5 w-5 rounded border-2 border-slate-600 bg-slate-800 
          appearance-none text-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 
          focus:ring-offset-slate-900 cursor-pointer checked:bg-green-500 
          checked:border-green-500 transition-colors"
        />
      </div>
    </label>
  )
}
