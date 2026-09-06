import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTerm } from '../contexts/TermContext'
import { FormSelect } from './form/FormSelect'
import { Modal } from './Modal'
import { RefreshCourses } from './RefreshCourses'
import { useQueryClient } from '@tanstack/react-query'
import type { SessionUser } from '../auth/session'

export const Header = ({ user }: { user: SessionUser }) => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { selectedTerm, setSelectedTerm, termOptions } = useTerm()

  const activeClassName =
    'bg-slate-800 text-blue-100 rounded border-b-2 border-blue-400'
  const linkClass =
    'px-4 py-2  text-blue-200 hover:text-blue-100 hover:bg-slate-800/50 font-medium transition-all'
  return (
    <>
      <header className=" ">
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <div className="flex items-center justify-between gap-8">
            <nav className="flex gap-1">
              <Link
                to="/"
                className={linkClass}
                activeProps={{
                  className: activeClassName,
                }}
              >
                Course Heatmap
              </Link>
              <Link
                to="/makeSchedule"
                className={linkClass}
                activeProps={{
                  className: activeClassName,
                }}
              >
                Make Schedule
              </Link>
              <Link
                to="/studentSchedule"
                className={linkClass}
                activeProps={{
                  className: activeClassName,
                }}
              >
                Student Schedule
              </Link>
            </nav>
            <div className="flex items-center gap-4">
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
                className="rounded-lg bg-blue-900 px-5 py-2.5 font-semibold text-slate-100 shadow-md transition-all hover:bg-blue-800 hover:shadow-lg text-nowrap"
              >
                Refresh Courses
              </button>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs text-slate-400" title={user.email}>
                  {user.name ?? user.email}
                </span>
                <a
                  href="/auth/logout"
                  className="text-xs font-medium text-blue-300 transition-colors hover:text-blue-100"
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

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
    </>
  )
}
