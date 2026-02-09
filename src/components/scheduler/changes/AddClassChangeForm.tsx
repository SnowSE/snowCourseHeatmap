import { useAddOrUpdateChange } from '@/hooks/useCourseChangeGroups'
import { FC, useState, useMemo } from 'react'
import { Modal } from '@/components/Modal'
import { TextInput } from '@/components/form/TextInput'
import { AutoCompleteInput } from '@/components/form/AutoCompleteInput'
import { useCoursesInCurrentTerm } from '@/components/studentSchedules/useCourses'
import { useCourseChanges } from '../contexts/CourseChangesContext'
import { useTerm } from '@/contexts/TermContext'
import type { MeetInfo } from '@/schemas/courses'

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const AddClassChangeForm: FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  const addOrUpdateChangeMutation = useAddOrUpdateChange()
  const { activeGroupId } = useCourseChanges()
  const { selectedTerm } = useTerm()
  const { data: courses = [] } = useCoursesInCurrentTerm()

  const [courseName, setCourseName] = useState('')
  const [professorName, setProfessorName] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startHour, setStartHour] = useState('8')
  const [startMinute, setStartMinute] = useState('0')
  const [endHour, setEndHour] = useState('9')
  const [endMinute, setEndMinute] = useState('0')
  const [error, setError] = useState<string | null>(null)

  // Extract unique professors from courses
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

  // Extract unique rooms from courses
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

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!activeGroupId) {
      setError('Please select a change group first')
      return
    }

    if (!courseName.trim()) {
      setError('Please enter a course name')
      return
    }

    if (!professorName.trim()) {
      setError('Please enter a professor name')
      return
    }

    // Generate random CRN (5-digit number)
    const generatedCrn = String(Math.floor(10000 + Math.random() * 90000))

    if (selectedDays.length === 0) {
      setError('Please select at least one day')
      return
    }

    const startTime = `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}`
    const endTime = `${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}`

    const meetInfo: MeetInfo = {
      days: selectedDays,
      start_time: startTime,
      end_time: endTime,
      building: selectedRoom ? selectedRoom.split(' ')[0] : null,
      building_code: null,
      room: selectedRoom ? selectedRoom.split(' ').slice(1).join(' ') : null,
    }

    try {
      await addOrUpdateChangeMutation.mutateAsync({
        groupId: activeGroupId,
        change: {
          crn: generatedCrn,
          term: selectedTerm,
          courseName: courseName.trim(),
          targetProfessor: professorName.trim(),
          meet_info: [meetInfo],
          timestamp: Date.now(),
        },
      })

      // Reset form
      setCourseName('')
      setProfessorName('')
      setSelectedRoom('')
      setSelectedDays([])
      setStartHour('8')
      setStartMinute('0')
      setEndHour('9')
      setEndMinute('0')
      setError(null)

      onClose()
    } catch (error) {
      console.error('Failed to add course change:', error)
      setError('Failed to add course change. Please try again.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Course Change">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <TextInput
            label="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="e.g., CMSC 131"
          />
        </div>

        <div>
          <AutoCompleteInput
            label="Professor Name"
            value={professorName}
            onChange={setProfessorName}
            options={professorOptions}
          />
        </div>

        <div>
          <AutoCompleteInput
            label="Room"
            value={selectedRoom}
            onChange={setSelectedRoom}
            options={roomOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Days of Week
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDays.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Start Time
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-20 rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-700"
                placeholder="HH"
              />
              <span className="text-slate-400">:</span>
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                className="w-20 rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-700"
                placeholder="MM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              End Time
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="23"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-20 rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-700"
                placeholder="HH"
              />
              <span className="text-slate-400">:</span>
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
                className="w-20 rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-700"
                placeholder="MM"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addOrUpdateChangeMutation.isPending}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addOrUpdateChangeMutation.isPending ? 'Adding...' : 'Add Change'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
