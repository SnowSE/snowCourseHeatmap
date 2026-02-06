import { useStudentSchedule } from '@/hooks/useStudentSchedules'
import { Calendar, BookOpen } from 'lucide-react'

export const StudentScheduleDetails = ({
  scheduleId,
}: {
  scheduleId: number
}) => {
  const { data: schedule, isLoading } = useStudentSchedule(scheduleId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white/70">
        Loading schedule...
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-full text-white/70">
        Schedule not found
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={24} className="text-blue-400" />
            <h2 className="text-2xl font-bold text-white">{schedule.name}</h2>
          </div>
          <p className="text-white/60">
            {schedule.classes.length}{' '}
            {schedule.classes.length === 1 ? 'class' : 'classes'}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            Classes
          </h3>
          {schedule.classes.length === 0 ? (
            <div className="text-white/50 text-center py-8 border border-white/10 rounded-lg">
              No classes in this schedule
            </div>
          ) : (
            <div className="space-y-2">
              {schedule.classes.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-lg border border-white/20 bg-white/5 p-4"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-semibold text-lg">
                      {cls.department}
                    </span>
                    <span className="text-white/80 text-lg">
                      {cls.course_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
