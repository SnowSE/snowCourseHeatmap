import {
  useCourseOwner,
  CourseOwner,
  serializeCourseOwner,
} from '@/components/scheduler/contexts/CourseOwnerContext'

export function useScrollToOwner() {
  const { addCourseOwner, setSelectedHashTarget } = useCourseOwner()

  const scrollToOwner = (owner: CourseOwner) => {
    const ownerId = serializeCourseOwner(owner)

    addCourseOwner(owner, () => {
      history.replaceState(null, '', `#${ownerId}`)
      setSelectedHashTarget(ownerId)
      const element = document.getElementById(ownerId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }

  return scrollToOwner
}
