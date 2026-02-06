import { ScheduleViewer } from '@/components/scheduler/ScheduleViewer'
import { CourseDragProvider } from '@/contexts/CourseDragContext'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/makeSchedule')({
  component: MakeSchedule,
})

function MakeSchedule() {
  return (
    <div className="w-full text-blue-100 flex flex-col h-full">
      <CourseDragProvider>
        <ScheduleViewer />
      </CourseDragProvider>
    </div>
  )
}
