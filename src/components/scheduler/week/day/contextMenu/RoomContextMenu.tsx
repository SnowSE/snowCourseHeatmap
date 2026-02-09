import { FC, useState, useMemo } from 'react'
import type { z } from 'zod'
import { useAddOrUpdateChange } from '@/hooks/useCourseChangeGroups'
import { useCourseChanges } from '../../../contexts/CourseChangesContext'
import { AutoCompleteInput } from '@/components/form/AutoCompleteInput'
import { useCoursesInCurrentTerm } from '@/components/studentSchedules/useCourses'
import { MeetInfoSchema } from '@/schemas/courses'

export const RoomContextMenu: FC<{
  rooms: string[]
  crn: string
  term: string
  courseName?: string
  meetInfo: z.infer<typeof MeetInfoSchema>[]
  instructors: string[]
  onSelectRoom: (room: string) => void
  onClose: () => void
}> = ({
  rooms,
  crn,
  term,
  courseName,
  meetInfo,
  instructors,
  onSelectRoom,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRoom, setEditedRoom] = useState(rooms[0] || '')
  const changeMutation = useAddOrUpdateChange()
  const { activeGroupId } = useCourseChanges()
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const roomOptions = useMemo(() => {
    const roomsSet = new Set<string>()
    courses.forEach((course) => {
      course.meet_info.forEach((meet) => {
        if (meet.building && meet.room) {
          roomsSet.add(`${meet.building} ${meet.room}`)
        }
      })
    })
    return Array.from(roomsSet)
      .sort()
      .map((room) => ({ value: room, label: room }))
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
        targetProfessor: instructors[0] || '',
        timestamp: Date.now(),
        meet_info: meetInfo,
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedRoom(rooms[0] || '')
    setIsEditing(false)
  }

  if (rooms.length === 0 && !isEditing) {
    return null
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">
          {isEditing ? 'Edit Rooms' : 'Select Room Schedule'}
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
          {rooms.length > 0 ? (
            <div className="space-y-1">
              {rooms.map((room, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectRoom(room)
                    onClose()
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors text-slate-200"
                >
                  {room}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No rooms</p>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <AutoCompleteInput
            value={editedRoom}
            onChange={setEditedRoom}
            options={roomOptions}
            label="Room"
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
