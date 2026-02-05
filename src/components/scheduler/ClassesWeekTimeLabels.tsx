import { FC, useMemo } from 'react'

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
}

export const ClassesWeekTimeLabels: FC<{
  startTime: string
  endTime: string
}
> = ({
  startTime,
  endTime,
}) => {
  const timeLabels = useMemo(() => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    const totalMinutes = endMinutes - startMinutes

    const labels: { time: string; topPercent: number }[] = []

    // Generate hourly labels
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += 60) {
      const topPercent = ((minutes - startMinutes) / totalMinutes) * 100
      labels.push({
        time: minutesToTime(minutes),
        topPercent,
      })
    }

    return labels
  }, [startTime, endTime])

  return (
    <div className="flex flex-col gap-2 w-20 flex-shrink-0">
      <h3 className="text-lg font-semibold text-transparent text-center">
        Time
      </h3>
      <div className="relative flex-1 min-h-150 pr-2">
        {timeLabels.map((label, idx) => (
          <div
            key={idx}
            className="absolute right-0 text-xs text-white/70 -translate-y-1/2"
            style={{ top: `${label.topPercent}%` }}
          >
            {label.time}
          </div>
        ))}
      </div>
    </div>
  )
}
