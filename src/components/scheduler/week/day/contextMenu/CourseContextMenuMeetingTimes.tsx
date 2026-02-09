import { FC, useState } from 'react'
import type { z } from 'zod'
import { MeetInfoSchema } from '@/schemas/courses'
import { useAddOrUpdateChange } from '@/hooks/useCourseChangeGroups'
import { useCourseChanges } from '../../../contexts/CourseChangesContext'

export const CourseContextMenuMeetingTimes: FC<{
  meetInfo: z.infer<typeof MeetInfoSchema>[]
  crn: string
  term: string
  targetProfessor: string
  courseName?: string
}> = ({ meetInfo, crn, term, targetProfessor, courseName }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMeetings, setEditedMeetings] = useState(meetInfo)
  const changeMutation = useAddOrUpdateChange()
  const { activeGroupId } = useCourseChanges()

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
        targetProfessor: targetProfessor || '',
        meet_info: editedMeetings,
        timestamp: Date.now(),
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedMeetings(meetInfo)
    setIsEditing(false)
  }

  const updateMeeting = (
    idx: number,
    field: keyof z.infer<typeof MeetInfoSchema>,
    value: any,
  ) => {
    const updated = [...editedMeetings]
    updated[idx] = { ...updated[idx], [field]: value }
    setEditedMeetings(updated)
  }

  const toggleDay = (meetIdx: number, day: string) => {
    const updated = [...editedMeetings]
    const days = [...updated[meetIdx].days]
    const dayIndex = days.indexOf(day)
    if (dayIndex > -1) {
      days.splice(dayIndex, 1)
    } else {
      days.push(day)
    }
    updated[meetIdx] = { ...updated[meetIdx], days }
    setEditedMeetings(updated)
  }

  return (
    <div className="mb-3 pb-3 border-b border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">Meeting Times</h4>
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
          {meetInfo.map((meet, idx) => (
            <div key={idx} className="text-sm text-slate-300 mb-2">
              <div className="font-mono text-xs">
                {formatDays(meet.days)} {formatTime12Hour(meet.start_time)}-
                {formatTime12Hour(meet.end_time)}
              </div>
              {meet.building && (
                <div className="text-xs text-slate-400">
                  {meet.building} {meet.room}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="space-y-4">
          {editedMeetings.map((meet, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-700/50 rounded border border-slate-600 space-y-3"
            >
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Days
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ].map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(idx, day)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        meet.days.includes(day)
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      {day.slice(0, day === 'Thursday' ? 2 : 1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={meet.start_time || ''}
                    onChange={(e) =>
                      updateMeeting(idx, 'start_time', e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={meet.end_time || ''}
                    onChange={(e) =>
                      updateMeeting(idx, 'end_time', e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-slate-200"
                  />
                </div>
              </div>
            </div>
          ))}

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

const formatTime12Hour = (time: string | null): string => {
  if (!time) return 'N/A'
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

const formatDays = (days: string[]): string => {
  const dayMap: Record<string, string> = {
    Monday: 'M',
    Tuesday: 'T',
    Wednesday: 'W',
    Thursday: 'Th',
    Friday: 'F',
    Saturday: 'Sa',
    Sunday: 'Su',
  }
  return days.map((d) => dayMap[d] || d).join('')
}
