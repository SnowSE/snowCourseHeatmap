import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import z from 'zod'
import { CourseSchema, type Course } from '../schemas/courses'
import { RefreshCourses } from '../components/RefreshCourses'
import { CoursesList } from '../components/CoursesList'
import { CourseWeekHeatmap } from '@/components/CourseWeekHeatmap'

export const Route = createFileRoute('/')({ component: App })

const getStoredCourses = createServerFn().handler(async () => {
  const fs = await import('fs/promises')
  const data = await fs.readFile('courses.json', 'utf-8')
  const json = JSON.parse(data)
  return z.array(CourseSchema).parse(json)
})

function App() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    getStoredCourses().then((data) => {
      setCourses(data)
    })
  }, [])

  return (
    <div className="w-full  text-blue-100">
      <div className="flex justify-center">
        <RefreshCourses onCoursesRefreshed={setCourses} />
      </div>
      <div className="flex w-full justify-center">
        <div>
          <CoursesList courses={courses} />
        </div>
        <div className="w-425 bg-slate-950/50 p-4 rounded-lg m-8">
          <CourseWeekHeatmap courses={courses} />
        </div>
      </div>
    </div>
  )
}
