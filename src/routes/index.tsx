import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useState, useMemo, useDeferredValue } from 'react'
import z from 'zod'
import { CourseSchema, type Course } from '../schemas/courses'
import { RefreshCourses } from '../components/RefreshCourses'
import { CoursesList } from '../components/CoursesList'
import { CourseWeekHeatmap } from '@/components/CourseWeekHeatmap'
import { Modal } from '@/components/Modal'

export const Route = createFileRoute('/')({ component: App })

const getStoredCourses = createServerFn().handler(async () => {
  const fs = await import('fs/promises')
  const data = await fs.readFile('courses.json', 'utf-8')
  const json = JSON.parse(data)
  return z.array(CourseSchema).parse(json)
})

function App() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  )

  const deferredSelectedIds = useDeferredValue(selectedCourseIds)

  const coursesForHeatmap = useMemo(
    () =>
      deferredSelectedIds.size === 0
        ? courses
        : courses.filter((course) => deferredSelectedIds.has(course.crn)),
    [courses, deferredSelectedIds],
  )

  useEffect(() => {
    getStoredCourses().then((data) => {
      setCourses(data)
    })
  }, [])

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

  return (
    <div className="w-full text-blue-100 flex flex-col  h-full">
      <div className="flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-blue-800 px-5 py-3 font-semibold text-blue-100 transition-colors hover:bg-blue-600"
        >
          Refresh Courses
        </button>
      </div>
      <div className="flex flex-row min-h-0 justify-center flex-1">
        <CoursesList
          courses={courses}
          selectedCourseIds={selectedCourseIds}
          onToggleCourse={toggleCourseSelection}
        />
        <div className="w-425 bg-slate-950/50 p-4 rounded-lg m-8">
          <CourseWeekHeatmap courses={coursesForHeatmap} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Refresh Courses"
      >
        <RefreshCourses
          onCoursesRefreshed={(data) => {
            setCourses(data)
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
