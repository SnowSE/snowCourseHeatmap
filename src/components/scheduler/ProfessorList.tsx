import { useCoursesInCurrentTerm } from '@/hooks/useCourses'
import {
  useState,
  useEffect,
  useDeferredValue,
  useRef,
  useMemo,
  FC,
} from 'react'

interface ProfessorListProps {
  filter: string
  selectedProfessors: Set<string>
  onToggleProfessor: (professorName: string) => void
}

export const ProfessorList: FC<ProfessorListProps> = ({
  filter,
  selectedProfessors,
  onToggleProfessor,
}) => {
  const { data: courses = [] } = useCoursesInCurrentTerm()
  const [visibleCount, setVisibleCount] = useState(50)
  const deferredFilter = useDeferredValue(filter)
  const listRef = useRef<HTMLDivElement>(null)

  const coursesByProfessor = useMemo(
    () =>
      courses.reduce(
        (acc, course) => {
          course.instructors.forEach((instructor) => {
            if (!acc[instructor.name]) {
              acc[instructor.name] = []
            }
            acc[instructor.name].push(course)
          })
          return acc
        },
        {} as Record<string, typeof courses>,
      ),
    [courses],
  )

  const professorEntries = useMemo(() => {
    let entries = Object.entries(coursesByProfessor).map(
      ([professor, courses]) => ({
        professor,
        courses,
        creditCount: courses.reduce(
          (sum, course) => sum + course.credit_hours,
          0,
        ),
      }),
    )

    // Filter by professor name
    if (deferredFilter) {
      const searchTerm = deferredFilter.toLowerCase()
      entries = entries.filter((entry) =>
        entry.professor.toLowerCase().includes(searchTerm),
      )
    }

    // Sort alphabetically by professor name
    return entries.sort((a, b) => a.professor.localeCompare(b.professor))
  }, [coursesByProfessor, deferredFilter])

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
        setVisibleCount((prev) => Math.min(prev + 50, professorEntries.length))
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [professorEntries.length])

  const visibleProfessors = professorEntries.slice(0, visibleCount)

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div
        ref={listRef}
        className="flex flex-col gap-2 
                   border border-slate-600/50 rounded-lg p-3 
                   bg-slate-950/30 backdrop-blur-sm 
                   overflow-y-auto flex-1 min-h-0"
      >
        {visibleProfessors.map(({ professor, courses, creditCount }) => {
          const isSelected = selectedProfessors.has(professor)
          return (
            <div
              key={professor}
              onClick={() => onToggleProfessor(professor)}
              className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-600/40 ring-2 ring-blue-500/50 hover:bg-blue-600/50'
                  : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="text-white font-medium">{professor}</div>
              <div className="text-sm text-white/70">
                {creditCount} credit{creditCount !== 1 ? 's' : ''} (
                {courses.length} course{courses.length !== 1 ? 's' : ''})
              </div>
            </div>
          )
        })}
        {visibleCount < professorEntries.length && (
          <div className="text-center text-white/50 py-4">
            Scroll for more...
          </div>
        )}
      </div>
    </div>
  )
}
