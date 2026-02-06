import { useState } from 'react'
import { TextInput } from '@/components/form/TextInput'

export const EditStudentScheduleName: React.FC<{
  initialName: string
  onSave: (name: string) => void
  onCancel: () => void
}> = ({ initialName, onSave, onCancel }) => {
  const [editedName, setEditedName] = useState(initialName)

  const handleSave = () => {
    if (editedName.trim() && editedName !== initialName) {
      onSave(editedName.trim())
    } else {
      onCancel()
    }
  }

  return (
    <div className="flex gap-2 items-start">
      <TextInput
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave()
          } else if (e.key === 'Escape') {
            onCancel()
          }
        }}
        label="Schedule Name"
        className="flex-1 rounded-lg border border-slate-200/20 bg-slate-200/10 
                  px-3 pt-5 pb-2 text-slate-50 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        autoFocus
      />
      <button
        onClick={handleSave}
        className="px-3 py-2 mt-1 rounded-lg border border-slate-200/20 bg-blue-500/20 
                  hover:bg-blue-500/30 text-slate-50 text-sm transition-colors"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-2 mt-1 rounded-lg border border-slate-200/20 bg-slate-200/10 
                  hover:bg-slate-200/20 text-slate-50 text-sm transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
