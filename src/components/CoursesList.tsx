import { FC, useState, useEffect, useDeferredValue, useRef } from 'react'
import type { Course } from '../schemas/courses'
import { CourseItem } from './CourseItem'

interface CoursesListProps {
  courses: Course[]
  selectedCourseIds: Set<string>
  onToggleCourse: (crn: string) => void
  onSelectAll?: (crns: string[]) => void
  onClearAll?: () => void
}

export const CoursesList: FC<CoursesListProps> = ({
  courses,
  selectedCourseIds,
  onToggleCourse,
  onSelectAll,
  onClearAll,
}) => {
  const [filter, setFilter] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses)
  const [visibleCount, setVisibleCount] = useState(50)
  const deferredFilter = useDeferredValue(filter)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!deferredFilter) {
      // When no filter, sort with selected courses first
      const sorted = [...courses].sort((a, b) => {
        const aSelected = selectedCourseIds.has(a.crn)
        const bSelected = selectedCourseIds.has(b.crn)
        if (aSelected === bSelected) return 0
        return aSelected ? -1 : 1
      })
      setFilteredCourses(sorted)
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
  }, [courses, deferredFilter, selectedCourseIds])

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

  const handleSelectAll = () => {
    const crnsToSelect = filteredCourses.map((course) => course.crn)
    if (onSelectAll) {
      onSelectAll(crnsToSelect)
    } else {
      // Fallback: toggle each course individually
      crnsToSelect.forEach((crn) => {
        if (!selectedCourseIds.has(crn)) {
          onToggleCourse(crn)
        }
      })
    }
  }

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll()
    } else {
      // Fallback: toggle each selected course
      selectedCourseIds.forEach((crn) => {
        onToggleCourse(crn)
      })
    }
  }

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
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={filteredCourses.length === 0}
            className="flex-1 rounded-lg border border-white/20 bg-blue-500/20 px-4 py-2 text-white hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Select ({filteredCourses.length})
          </button>
          <button
            onClick={handleClearAll}
            disabled={selectedCourseIds.size === 0}
            className="flex-1 rounded-lg border border-white/20 bg-red-500/20 px-4 py-2 text-white hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear ({selectedCourseIds.size})
          </button>
        </div>
      </div>
      <div ref={listRef} className="space-y-2 overflow-y-auto flex-1 min-h-0">
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
      </div>
    </div>
  )
}
