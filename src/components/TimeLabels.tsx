import { FC } from 'react'

export const TimeLabels: FC<{
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  slotHeight: string // Tailwind height class (e.g., "h-2")
}> = ({ startTime, endTime, slotHeight }) => {
  const [startHour] = startTime.split(':').map(Number)
  const [endHour] = endTime.split(':').map(Number)

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  const hourLabels: string[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    hourLabels.push(formatTime(hour, 0))
    hourLabels.push(formatTime(hour, 30))
  }

  // Each 5-minute slot in DayHeatmap, we have 6 slots per 30 minutes
  const slotsPerLabel = 6

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-center font-semibold text-transparent">Time</h3>
      <div className="flex flex-col">
        {hourLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className={`flex items-center justify-end px-2 text-xs text-white/70 ${slotHeight}`}
            style={{
              height: `calc(${slotsPerLabel} * 0.5rem)`, // h-2 = 0.5rem, so 6 slots = 3rem
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
