import { createServerFn } from '@tanstack/react-start'
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import z from 'zod'
import { CourseSchema } from '../schemas/courses'
import { useTerm } from '@/contexts/TermContext'

const updateCoursesFile = async (term: string, courses: any[]) => {
  const fs = await import('fs/promises')

  // Read existing data
  let existingData: Record<string, any> = {}
  try {
    const fileContent = await fs.readFile('courses.json', 'utf-8')
    existingData = JSON.parse(fileContent)
  } catch (error) {
    // File doesn't exist or is invalid, start fresh
  }

  // Update with new term data
  existingData[term] = courses

  await fs.writeFile(
    'courses.json',
    JSON.stringify(existingData, null, 2),
    'utf-8',
  )
}

export const getStoredCourses = createServerFn().handler(async () => {
  const fs = await import('fs/promises')
  try {
    const data = await fs.readFile('courses.json', 'utf-8')
    const json = JSON.parse(data)
    // Return as dictionary where keys are terms and values are course arrays
    return z.record(z.string(), z.array(CourseSchema)).parse(json)
  } catch (error) {
    // If file doesn't exist or is invalid, return empty object
    return {}
  }
})

export const refreshCourses = createServerFn()
  .inputValidator(
    z.object({
      authToken: z.string(),
      term: z.string(),
    }),
  )
  .handler(async ({ data: { authToken, term } }) => {
    const body = {
      division_codes: [],
      department_codes: [
        'AD',
        'BSCI',
        'BIOL',
        'BUS',
        'CHEM',
        'COMM',
        'ENCS',
        'CM',
        'CED',
        'DANC',
        'EDFS',
        'ENPH',
        'EXSC',
        'GEOL',
        'AHNA',
        'HONR',
        'INDM',
        'ITEC',
        'LALI',
        'MATH',
        'MUSC',
        'NR',
        'NURS',
        'PHSX',
        'STEC',
        'SS',
        'THEA',
        'TRAN',
        'ART',
      ],
      subject_codes: [],
      instructor_codes: [],
    }
    const response = await fetch(
      `https://my.snow.edu/api/faculty/sections/${term}`,
      {
        headers: {
          Cookie: `jwt=${authToken}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
      },
    )
    const coursesData = await response.json()
    const validatedCourses = z.array(CourseSchema).parse(coursesData)

    await updateCoursesFile(term, validatedCourses)

    return validatedCourses
  })

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => getStoredCourses(),
  })
}

export const useCoursesInCurrentTerm = () => {
  const { selectedTerm } = useTerm()
  const { data: coursesData = {} } = useCourses()

  return useSuspenseQuery({
    queryKey: ['courses', 'term', selectedTerm],
    queryFn: () => coursesData[selectedTerm] || [],
  })
}

export function useRefreshCourses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { authToken: string; term: string }) =>
      refreshCourses({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
