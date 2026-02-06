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
}

const STORAGE_KEY = 'selectedCourseOwners'

const serializeCourseOwner = (owner: CourseOwner): string => {
  if (owner.professorName) return `professor:${owner.professorName}`
  if (owner.roomName) return `room:${owner.roomName}`
  return ''
}

const deserializeCourseOwner = (key: string): CourseOwner | null => {
  const [type, ...nameParts] = key.split(':')
  const name = nameParts.join(':')
  if (type === 'professor') return { professorName: name }
  if (type === 'room') return { roomName: name }
  return null
}

const loadFromLocalStorage = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      return new Set(parsed)
    }
  } catch (error) {
    console.error(
      'Failed to load selected course owners from localStorage:',
      error,
    )
  }
  return new Set()
}

const saveToLocalStorage = (selectedOwners: Set<string>) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(selectedOwners)),
    )
  } catch (error) {
    console.error(
      'Failed to save selected course owners to localStorage:',
      error,
    )
  }
}

const CourseOwnerContext = createContext<
  | {
      selectedCourseOwners: Set<string>
      addCourseOwner: (owner: CourseOwner) => void
      removeCourseOwner: (owner: CourseOwner) => void
      toggleCourseOwner: (owner: CourseOwner) => void
      clearAllCourseOwners: () => void
      deserializeCourseOwner: (key: string) => CourseOwner | null
    }
  | undefined
>(undefined)

export function CourseOwnerProvider({ children }: { children: ReactNode }) {
  const [selectedCourseOwners, setSelectedCourseOwners] = useState<Set<string>>(
    () => loadFromLocalStorage(),
  )

  useEffect(() => {
    saveToLocalStorage(selectedCourseOwners)
  }, [selectedCourseOwners])

  const addCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const removeCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const toggleCourseOwner = (owner: CourseOwner) => {
    const key = serializeCourseOwner(owner)
    setSelectedCourseOwners((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const clearAllCourseOwners = () => {
    setSelectedCourseOwners(new Set())
  }

  return (
    <CourseOwnerContext.Provider
      value={{
        selectedCourseOwners,
        addCourseOwner,
        removeCourseOwner,
        toggleCourseOwner,
        clearAllCourseOwners,
        deserializeCourseOwner,
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
