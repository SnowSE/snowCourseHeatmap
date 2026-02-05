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
  const [copied, setCopied] = useState(false)

  const textToCopy = `
  copy(
    JSON.parse(
      localStorage.getItem("oidc.user:https://kc.snow.edu/realms/snowcollege/:portal")
    ).access_token
  );
  console.log("Auth token copied to clipboard");`

  return (
    <div className="">
      <div className="relative mb-4">
        <pre className="text-wrap p-1 bg-slate-950 text-sm rounded-md pr-20">
          {textToCopy}
        </pre>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="absolute right-1 top-1 rounded bg-blue-900 px-3 py-1 text-xs font-medium text-white hover:bg-blue-800 transition-colors flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
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
