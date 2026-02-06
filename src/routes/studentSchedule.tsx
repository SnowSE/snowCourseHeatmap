import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { StudentSchedulesList } from '@/components/studentSchedules/StudentSchedulesList'
import { StudentScheduleCreateForm } from '@/components/studentSchedules/StudentScheduleCreateForm'
import { StudentScheduleForm } from '@/components/studentSchedules/StudentScheduleForm'
import { StudentScheduleDetails } from '@/components/studentSchedules/StudentScheduleDetails'
import { Modal } from '@/components/Modal'
import {
  useCreateStudentSchedule,
  useUpdateStudentSchedule,
  useStudentSchedule,
} from '@/hooks/useStudentSchedules'

export const Route = createFileRoute('/studentSchedule')({
  component: StudentSchedulePage,
})

function StudentSchedulePage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewingId, setViewingId] = useState<number | null>(null)

  const createSchedule = useCreateStudentSchedule()
  const updateSchedule = useUpdateStudentSchedule()
  const { data: editingSchedule } = useStudentSchedule(editingId || 0)

  const handleCreate = (name: string) => {
    createSchedule.mutate(
      { name, classes: [] },
      {
        onSuccess: (newSchedule) => {
          setIsCreating(false)
          setEditingId(newSchedule.id!)
        },
      },
    )
  }

  const handleUpdateName = (name: string) => {
    if (editingId && editingSchedule) {
      updateSchedule.mutate({
        id: editingId,
        name,
        classes: editingSchedule.classes,
      })
    }
  }

  const handleAddClass = (department: string, courseName: string) => {
    if (editingId && editingSchedule) {
      const updatedClasses = [
        ...editingSchedule.classes,
        { department, course_name: courseName },
      ]
      updateSchedule.mutate({
        id: editingId,
        name: editingSchedule.name,
        classes: updatedClasses,
      })
    }
  }

  const handleRemoveClass = (index: number) => {
    if (editingId && editingSchedule) {
      const updatedClasses = editingSchedule.classes.filter(
        (_, i) => i !== index,
      )
      updateSchedule.mutate({
        id: editingId,
        name: editingSchedule.name,
        classes: updatedClasses,
      })
    }
  }

  const handleEdit = (id: number) => {
    setEditingId(id)
    setViewingId(null)
  }

  return (
    <div className="h-full flex">
      <div className="w-80 border-r border-white/10 p-4">
        <StudentSchedulesList
          onCreateNew={() => setIsCreating(true)}
          onEdit={handleEdit}
        />
      </div>

      <div className="flex-1">
        {viewingId ? (
          <StudentScheduleDetails scheduleId={viewingId} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50">
            Select a schedule or create a new one
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Schedule"
      >
        <StudentScheduleCreateForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isSubmitting={createSchedule.isPending}
        />
      </Modal>

      <Modal
        isOpen={editingId !== null}
        onClose={() => setEditingId(null)}
        title="Edit Schedule"
      >
        {editingSchedule && (
          <StudentScheduleForm
            schedule={editingSchedule}
            onCancel={() => setEditingId(null)}
            onAddClass={handleAddClass}
            onRemoveClass={handleRemoveClass}
            onUpdateName={handleUpdateName}
          />
        )}
      </Modal>
    </div>
  )
}
