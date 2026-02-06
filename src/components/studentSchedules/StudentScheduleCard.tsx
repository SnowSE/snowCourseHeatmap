import { useState, useMemo } from 'react'
import { Calendar, Trash2, X } from 'lucide-react'
import {
  useDeleteStudentSchedule,
  useUpdateStudentSchedule,
  useRemoveClassFromSchedule,
} from '@/hooks/useStudentSchedules'
import { useCourses } from '@/hooks/useCourses'
import type { StudentSchedule } from '@/schemas/studentSchedule'
import { AddClassForm } from './AddClassForm'
import { EditStudentScheduleName } from './EditStudentScheduleName'

export const StudentScheduleCard: React.FC<{
  schedule: StudentSchedule
}> = ({ schedule }) => {
  const [isEditing, setIsEditing] = useState(false)
  const deleteSchedule = useDeleteStudentSchedule()
  const updateSchedule = useUpdateStudentSchedule()
  const removeClass = useRemoveClassFromSchedule()
  const { data: coursesData = {} } = useCourses()

  const courseTitleMap = useMemo(() => {
    const map = new Map<string, string>()
    Object.values(coursesData).forEach((courses) => {
      courses.forEach((course) => {
        const key = `${course.subject_code}-${course.course_number}`
        if (!map.has(key)) {
          map.set(key, course.name)
        }
      })
    })
    return map
  }, [coursesData])

  const handleUpdateName = (newName: string) => {
    updateSchedule.mutate({
      id: schedule.id!,
      name: newName,
      classes: schedule.classes,
    })
    setIsEditing(false)
  }

  const handleAddClass = (department: string, courseName: string) => {
    const updatedClasses = [
      ...schedule.classes,
      { department, course_name: courseName },
    ]
    updateSchedule.mutate({
      id: schedule.id!,
      name: schedule.name,
      classes: updatedClasses,
    })
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <EditStudentScheduleName
              initialName={schedule.name}
              onSave={handleUpdateName}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-blue-400 shrink-0" />
              <h3
                className="font-semibold text-slate-50 text-lg cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {schedule.name}
              </h3>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (confirm(`Delete schedule "${schedule.name}"?`)) {
              deleteSchedule.mutate(schedule.id!)
            }
          }}
          className="p-2 rounded-lg text-slate-200/70 hover:bg-red-500/20 
                    hover:text-red-400 transition-colors"
          title="Delete schedule"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {schedule.classes.length > 0 && (
        <div className="space-y-2">
          {schedule.classes.map((cls: any, index: number) => {
            const courseKey = `${cls.department}-${cls.course_name}`
            const courseTitle = courseTitleMap.get(courseKey)

            return (
              <div
                key={cls.id || index}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/10 bg-slate-200/5 p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-50 font-semibold">
                      {cls.department}
                    </span>
                    <span className="text-slate-200/80">{cls.course_name}</span>
                  </div>
                  {courseTitle && (
                    <div className="text-xs text-slate-200/60 mt-1 truncate">
                      {courseTitle}
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    removeClass.mutate({
                      scheduleId: schedule.id!,
                      department: cls.department,
                      courseName: cls.course_name,
                    })
                  }
                  className="p-1 rounded text-slate-200/50 hover:bg-red-500/20 
                            hover:text-red-400 transition-colors shrink-0"
                  title="Remove class"
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="pt-2 border-t border-slate-200/10">
        <AddClassForm onAdd={handleAddClass} />
      </div>
    </>
  )
}
