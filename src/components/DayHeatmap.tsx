import { Course } from '@/schemas/courses'
import { FC } from 'react'

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
type TimeSlot = string
type WeekSchedule = Record<DayOfWeek, Record<TimeSlot, Course[]>>

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

  return (
    <div className={`flex flex-col ${slotWidth}`}>
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
              className={slotHeight}
              style={{
                backgroundColor:
                  courseCount > 0
                    ? `rgba(59, 130, 246, ${Math.min(courseCount / maxCount, 1)})`
                    : 'rgba(0, 0, 0, 0.2)',
              }}
            ></div>
          )
        })}
      </div>
    </div>
  )
}
