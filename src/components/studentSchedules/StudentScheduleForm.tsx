import { useState } from 'react'
import { X } from 'lucide-react'
import type { StudentSchedule } from '@/schemas/studentSchedule'
import { AddClassForm } from './AddClassForm'

export const StudentScheduleForm = ({
  schedule,
  onCancel,
  onAddClass,
  onRemoveClass,
  onUpdateName,
}: {
  schedule: StudentSchedule
  onCancel: () => void
  onAddClass: (department: string, courseName: string) => void
  onRemoveClass: (index: number) => void
  onUpdateName: (name: string) => void
}) => {
  const [name, setName] = useState(schedule.name)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    if (newName.trim()) {
      onUpdateName(newName.trim())
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="schedule-name"
          className="block text-sm font-medium text-white/80 mb-2"
        >
          Schedule Name
        </label>
        <input
          id="schedule-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g., Fall 2024 Schedule"
          className="w-full rounded-lg 
                     border border-white/20 bg-white/10 
                     px-4 py-2.5 text-white placeholder-white/50 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Classes
        </label>

        <div className="space-y-3 mb-3">
          {schedule.classes.length === 0 ? (
            <div className="text-white/50 text-sm text-center py-4 border border-white/10 rounded-lg">
              No classes added yet
            </div>
          ) : (
            schedule.classes.map((cls, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 p-3"
              >
                <div className="flex-1">
                  <span className="text-white font-medium">
                    {cls.department}
                  </span>
                  <span className="text-white/70 ml-2">{cls.course_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveClass(index)}
                  className="p-1.5 rounded-lg text-white/70 hover:bg-red-500/20 
                             hover:text-red-400 transition-colors"
                  title="Remove class"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <AddClassForm onAdd={onAddClass} />
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-lg 
                     border border-white/20 bg-white/5 
                     hover:bg-white/10 
                     px-4 py-2.5 text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
