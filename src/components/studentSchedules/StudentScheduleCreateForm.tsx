import { useState } from 'react'
import { TextInput } from '@/components/form/TextInput'

export const StudentScheduleCreateForm = ({
  onSubmit,
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
    <form onSubmit={handleSubmit} className="gap-2 flex">
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
    </form>
  )
}
