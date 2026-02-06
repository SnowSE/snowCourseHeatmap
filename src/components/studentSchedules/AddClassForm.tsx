import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useDepartments } from '@/hooks/useDepartments'
import { useCourseNumbers } from '@/hooks/useCourseNumbers'
import { AutoCompleteInput } from '@/components/form/AutoCompleteInput'

export const AddClassForm = ({
  onAdd,
}: {
  onAdd: (department: string, courseName: string) => void
}) => {
  const [department, setDepartment] = useState('')
  const [courseName, setCourseName] = useState('')
  const departments = useDepartments()
  const courseNumbers = useCourseNumbers(department)

  const handleAdd = () => {
    if (department.trim() && courseName.trim()) {
      onAdd(department.trim().toUpperCase(), courseName.trim())
      setDepartment('')
      setCourseName('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <AutoCompleteInput
          value={department}
          onChange={setDepartment}
          options={departments}
          label="Department"
          onKeyDown={handleKeyDown}
          upperCase
          className="w-32 rounded-lg 
                     border border-white/20 bg-white/10 
                     px-3 pt-5 pb-2 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <AutoCompleteInput
          value={courseName}
          onChange={setCourseName}
          options={courseNumbers}
          label="Course Number"
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg 
                     border border-white/20 bg-white/10 
                     px-3 pt-5 pb-2 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!department.trim() || !courseName.trim()}
          className="px-4 py-2 rounded-lg 
                     border border-white/20 bg-blue-500/20 
                     hover:bg-blue-500/30 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     text-white transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
      <p className="text-xs text-white/50 mt-2">Press Enter to add a class</p>
    </>
  )
}
