import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useDeferredValue } from 'react'
import { CoursesList } from '../components/heatmap/CoursesList'
import { CourseWeekHeatmap } from '@/components/heatmap/CourseWeekHeatmap'
import { useCourses } from '../components/studentSchedules/useCourses'
import { useTerm } from '../contexts/TermContext'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data: coursesData = {} } = useCourses()
  const { selectedTerm } = useTerm()
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  )

  // Get courses for selected term
  const courses = selectedTerm ? coursesData[selectedTerm] || [] : []

  const deferredSelectedIds = useDeferredValue(selectedCourseIds)

  const coursesForHeatmap = useMemo(
    () =>
      deferredSelectedIds.size === 0
        ? courses
        : courses.filter((course) => deferredSelectedIds.has(course.crn)),
    [courses, deferredSelectedIds],
  )

  const toggleCourseSelection = (crn: string) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev)
      if (next.has(crn)) {
        next.delete(crn)
      } else {
        next.add(crn)
      }
      return next
    })
  }

  const selectAllCourses = (crns: string[]) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev)
      crns.forEach((crn) => next.add(crn))
      return next
    })
  }

  const clearAllCourses = () => {
    setSelectedCourseIds(new Set())
  }

  return (
    <div className="w-full text-blue-100 flex flex-col h-full">
      <div className="flex flex-row min-h-0 justify-center flex-1">
        <CoursesList
          courses={courses}
          selectedCourseIds={selectedCourseIds}
          onToggleCourse={toggleCourseSelection}
          onSelectAll={selectAllCourses}
          onClearAll={clearAllCourses}
        />
        <div className="w-425 bg-slate-950/50 p-4 rounded-lg m-8 overflow-auto">
          <CourseWeekHeatmap courses={coursesForHeatmap} />
        </div>
      </div>
    </div>
  )
}
