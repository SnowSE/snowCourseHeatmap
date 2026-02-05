import { Course } from '@/schemas/courses'
import { FC, useMemo } from 'react'
import { DayHeatmap } from './DayHeatmap'
import { TimeLabels } from './TimeLabels'

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
export type TimeSlot = string // Format: "HH:MM" (e.g., "08:00", "08:05", etc.)
export type WeekSchedule = Record<DayOfWeek, Record<TimeSlot, Course[]>>

// Generate all 5-minute intervals from 00:00 to 23:55
function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeSlot)
    }
  }
  return slots
}

// Initialize empty week schedule
function createEmptyWeekSchedule(): WeekSchedule {
  const days: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]
  const timeSlots = generateTimeSlots()

  const schedule: WeekSchedule = {} as WeekSchedule

  days.forEach((day) => {
    schedule[day] = {}
    timeSlots.forEach((slot) => {
      schedule[day][slot] = []
    })
  })

  return schedule
}

export const CourseWeekHeatmap: FC<{ courses: Course[] }> = ({ courses }) => {
  const weekSchedule = useMemo(() => {
    const schedule = createEmptyWeekSchedule()

    // Populate schedule with course data
    courses.forEach((course) => {
      course.meet_info.forEach((meeting) => {
        const startTime = meeting.start_time
        const endTime = meeting.end_time
        if (!startTime || !endTime) return

        meeting.days.forEach((day) => {
          if (day in schedule) {
            const start = startTime.substring(0, 5) // "HH:MM:SS" -> "HH:MM"
            const end = endTime.substring(0, 5)

            // Increment count for each 5-minute slot between start and end time
            const [startHour, startMin] = start.split(':').map(Number)
            const [endHour, endMin] = end.split(':').map(Number)

            let currentHour = startHour
            let currentMin = Math.floor(startMin / 5) * 5 // Round down to nearest 5-min interval

            while (
              currentHour < endHour ||
              (currentHour === endHour && currentMin < endMin)
            ) {
              const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
              schedule[day as DayOfWeek][timeSlot].push(course)

              currentMin += 5
              if (currentMin >= 60) {
                currentMin = 0
                currentHour++
              }
            }
          }
        })
      })
    })

    return schedule
  }, [courses])

  const maxCount = useMemo(() => {
    let max = 0
    Object.values(weekSchedule).forEach((daySchedule) => {
      Object.values(daySchedule).forEach((courses) => {
        max = Math.max(max, courses.length)
      })
    })
    return max || 1 // Avoid division by zero
  }, [weekSchedule])

  const days: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]

  const slotHeight = 'h-2'
  const slotWidth = 'w-50'
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-white">
        Course Week Heatmap
      </h2>
      <div className="flex overflow-x-auto">
        <TimeLabels startTime="08:00" endTime="18:00" slotHeight={slotHeight} />
        {days.map((day) => (
          <DayHeatmap
            key={day}
            weekSchedule={weekSchedule}
            day={day}
            startTime="08:00"
            endTime="18:00"
            slotHeight={slotHeight}
            slotWidth={slotWidth}
            maxCount={maxCount}
          />
        ))}
      </div>
    </div>
  )
}
