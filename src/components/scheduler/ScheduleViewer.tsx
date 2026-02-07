import { useState } from 'react'
import { ScheduleOwnerList } from './ScheduleOwnerList'
import { ScheduleOwnerWeekDisplay } from './week/ScheduleOwnerWeekDisplay'
import { CourseChangesList } from './changes/CourseChangesList'
import { useCourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'
import { TextInput } from '@/components/form/TextInput'

export const ScheduleViewer = () => {
  const { selectedCourseOwners, clearAllCourseOwners, deserializeCourseOwner } =
    useCourseOwner()
  const [filter, setFilter] = useState('')
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  return (
    <div className="h-full flex">
      <div
        className="flex flex-col min-h-0 transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: isSidebarVisible ? '20rem' : '0' }}
      >
        <div className="w-80 space-y-3 pb-3 flex flex-col">
          <div className="flex min-h-0">
            <TextInput
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Search"
            />
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="h-full w-8 ml-1 flex items-center justify-center rounded-lg 
                          border border-slate-700 bg-slate-800/50 
                          hover:bg-slate-700/50 
                          transition-colors shrink-0"
              title={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${isSidebarVisible ? '' : 'rotate-180'}`}
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
          <button
            onClick={clearAllCourseOwners}
            disabled={selectedCourseOwners.length === 0}
            className="w-full rounded-lg 
            border border-white/20 bg-red-500/20 
                       hover:bg-red-500/30 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors"
          >
            Clear Selection ({selectedCourseOwners.length})
          </button>
        </div>
        <ScheduleOwnerList filter={filter} />
      </div>
      {!isSidebarVisible && (
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="h-8 w-8 ml-1 flex items-center justify-center rounded-lg 
                          border border-slate-700 bg-slate-800/50 
                          hover:bg-slate-700/50 
                          transition-colors shrink-0"
          title={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isSidebarVisible ? '' : 'rotate-180'}`}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      )}
      <div className=" flex-1 flex flex-wrap content-start justify-center-safe overflow-y-auto">
        {Array.from(selectedCourseOwners).map((key) => {
          const owner = deserializeCourseOwner(key)
          if (!owner) return null
          return (
            <div key={key} className="p-2">
              <ScheduleOwnerWeekDisplay owner={owner} />
            </div>
          )
        })}
      </div>
      <div className="w-96">
        <CourseChangesList />
      </div>
    </div>
  )
}
