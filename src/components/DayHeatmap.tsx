import { Course } from '@/schemas/courses'
import { FC, useState, useRef } from 'react'

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
type TimeSlot = string
type WeekSchedule = Record<DayOfWeek, Record<TimeSlot, Course[]>>

// Convert 24-hour time to 12-hour AM/PM format
function formatTime12Hour(time24: string): string {
  const [hour, minute] = time24.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

// Generate 5-minute intervals between start and end time
function generateTimeSlots(startTime: string, endTime: string): TimeSlot[] {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const slots: TimeSlot[] = []
  let currentHour = startHour
  let currentMin = startMin

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    slots.push(timeSlot)

    currentMin += 5
    if (currentMin >= 60) {
      currentMin = 0
      currentHour++
    }
  }

  return slots
}

export const DayHeatmap: FC<{
  weekSchedule: WeekSchedule
  day: DayOfWeek
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  slotHeight: string // Tailwind height class (e.g., "h-2")
  slotWidth: string // Tailwind width class (e.g., "w-20")
  maxCount: number // Maximum course count across all time slots
}> = ({
  weekSchedule,
  day,
  startTime,
  endTime,
  slotHeight,
  slotWidth,
  maxCount,
}) => {
  const timeSlots = generateTimeSlots(startTime, endTime)
  const daySchedule = weekSchedule[day]
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (
    timeSlot: string,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPopupPosition({ x: rect.right + 10, y: rect.top })

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSlot(timeSlot)
    }, 250)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoveredSlot(null)
  }

  return (
    <div className={`flex flex-col ${slotWidth} relative`}>
      <h3 className="mb-2 text-center text-blue-300">
        {day.toLocaleLowerCase().slice(0, 3)}
      </h3>
      <div className="flex flex-col ">
        {timeSlots.map((timeSlot) => {
          const courses = daySchedule[timeSlot]
          const courseCount = courses.length

          return (
            <div
              key={timeSlot}
              className={`${slotHeight} cursor-pointer transition-opacity hover:opacity-80`}
              style={{
                backgroundColor:
                  courseCount > 0
                    ? `rgba(59, 130, 246, ${Math.min(courseCount / maxCount, 1)})`
                    : 'rgba(0, 0, 0, 0.2)',
              }}
              onMouseEnter={(e) => handleMouseEnter(timeSlot, e)}
              onMouseLeave={handleMouseLeave}
            ></div>
          )
        })}
      </div>

      {hoveredSlot && daySchedule[hoveredSlot]?.length > 0 && (
        <div
          className="fixed z-50 bg-slate-900/95 border border-blue-400/50 rounded-lg p-3 shadow-2xl backdrop-blur-sm max-w-md"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
        >
          <div className="text-xs text-blue-300 font-semibold mb-2">
            {formatTime12Hour(hoveredSlot)} - {day}
          </div>
          <ul className="space-y-1.5">
            {daySchedule[hoveredSlot].map((course, idx) => (
              <li
                key={`${course.crn}-${idx}`}
                className="text-sm text-white/90"
              >
                <span className="font-medium text-blue-200">
                  {course.subject_code} {course.course_number}
                </span>
                {' - '}
                <span className="text-white/70">{course.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
