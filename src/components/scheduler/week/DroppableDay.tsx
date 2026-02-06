import { FC, ReactNode } from 'react'
import { useCourseDrag } from '@/contexts/CourseDragContext'
import { CourseOwner } from '@/contexts/CourseOwnerContext'

interface DroppableDayProps {
  day: string
  dayStartMinutes: number
  dayEndMinutes: number
  totalDayMinutes: number
  owner?: CourseOwner
  timeGridLines: number[]
  children: ReactNode
}

export const DroppableDay: FC<DroppableDayProps> = ({
  day,
  dayStartMinutes,
  totalDayMinutes,
  owner,
  timeGridLines,
  children,
}) => {
  const { handleDrop } = useCourseDrag()

  return (
    <div
      className="relative flex-1 min-h-0 rounded-lg bg-slate-900/30"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (!owner) return

        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const percentY = (y / rect.height) * 100
        const droppedMinutes =
          dayStartMinutes + (percentY / 100) * totalDayMinutes

        // Round to nearest 30-minute interval
        const roundedMinutes = Math.round(droppedMinutes / 30) * 30
        const hours = Math.floor(roundedMinutes / 60)
        const minutes = roundedMinutes % 60
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

        handleDrop(day, timeString, owner.professorName, owner.roomName)
      }}
    >
      {/* Time grid lines */}
      {timeGridLines.map((topPercent, idx) => (
        <div
          key={idx}
          className="absolute left-0 right-0 border-t border-slate-700/30"
          style={{ top: `${topPercent}%` }}
        />
      ))}

      {children}
    </div>
  )
}
