import { FC } from 'react'
import { ConflictInfo } from '@/components/scheduler/contexts/CourseChangesContext'
import { DisplayRoomConflicts } from './DisplayRoomConflicts'
import { DisplayProfessorConflicts } from './DisplayProfessorConflicts'
import { DisplayStudentScheduleConflicts } from './DisplayStudentScheduleConflicts'

export const DisplayConflicts: FC<{
  conflicts: ConflictInfo[]
  targetProfessor: string
}> = ({ conflicts, targetProfessor }) => {
  if (conflicts.length === 0) {
    return null
  }

  const professorConflicts = conflicts.filter(
    (c) => !c.studentSchedule && !c.roomConflict,
  )
  const studentScheduleConflicts = conflicts.filter((c) => c.studentSchedule)
  const roomConflicts = conflicts.filter((c) => c.roomConflict)

  return (
    <div className=" space-y-2">
      <DisplayProfessorConflicts
        professorConflicts={professorConflicts}
        targetProfessor={targetProfessor}
      />

      <DisplayStudentScheduleConflicts
        studentScheduleConflicts={studentScheduleConflicts}
      />

      <DisplayRoomConflicts roomConflicts={roomConflicts} />
    </div>
  )
}
