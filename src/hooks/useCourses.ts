import { createServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import z from 'zod'
import { CourseSchema } from '../schemas/courses'

export const getStoredCourses = createServerFn().handler(async () => {
  const fs = await import('fs/promises')
  const data = await fs.readFile('courses.json', 'utf-8')
  const json = JSON.parse(data)
  return z.array(CourseSchema).parse(json)
})

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => getStoredCourses(),
  })
}
