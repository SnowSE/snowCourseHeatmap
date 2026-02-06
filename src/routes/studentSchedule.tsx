import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { StudentScheduleCard } from '@/components/studentSchedules/StudentScheduleCard'
import { StudentScheduleCreateForm } from '@/components/studentSchedules/StudentScheduleCreateForm'
import {
  useCreateStudentSchedule,
  useStudentSchedules,
} from '@/hooks/useStudentSchedules'

export const Route = createFileRoute('/studentSchedule')({
  component: StudentSchedulePage,
})

function StudentSchedulePage() {
  const [isCreating, setIsCreating] = useState(false)

  const { data: schedules = [], isLoading } = useStudentSchedules()
  const createSchedule = useCreateStudentSchedule()

  const handleCreate = (name: string) => {
    createSchedule.mutate(
      { name, classes: [] },
      {
        onSuccess: () => {
          setIsCreating(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-200/70">
        Loading schedules...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className=" mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-50">
            Student Schedules
          </h1>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 rounded-lg border border-slate-200/20 bg-blue-500/20 
                      hover:bg-blue-500/30 text-slate-50 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Schedule
          </button>
        </div>

        {isCreating && (
          <div className="rounded-lg border border-slate-200/20 bg-slate-200/5 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">
              Create New Schedule
            </h3>
            <StudentScheduleCreateForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
              isSubmitting={createSchedule.isPending}
            />
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="text-slate-200/50 text-center py-12 border border-slate-200/10 rounded-lg">
            No schedules yet. Create one to get started!
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-lg bg-slate-950/50 p-6 space-y-4"
              >
                <StudentScheduleCard schedule={schedule} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
