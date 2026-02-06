import { Fragment, useState } from 'react'
import { ScheduleOwnerList } from './ScheduleOwnerList'
import { ScheduleOwnerWeekDisplay } from './week/ScheduleOwnerWeekDisplay'
import { CourseChangesList } from './changes/CourseChangesList'
import { useCourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'
import { useCourseChanges } from '@/components/scheduler/contexts/CourseChangesContext'

export const ScheduleViewer = () => {
  const { selectedCourseOwners, clearAllCourseOwners, deserializeCourseOwner } =
    useCourseOwner()
  const [filter, setFilter] = useState('')

  const { courseChanges } = useCourseChanges()

  return (
    <div className="h-full flex">
      <div className="w-80 flex flex-col min-h-0">
        <div className="space-y-3 pb-3">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search professors or rooms"
            className="w-full rounded-lg 
                       border border-white/20 bg-white/10 
                       px-4 py-2 text-white placeholder-white/50 
                       backdrop-blur-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            onClick={clearAllCourseOwners}
            disabled={selectedCourseOwners.size === 0}
            className="w-full rounded-lg 
                       border border-white/20 bg-red-500/20 
                       hover:bg-red-500/30 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors"
          >
            Clear Selection ({selectedCourseOwners.size})
          </button>
        </div>
        <ScheduleOwnerList filter={filter} />
      </div>
      <div className=" flex-1 flex flex-wrap content-start overflow-y-auto">
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
