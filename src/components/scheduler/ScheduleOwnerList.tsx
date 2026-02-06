import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import { useCourseOwners } from '@/hooks/useCourseOwners'
import { useState, useEffect, useDeferredValue, useRef, FC } from 'react'
import { useCourseOwner, CourseOwner } from '@/contexts/CourseOwnerContext'

interface ProfessorListProps {
  filter: string
}

export const ScheduleOwnerList: FC<ProfessorListProps> = ({ filter }) => {
  const { selectedCourseOwners, toggleCourseOwner } = useCourseOwner()
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const [visibleCount, setVisibleCount] = useState(50)
  const deferredFilter = useDeferredValue(filter)
  const listRef = useRef<HTMLDivElement>(null)

  const courseOwnerEntries = useCourseOwners(courses, deferredFilter)

  useEffect(() => {
    setVisibleCount(50) // Reset visible count when filter changes
  }, [deferredFilter])

  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      // Load more when scrolled to within 200px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setVisibleCount((prev) =>
          Math.min(prev + 50, courseOwnerEntries.length),
        )
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [courseOwnerEntries.length])

  const visibleOwners = courseOwnerEntries.slice(0, visibleCount)

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div
        ref={listRef}
        className="flex flex-col gap-2 
                   border border-slate-600/50 rounded-lg p-3 
                   bg-slate-950/30 backdrop-blur-sm 
                   overflow-y-auto flex-1 min-h-0"
      >
        {visibleOwners.map(
          ({ key, owner, displayName, type, courses, creditCount }) => {
            const isSelected = selectedCourseOwners.has(key)
            return (
              <div
                key={key}
                onClick={() => toggleCourseOwner(owner)}
                className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/40 ring-2 ring-blue-500/50 hover:bg-blue-600/50'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{displayName}</span>
                </div>
                <div>
                  {creditCount}{' '}
                  <span className="text-sm text-white/70">cred.</span>
                </div>
              </div>
            )
          },
        )}
        {visibleCount < courseOwnerEntries.length && (
          <div className="text-center text-white/50 py-4">
            Scroll for more...
          </div>
        )}
      </div>
    </div>
  )
}
