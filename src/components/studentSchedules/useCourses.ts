import { createServerFn } from '@tanstack/react-start'
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import z from 'zod'
import { CourseSchema } from '../../schemas/courses'
import { useTerm } from '@/contexts/TermContext'
import { withDatabase } from '@/dbUtils'

const generateTermName = (termCode: string): string => {
  const year = termCode.substring(0, 4)
  const semester = termCode.substring(4)
  const semesterName =
    semester === '10'
      ? 'Spring'
      : semester === '30'
        ? 'Summer'
        : semester === '40'
          ? 'Fall'
          : 'Unknown'
  return `${semesterName} ${year}`
}

const updateCoursesInDatabase = async (term: string, courses: any[]) => {
  withDatabase((db) => {
    db.transaction(() => {
      db.prepare(
        'INSERT OR IGNORE INTO terms (term_code, name) VALUES (@termCode, @name)',
      ).run({
        termCode: term,
        name: generateTermName(term),
      })

      db.prepare('DELETE FROM courses WHERE term_code = @termCode').run({
        termCode: term,
      })

      const insertStmt = db.prepare(
        'INSERT INTO courses (term_code, course_data) VALUES (@termCode, @courseData)',
      )
      for (const course of courses) {
        insertStmt.run({
          termCode: term,
          courseData: JSON.stringify(course),
        })
      }

      // Update the term's updated_at timestamp
      db.prepare(
        "UPDATE terms SET updated_at = strftime('%s', 'now') WHERE term_code = @termCode",
      ).run({
        termCode: term,
      })
    })()
  })
}

export const getStoredCourses = createServerFn().handler(async () => {
  try {
    return withDatabase((db) => {
      const rows = db
        .prepare(
          `
            SELECT c.term_code, c.course_data
            FROM courses c
            JOIN terms t ON c.term_code = t.term_code
            ORDER BY t.term_code
          `,
        )
        .all() as Array<{ term_code: string; course_data: string }>

      // Group courses by term
      const coursesByTerm: Record<string, any[]> = {}
      for (const row of rows) {
        if (!coursesByTerm[row.term_code]) {
          coursesByTerm[row.term_code] = []
        }
        coursesByTerm[row.term_code].push(JSON.parse(row.course_data))
      }

      // Validate and return
      return z.record(z.string(), z.array(CourseSchema)).parse(coursesByTerm)
    })
  } catch (error) {
    // If database doesn't exist or error, return empty object
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

    await updateCoursesInDatabase(term, validatedCourses)

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
