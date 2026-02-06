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

  return (
    <div className="h-full flex">
      <div className="w-80 flex flex-col min-h-0">
        <div className="space-y-3 pb-3">
          <TextInput
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Search professors rooms and schedules"
          />
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
