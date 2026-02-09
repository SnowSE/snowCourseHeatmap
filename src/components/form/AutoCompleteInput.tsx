import { useState, useRef } from 'react'
import { TextInput } from './TextInput'

const fuzzyMatch = (searchTerm: string, target: string): boolean => {
  if (!searchTerm) return true

  const search = searchTerm.toLowerCase().replace(/\s+/g, '')
  const text = target.toLowerCase().replace(/\s+/g, '')

  let searchIndex = 0

  for (let i = 0; i < text.length && searchIndex < search.length; i++) {
    if (text[i] === search[searchIndex]) {
      searchIndex++
    }
  }

  return searchIndex === search.length
}

export const AutoCompleteInput: React.FC<{
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  upperCase?: boolean
}> = ({ value, onChange, options, label, onKeyDown, upperCase = false }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = value
    ? options.filter(
        (option) =>
          fuzzyMatch(value, option.value) || fuzzyMatch(value, option.label),
      )
    : []

  const selectOption = (option: { value: string; label: string }) => {
    onChange(option.value)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
        selectOption(filteredOptions[selectedIndex])
      } else if (onKeyDown) {
        onKeyDown(e)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    } else if (onKeyDown) {
      onKeyDown(e)
    }
  }

  return (
    <div className="relative w-full">
      <TextInput
        inputRef={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
          setSelectedIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        label={label}
        upperCase={upperCase}
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option)}
              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-blue-500/30 transition-colors ${
                index === selectedIndex ? 'bg-blue-500/20' : ''
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{option.value}</span>
                <span className="text-slate-300/70 text-xs">
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
