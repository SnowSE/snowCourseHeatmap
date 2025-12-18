import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import z from 'zod'
import { CourseSchema, type Course } from '../schemas/courses'
import { writeFile } from 'fs/promises'

export const refreshCourses = createServerFn()
  .inputValidator(
    z.object({
      authToken: z.string(),
    }),
  )
  .handler(async ({ data: { authToken } }) => {
    const term = '202610'
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
    const json = await response.json()
    await writeFile('courses.json', JSON.stringify(json, null, 2), 'utf-8')

    return z.array(CourseSchema).parse(json)
  })

interface RefreshCoursesProps {
  onCoursesRefreshed: (courses: Course[]) => void
}

export function RefreshCourses({ onCoursesRefreshed }: RefreshCoursesProps) {
  const [authToken, setAuthToken] = useState('')

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-6 shadow-lg backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">Refresh Courses</h2>
      <p className="mt-1 text-sm text-white/70">
        Paste your <code className="text-white/90">jwt</code> auth token to
        fetch latest courses.
      </p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault()
          const data = await refreshCourses({ data: { authToken } })
          onCoursesRefreshed(data)
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label
            htmlFor="authToken"
            className="text-sm font-medium text-white/90"
          >
            Auth token
          </label>
          <input
            id="authToken"
            type="text"
            value={authToken}
            onChange={(e) => {
              if (e.target.value.includes('=')) {
                setAuthToken(e.target.value.split('=')[1].trim())
              } else {
                setAuthToken(e.target.value)
              }
            }}
            placeholder="Enter auth token"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-500/50"
        >
          Refresh Courses
        </button>
      </form>
    </div>
  )
}
