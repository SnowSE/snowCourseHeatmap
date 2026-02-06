import { useState } from 'react'
import { useRefreshCourses } from '../hooks/useCourses'
import { FormSelect } from './form/FormSelect'
import type { Course } from '../schemas/courses'

function generateTermOptions() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Determine current term based on month
  let currentTermYear = currentYear
  let currentTermSemester: number

  if (currentMonth >= 1 && currentMonth <= 5) {
    currentTermSemester = 10 // Spring
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    currentTermSemester = 30 // Summer
  } else {
    currentTermSemester = 40 // Fall
  }

  const terms: Array<{ value: string; label: string }> = []

  // Generate current term + next 3 terms
  for (let i = 0; i < 4; i++) {
    const termYear = currentTermYear
    const termSemester = currentTermSemester

    const semesterName =
      termSemester === 10 ? 'Spring' : termSemester === 30 ? 'Summer' : 'Fall'
    terms.push({
      value: `${termYear}${termSemester}`,
      label: `${semesterName} ${termYear}`,
    })

    // Calculate next term
    if (currentTermSemester === 10) {
      currentTermSemester = 30
    } else if (currentTermSemester === 30) {
      currentTermSemester = 40
    } else {
      currentTermSemester = 10
      currentTermYear++
    }
  }

  return terms
}

export function RefreshCourses({
  onCoursesRefreshed,
}: {
  onCoursesRefreshed: (courses: Course[]) => void
}) {
  const termOptions = generateTermOptions()
  const refreshMutation = useRefreshCourses()
  const [authToken, setAuthToken] = useState('')
  const [term, setTerm] = useState(termOptions[0].value)
  const [copied, setCopied] = useState(false)

  const textToCopy = `copy(
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
            window.open('https://my.snow.edu', '_blank')
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
          refreshMutation.mutate(
            { authToken, term },
            {
              onSuccess: (data) => {
                onCoursesRefreshed(data)
              },
            },
          )
        }}
      >
        <FormSelect
          id="term"
          label="Term"
          value={term}
          onChange={setTerm}
          options={termOptions}
        />
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
