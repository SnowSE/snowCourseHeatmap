import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import {
  useStudentSchedules,
  useStudentScheduleClassList,
} from '@/hooks/useStudentSchedules'
import { FC, useMemo } from 'react'
import { ScheduleWeekDisplay } from './ScheduleWeekDisplay'
import {
  CourseOwner,
  useCourseOwner,
} from '@/components/scheduler/contexts/CourseOwnerContext'
import { useCourseChanges } from '@/components/scheduler/contexts/CourseChangesContext'

export const ScheduleOwnerWeekDisplay: FC<{
  owner: CourseOwner
}> = ({ owner }) => {
  const { removeCourseOwner, addCourseOwner } = useCourseOwner()
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const { data: studentSchedules = [] } = useStudentSchedules()

  const { courseChanges } = useCourseChanges()

  const coursesWithChanges = useMemo(() => {
    if (!courseChanges || courseChanges.length === 0) {
      console.log(
        '[ScheduleOwnerWeekDisplay] No changes, returning original courses:',
        courses.length,
      )
      return courses
    }

    const courseMap = new Map(courses.map((course) => [course.crn, course]))
    console.log(
      '[ScheduleOwnerWeekDisplay] Starting with courses:',
      courseMap.size,
    )
    console.log(
      '[ScheduleOwnerWeekDisplay] Applying changes:',
      courseChanges.length,
    )

    for (const change of courseChanges) {
      const existingCourse = courseMap.get(change.crn)
      if (existingCourse) {
        console.log(
          '[ScheduleOwnerWeekDisplay] Applying change to:',
          change.crn,
          'Target prof:',
          change.targetProfessor,
        )
        const updatedCourse = {
          ...existingCourse,
          meet_info: change.meet_info,
        }

        // If moving to a different professor, update instructors
        if (change.targetProfessor && change.targetProfessor !== '') {
          updatedCourse.instructors = [
            {
              name: change.targetProfessor,
              email: null,
              primary_instructor: true,
            },
          ]
        }

        courseMap.set(change.crn, updatedCourse)
      }
    }

    const result = Array.from(courseMap.values())
    console.log(
      '[ScheduleOwnerWeekDisplay] Final courses after changes:',
      result.length,
    )
    return result
  }, [courses, courseChanges])

  const ownerCourses = useMemo(() => {
    if (owner.professorName) {
      const filtered = coursesWithChanges.filter((course) =>
        course.instructors.some((inst) => inst.name === owner.professorName),
      )
      console.log(
        `[ScheduleOwnerWeekDisplay] Owner: ${owner.professorName}, Courses after filter:`,
        filtered.length,
        'out of',
        coursesWithChanges.length,
      )
      console.log(
        '[ScheduleOwnerWeekDisplay] Filtered courses:',
        filtered
          .map(
            (c) =>
              `${c.subject_code} ${c.course_number} (${c.instructors.map((i) => i.name).join(', ')})`,
          )
          .join(', '),
      )
      return filtered
    } else if (owner.roomName) {
      const filtered = coursesWithChanges.filter((course) =>
        course.meet_info.some((meet) => {
          const roomName = meet.building
            ? `${meet.building} ${meet.room}`
            : meet.room
          return roomName === owner.roomName
        }),
      )
      console.log(
        `[ScheduleOwnerWeekDisplay] Owner: ${owner.roomName}, Courses after filter:`,
        filtered.length,
      )
      return filtered
    } else if (owner.studentScheduleName) {
      // Find the student schedule
      const schedule = studentSchedules.find(
        (s) => s.name === owner.studentScheduleName,
      )
      if (!schedule) {
        return []
      }

      // Match courses based on department and course number
      const filtered = useStudentScheduleClassList(schedule, coursesWithChanges)
      console.log(
        `[ScheduleOwnerWeekDisplay] Owner: ${owner.studentScheduleName}, Courses after filter:`,
        filtered.length,
      )
      return filtered
    }
    return []
  }, [coursesWithChanges, owner, studentSchedules])

  const displayName =
    owner.professorName ||
    owner.roomName ||
    owner.studentScheduleName ||
    'Unknown'

  return (
    <div className="flex flex-col bg-slate-900 rounded-lg border border-slate-600/50 py-3 pe-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <h2 className="text-center font-bold flex-1">{displayName}</h2>
        <button
          onClick={() => removeCourseOwner(owner)}
          className="text-slate-400 hover:text-red-400 transition-colors"
          title="Remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <ScheduleWeekDisplay
        courses={ownerCourses}
        owner={owner}
        onSelectProfessor={(prof) => addCourseOwner({ professorName: prof })}
        onSelectRoom={(room) => addCourseOwner({ roomName: room })}
      />
    </div>
  )
}
