import { FC, useState, useEffect, useDeferredValue, useRef } from 'react'
import type { Course } from '../schemas/courses'
import { CourseItem } from './CourseItem'

interface CoursesListProps {
  courses: Course[]
  selectedCourseIds: Set<string>
  onToggleCourse: (crn: string) => void
}

export const CoursesList: FC<CoursesListProps> = ({
  courses,
  selectedCourseIds,
  onToggleCourse,
}) => {
  const [filter, setFilter] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses)
  const [visibleCount, setVisibleCount] = useState(50)
  const deferredFilter = useDeferredValue(filter)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!deferredFilter) {
      setFilteredCourses(courses)
      return
    }

    const searchTerms = deferredFilter
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0)

    const filtered = courses.filter((course) => {
      const searchableText = [
        course.name.toLowerCase(),
        course.subject_code.toLowerCase(),
        course.course_number.toLowerCase(),
        course.crn.toString(),
        ...course.instructors.map((inst) => inst.name.toLowerCase()),
      ].join(' ')

      // All search terms must match (AND logic)
      return searchTerms.every((term) => searchableText.includes(term))
    })

    setFilteredCourses(filtered)
    setVisibleCount(50) // Reset visible count when filter changes
  }, [courses, deferredFilter])

  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      // Load more when scrolled to within 200px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setVisibleCount((prev) => Math.min(prev + 50, filteredCourses.length))
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [filteredCourses.length])

  const visibleCourses = filteredCourses.slice(0, visibleCount)

  if (courses.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4 flex flex-col w-130 min-h-0">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">
          Loaded Courses ({filteredCourses.length})
          {visibleCount < filteredCourses.length && (
            <span className="text-sm text-white/50 ml-2">
              (showing {visibleCount})
            </span>
          )}
        </h2>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by multiple terms (e.g., MATH Smith 101)..."
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>
      <ul ref={listRef} className="space-y-2 overflow-y-auto flex-1 min-h-0">
        {visibleCourses.map((course) => (
          <CourseItem
            key={course.crn}
            course={course}
            isSelected={selectedCourseIds.has(course.crn)}
            onToggle={() => onToggleCourse(course.crn)}
          />
        ))}
        {visibleCount < filteredCourses.length && (
          <li className="text-center text-white/50 py-4">Scroll for more...</li>
        )}
      </ul>
    </div>
  )
}
