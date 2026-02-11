import { FC } from 'react'
import { getShortcutString, TextInput } from '@/components/form/TextInput'
import { useCourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'

export const FilterOwners: FC<{
  filter: string
  onFilterChange: (value: string) => void
  isSidebarVisible: boolean
  onToggleSidebar: () => void
}> = ({ filter, onFilterChange, isSidebarVisible, onToggleSidebar }) => {
  const { selectedCourseOwners, clearAllCourseOwners } = useCourseOwner()

  return (
    <div className="w-80 space-y-3 pb-3 flex flex-col">
      <div className="flex min-h-0">
        <TextInput
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          label={`Search (${getShortcutString('k')})`}
          shortcutKey="k"
        />
        <button
          onClick={onToggleSidebar}
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
  )
}
