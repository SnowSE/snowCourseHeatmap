import { FC, useState, useMemo } from 'react'
import type { z } from 'zod'
import { useAddOrUpdateChange } from '@/hooks/useCourseChangeGroups'
import { useCourseChanges } from '../../../contexts/CourseChangesContext'
import { AutoCompleteInput } from '@/components/form/AutoCompleteInput'
import { useCoursesInCurrentTerm } from '@/components/studentSchedules/useCourses'
import { MeetInfoSchema } from '@/schemas/courses'
import { useScrollToOwner } from '@/hooks/useScrollToOwner'

export const InstructorContextMenu: FC<{
  instructors: string[]
  crn: string
  term: string
  courseName?: string
  meetInfo: z.infer<typeof MeetInfoSchema>[]
  onSelectProfessor: (professor: string) => void
  onClose: () => void
}> = ({
  instructors,
  crn,
  term,
  courseName,
  meetInfo,
  onSelectProfessor,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedInstructor, setEditedInstructor] = useState(instructors[0] || '')
  const changeMutation = useAddOrUpdateChange()
  const { activeGroupId } = useCourseChanges()
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const scrollToOwner = useScrollToOwner()

  const professorOptions = useMemo(() => {
    const professorsSet = new Set<string>()
    courses.forEach((course) => {
      course.instructors.forEach((instructor) => {
        professorsSet.add(instructor.name)
      })
    })
    return Array.from(professorsSet)
      .sort()
      .map((name) => ({ value: name, label: name }))
  }, [courses])

  const handleSave = () => {
    if (!activeGroupId) {
      console.error('No active group selected')
      return
    }

    changeMutation.mutate({
      groupId: activeGroupId,
      change: {
        crn,
        term,
        courseName,
        targetProfessor: editedInstructor || '',
        timestamp: Date.now(),
        meet_info: meetInfo,
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedInstructor(instructors[0] || '')
    setIsEditing(false)
  }

  const handleProfessorClick = (professor: string) => {
    scrollToOwner({ professorName: professor })
    onSelectProfessor(professor)
    onClose()
  }

  if (instructors.length === 0 && !isEditing) {
    return null
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">
          {isEditing ? 'Edit Instructor' : 'Select Professor Schedule'}
        </h4>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded transition-colors text-blue-300"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <>
          {instructors.length > 0 ? (
            <button
              onClick={() => handleProfessorClick(instructors[0])}
              className="w-full text-left px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200"
            >
              {instructors[0]}
            </button>
          ) : (
            <p className="text-sm text-slate-400 italic">No instructor</p>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <AutoCompleteInput
            value={editedInstructor}
            onChange={setEditedInstructor}
            options={professorOptions}
            label="Instructor name"
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
