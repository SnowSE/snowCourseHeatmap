import { useState } from 'react'

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
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Fall 2024 Schedule"
          required
          autoFocus
          className="w-full rounded-lg 
                     border border-white/20 bg-white/10 
                     px-4 py-2.5 text-white placeholder-white/50 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <p className="text-xs text-white/50 mt-2">
          You'll be able to add classes after creating the schedule
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-lg 
                     border border-white/20 bg-white/5 
                     hover:bg-white/10 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     px-4 py-2.5 text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex-1 rounded-lg 
                     border border-white/20 bg-blue-500/30 
                     hover:bg-blue-500/40 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     px-4 py-2.5 text-white font-medium transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  )
}
