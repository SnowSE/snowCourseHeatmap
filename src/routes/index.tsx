import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useDeferredValue } from 'react'
import { RefreshCourses } from '../components/RefreshCourses'
import { CoursesList } from '../components/CoursesList'
import { CourseWeekHeatmap } from '@/components/CourseWeekHeatmap'
import { Modal } from '@/components/Modal'
import { FormSelect } from '../components/FormSelect'
import { useCourses } from '../hooks/useCourses'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const queryClient = Route.useRouteContext().queryClient
  const { data: coursesData = {} } = useCourses()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  )
  
  // Get available terms and select the first one by default
  const availableTerms = Object.keys(coursesData).sort().reverse()
  const termOptions = availableTerms.map((term) => ({
    value: term,
    label: term,
  }))
  const [selectedTerm, setSelectedTerm] = useState(availableTerms[0] || '')
  
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
    <div className="w-full text-blue-100 flex flex-col  h-full">
      <div className="flex justify-center gap-4 items-center">
        {termOptions.length > 0 && (
          <FormSelect
            id="term"
            label="Term"
            value={selectedTerm}
            onChange={setSelectedTerm}
            options={termOptions}
          />
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-blue-800 px-5 py-3 font-semibold text-blue-100 transition-colors hover:bg-blue-600 mt-6"
        >
          Refresh Courses
        </button>
      </div>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Refresh Courses"
      >
        <RefreshCourses
          onCoursesRefreshed={() => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
