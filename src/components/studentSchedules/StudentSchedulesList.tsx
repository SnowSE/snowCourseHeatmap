import { useState } from 'react'
import {
  useStudentSchedules,
  useDeleteStudentSchedule,
} from '@/hooks/useStudentSchedules'
import { Plus, Trash2, Edit, Calendar } from 'lucide-react'

export const StudentSchedulesList = ({
  onCreateNew,
  onEdit,
}: {
  onCreateNew: () => void
  onEdit: (id: number) => void
}) => {
  const { data: schedules = [], isLoading } = useStudentSchedules()
  const deleteSchedule = useDeleteStudentSchedule()
  const [filter, setFilter] = useState('')

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.name.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete schedule "${name}"?`)) {
      deleteSchedule.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white/70">
        Loading schedules...
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-3 pb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search schedules"
          className="w-full rounded-lg 
                     border border-white/20 bg-white/10 
                     px-4 py-2 text-white placeholder-white/50 
                     backdrop-blur-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button
          onClick={onCreateNew}
          className="w-full rounded-lg 
                     border border-white/20 bg-blue-500/20 
                     hover:bg-blue-500/30 
                     px-4 py-2.5 text-white
                     transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Schedule
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredSchedules.length === 0 ? (
          <div className="text-white/50 text-center py-8">
            {filter ? 'No schedules match your search' : 'No schedules yet'}
          </div>
        ) : (
          filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-lg border border-white/20 bg-white/5 
                         hover:bg-white/10 transition-colors p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-blue-400 shrink-0" />
                    <h3 className="font-semibold text-white truncate">
                      {schedule.name}
                    </h3>
                  </div>
                  <p className="text-sm text-white/60">
                    {schedule.classes.length}{' '}
                    {schedule.classes.length === 1 ? 'class' : 'classes'}
                  </p>
                  {schedule.classes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {schedule.classes.slice(0, 3).map((cls) => (
                        <div
                          key={cls.id}
                          className="text-xs text-white/50 truncate"
                        >
                          {cls.department} {cls.course_name}
                        </div>
                      ))}
                      {schedule.classes.length > 3 && (
                        <div className="text-xs text-white/40">
                          +{schedule.classes.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(schedule.id!)}
                    className="p-2 rounded-lg text-white/70 hover:bg-white/10 
                               hover:text-white transition-colors"
                    title="Edit schedule"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id!, schedule.name)}
                    className="p-2 rounded-lg text-white/70 hover:bg-red-500/20 
                               hover:text-red-400 transition-colors"
                    title="Delete schedule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
