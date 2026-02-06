import { Fragment, useState } from 'react'
import { ScheduleOwnerList } from './ScheduleOwnerList'
import { ProfessorWeekDisplay } from './ProfessorWeekDisplay'

export const ScheduleViewer = () => {
  const [selectedProfessors, setSelectedProfessors] = useState<Set<string>>(
    new Set(),
  )
  const [professorFilter, setProfessorFilter] = useState('')

  const toggleProfessor = (professorName: string) => {
    setSelectedProfessors((prev) => {
      const next = new Set(prev)
      if (next.has(professorName)) {
        next.delete(professorName)
      } else {
        next.add(professorName)
      }
      return next
    })
  }

  const clearAllProfessors = () => {
    setSelectedProfessors(new Set())
  }

  return (
    <div className="h-full flex">
      <div className="w-80 flex flex-col min-h-0">
        <div className="space-y-3 pb-3">
          <input
            type="text"
            value={professorFilter}
            onChange={(e) => setProfessorFilter(e.target.value)}
            placeholder="Search"
            className="w-full rounded-lg 
                       border border-white/20 bg-white/10 
                       px-4 py-2 text-white placeholder-white/50 
                       backdrop-blur-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            onClick={clearAllProfessors}
            disabled={selectedProfessors.size === 0}
            className="w-full rounded-lg 
                       border border-white/20 bg-red-500/20 
                       hover:bg-red-500/30 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors"
          >
            Clear Selection ({selectedProfessors.size})
          </button>
        </div>
        <ScheduleOwnerList
          filter={professorFilter}
          selectedProfessors={selectedProfessors}
          onToggleProfessor={toggleProfessor}
        />
      </div>
      <div className=" flex flex-wrap flex-1 overflow-y-auto">
        {Array.from(selectedProfessors).map((professor) => (
          <div key={professor} className=" p-3">
            <ProfessorWeekDisplay professorName={professor} />
          </div>
        ))}
      </div>
    </div>
  )
}
