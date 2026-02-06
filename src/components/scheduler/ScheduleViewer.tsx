import { useState } from 'react'
import { ProfessorList, CourseOwner } from './ProfessorList'
import { ProfessorWeekDisplay } from './ProfessorWeekDisplay'

const serializeCourseOwner = (owner: CourseOwner): string => {
  if (owner.professorName) return `professor:${owner.professorName}`
  if (owner.roomName) return `room:${owner.roomName}`
  return ''
}

const deserializeCourseOwner = (key: string): CourseOwner | null => {
  const [type, ...nameParts] = key.split(':')
  const name = nameParts.join(':')
  if (type === 'professor') return { professorName: name }
  if (type === 'room') return { roomName: name }
  return null
}

export const ScheduleViewer = () => {
  const [selectedCourseOwners, setSelectedCourseOwners] = useState<Set<string>>(
    new Set(),
  )
  const [filter, setFilter] = useState('')

  const toggleCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const clearAllSelections = () => {
    setSelectedCourseOwners(new Set())
  }

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
            onClick={clearAllSelections}
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
        <ProfessorList
          filter={filter}
          selectedCourseOwners={selectedCourseOwners}
          onToggleCourseOwner={toggleCourseOwner}
        />
      </div>
      <div className=" flex flex-wrap flex-1 overflow-y-auto">
        {Array.from(selectedCourseOwners).map((key) => {
          const owner = deserializeCourseOwner(key)
          if (!owner) return null
          return (
            <div key={key} className=" p-3">
              <ProfessorWeekDisplay owner={owner} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
