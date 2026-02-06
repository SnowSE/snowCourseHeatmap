import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { FC, useMemo } from 'react'
import { ScheduleWeekDisplay } from './ScheduleWeekDisplay'

export const ProfessorWeekDisplay: FC<{ professorName: string }> = ({
  professorName,
}) => {
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const scheduleCourses = useMemo(
    () =>
      courses.filter((course) =>
        course.instructors.some((inst) => inst.name === professorName),
      ),
    [courses, professorName],
  )

  return (
    <div className="flex flex-col bg-slate-950 rounded-lg border border-slate-600/50 p-1 py-3">
      <h2 className="text-center font-bold">{professorName}</h2>
      <ScheduleWeekDisplay courses={scheduleCourses} />
    </div>
  )
}
