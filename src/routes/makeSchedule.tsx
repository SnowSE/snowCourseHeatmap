import { ScheduleViewer } from '@/components/scheduler/ScheduleViewer'
import { CourseDragProvider } from '@/contexts/CourseDragContext'
import { CourseOwnerProvider } from '@/contexts/CourseOwnerContext'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/makeSchedule')({
  component: MakeSchedule,
})

function MakeSchedule() {
  return (
    <div className="w-full text-blue-100 flex flex-col h-full">
      <CourseOwnerProvider>
        <CourseDragProvider>
          <ScheduleViewer />
        </CourseDragProvider>
      </CourseOwnerProvider>
    </div>
  )
}
