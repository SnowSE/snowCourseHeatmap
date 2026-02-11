import { useCourseOwner } from '@/components/scheduler/contexts/CourseOwnerContext'

export function useIsHashTarget(id: string): boolean {
  const { selectedHashTarget } = useCourseOwner()
  return selectedHashTarget === id
}
