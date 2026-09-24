import { createContext, useContext, useState, useEffect } from 'react'
import { useCourses } from '../components/studentSchedules/useCourses'

const TermContext = createContext<{
  selectedTerm: string
  setSelectedTerm: (term: string) => void
  termOptions: { value: string; label: string }[]
  availableTerms: string[]
}>({
  selectedTerm: '',
  setSelectedTerm: function (): void {
    throw new Error('Function not implemented.')
  },
  termOptions: [],
  availableTerms: [],
})

export const TermProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: coursesData = {} } = useCourses()
  const availableTerms = Object.keys(coursesData).sort().reverse()
  const termOptions = availableTerms.map((term) => ({
    value: term,
    label: term,
  }))

  const [selectedTerm, setSelectedTerm] = useState(availableTerms[0] || '')

  // Update selectedTerm when availableTerms changes
  useEffect(() => {
    if (availableTerms.length > 0 && !availableTerms.includes(selectedTerm)) {
      setSelectedTerm(availableTerms[0])
    }
  }, [availableTerms, selectedTerm])

  return (
    <TermContext.Provider
      value={{ selectedTerm, setSelectedTerm, termOptions, availableTerms }}
    >
      {children}
    </TermContext.Provider>
  )
}

export const useTerm = () => {
  const context = useContext(TermContext)
  if (context === undefined) {
    throw new Error('useTerm must be used within a TermProvider')
  }
  return context
}
