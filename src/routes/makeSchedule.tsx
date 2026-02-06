import { ScheduleViewer } from '@/components/scheduler/ScheduleViewer'
import { CourseDragProvider } from '@/components/scheduler/contexts/CourseDragContext'
import { CourseOwnerProvider } from '@/components/scheduler/contexts/CourseOwnerContext'
import { CourseChangesProvider } from '@/components/scheduler/contexts/CourseChangesContext'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/makeSchedule')({
  component: MakeSchedule,
})

function MakeSchedule() {
  return (
    <div className="w-full text-blue-100 flex flex-col h-full">
      <CourseOwnerProvider>
        <CourseChangesProvider>
          <CourseDragProvider>
            <ScheduleViewer />
          </CourseDragProvider>
        </CourseChangesProvider>
      </CourseOwnerProvider>
    </div>
  )
}
