import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

export interface CourseOwner {
  professorName?: string
  roomName?: string
  studentScheduleName?: string
}

const STORAGE_KEY = 'selectedCourseOwners'

const serializeCourseOwner = (owner: CourseOwner): string => {
  if (owner.professorName) return `professor:${owner.professorName}`
  if (owner.roomName) return `room:${owner.roomName}`
  if (owner.studentScheduleName)
    return `studentSchedule:${owner.studentScheduleName}`
  return ''
}

const deserializeCourseOwner = (key: string): CourseOwner | null => {
  const [type, ...nameParts] = key.split(':')
  const name = nameParts.join(':')
  if (type === 'professor') return { professorName: name }
  if (type === 'room') return { roomName: name }
  if (type === 'studentSchedule') return { studentScheduleName: name }
  return null
}

const loadFromLocalStorage = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as string[]
    }
  } catch (error) {
    console.error(
      'Failed to load selected course owners from localStorage:',
      error,
    )
  }
  return []
}

const saveToLocalStorage = (selectedOwners: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedOwners))
  } catch (error) {
    console.error(
      'Failed to save selected course owners to localStorage:',
      error,
    )
  }
}

const CourseOwnerContext = createContext<
  | {
      selectedCourseOwners: string[]
      ownerNameBeingDragged: string | null
      addCourseOwner: (owner: CourseOwner) => void
      removeCourseOwner: (owner: CourseOwner) => void
      toggleCourseOwner: (owner: CourseOwner) => void
      clearAllCourseOwners: () => void
      deserializeCourseOwner: (key: string) => CourseOwner | null
      handleDragStart: (ownerKey: string) => void
      handleDrop: (targetOwnerKey: string) => void
    }
  | undefined
>(undefined)

export function CourseOwnerProvider({ children }: { children: ReactNode }) {
  const [selectedCourseOwners, setSelectedCourseOwners] = useState<string[]>(
    () => loadFromLocalStorage(),
  )
  const [ownerNameBeingDragged, setOwnerNameBeingDragged] = useState<
    string | null
  >(null)

  useEffect(() => {
    saveToLocalStorage(selectedCourseOwners)
  }, [selectedCourseOwners])

  const addCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => {
      // Check for duplicates
      if (prev.includes(key)) {
        return prev
      }
      return [...prev, key]
    })
  }

  const removeCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => prev.filter((k) => k !== key))
  }

  const toggleCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      } else {
        return [...prev, key]
      }
    })
  }

  const clearAllCourseOwners = () => {
    setSelectedCourseOwners([])
  }

  const handleDragStart = (ownerKey: string) => {
    setOwnerNameBeingDragged(ownerKey)
  }

  const handleDrop = (targetOwnerKey: string) => {
    if (!ownerNameBeingDragged || ownerNameBeingDragged === targetOwnerKey) {
      setOwnerNameBeingDragged(null)
      return
    }

    setSelectedCourseOwners((prev) => {
      const draggedIndex = prev.indexOf(ownerNameBeingDragged)
      const targetIndex = prev.indexOf(targetOwnerKey)

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev
      }

      const newOrder = [...prev]
      // Remove dragged item
      newOrder.splice(draggedIndex, 1)
      // Insert at new position
      newOrder.splice(targetIndex, 0, ownerNameBeingDragged)

      return newOrder
    })

    setOwnerNameBeingDragged(null)
  }

  return (
    <CourseOwnerContext.Provider
      value={{
        selectedCourseOwners,
        ownerNameBeingDragged,
        addCourseOwner,
        removeCourseOwner,
        toggleCourseOwner,
        clearAllCourseOwners,
        deserializeCourseOwner,
        handleDragStart,
        handleDrop,
      }}
    >
      {children}
    </CourseOwnerContext.Provider>
  )
}

export function useCourseOwner() {
  const context = useContext(CourseOwnerContext)
  if (!context) {
    throw new Error('useCourseOwner must be used within CourseOwnerProvider')
  }
  return context
}
