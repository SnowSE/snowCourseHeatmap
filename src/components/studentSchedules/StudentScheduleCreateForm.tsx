import { useState } from 'react'
import { TextInput } from '@/components/form/TextInput'

export const StudentScheduleCreateForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (name: string) => void
  onCancel: () => void
  isSubmitting: boolean
}) => {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <TextInput
          id="schedule-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Schedule Name"
          required
          autoFocus
          className="w-full rounded-lg 
                     border border-slate-200/20 bg-slate-200/10 
                     px-4 pt-5 pb-2 text-slate-50 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <p className="text-xs text-slate-200/50 mt-2">
          You'll be able to add classes after creating the schedule
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-lg 
                     border border-slate-200/20 bg-slate-200/5 
                     hover:bg-slate-200/10 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     px-4 py-2.5 text-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex-1 rounded-lg 
                     border border-slate-200/20 bg-blue-500/30 
                     hover:bg-blue-500/40 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     px-4 py-2.5 text-slate-50 font-medium transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  )
}
