import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTerm } from '../contexts/TermContext'
import { FormSelect } from './form/FormSelect'
import { Modal } from './Modal'
import { RefreshCourses } from './RefreshCourses'
import { useQueryClient } from '@tanstack/react-query'

export const Header = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { selectedTerm, setSelectedTerm, termOptions } = useTerm()

  return (
    <>
      <header className=" bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-8">
            <nav className="flex gap-1">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg text-blue-300 hover:text-blue-100 hover:bg-slate-800/50 font-medium transition-all"
                activeProps={{
                  className: 'bg-slate-800 text-blue-100',
                }}
              >
                Course Heatmap
              </Link>
              <Link
                to="/makeSchedule"
                className="px-4 py-2 rounded-lg text-blue-300 hover:text-blue-100 hover:bg-slate-800/50 font-medium transition-all"
                activeProps={{
                  className: 'bg-slate-800 text-blue-100',
                }}
              >
                Make Schedule
              </Link>
              <Link
                to="/studentSchedule"
                className="px-4 py-2 rounded-lg text-blue-300 hover:text-blue-100 hover:bg-slate-800/50 font-medium transition-all"
                activeProps={{
                  className: 'bg-slate-800 text-blue-100',
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
                className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg active:scale-95"
              >
                Refresh Courses
              </button>
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
