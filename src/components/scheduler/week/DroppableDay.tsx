import { FC, ReactNode, useState } from 'react'
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
  const [hoverPosition, setHoverPosition] = useState<{
    percentY: number
    timeString: string
  } | null>(null)

  return (
    <div
      className="relative flex-1 min-h-0 rounded-lg bg-slate-900/30"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'

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

        // Calculate the percentage position for the rounded time
        const roundedPercent =
          ((roundedMinutes - dayStartMinutes) / totalDayMinutes) * 100

        setHoverPosition({ percentY: roundedPercent, timeString })
      }}
      onDragLeave={() => {
        setHoverPosition(null)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setHoverPosition(null)
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

      {/* Hover indicator */}
      {hoverPosition && (
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ top: `${hoverPosition.percentY}%` }}
        >
          <div className="relative">
            <div className="absolute left-0 right-0 h-0.5 bg-blue-400/60" />
            <div className="absolute left-2 -top-3 bg-blue-500 text-white text-xs px-2 py-0.5 rounded shadow-lg">
              {hoverPosition.timeString}
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
