import { useState, useRef, useEffect } from 'react'
import { TextInput } from './TextInput'

export const AutoCompleteInput: React.FC<{
  value: string
  onChange: (value: string) => void
  options: string[]
  label?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  className?: string
  upperCase?: boolean
}> = ({
  value,
  onChange,
  options,
  label,
  onKeyDown,
  className = '',
  upperCase = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = value
    ? options.filter((option) =>
        option.toLowerCase().startsWith(value.toLowerCase()),
      )
    : []

  const selectOption = (option: string) => {
    onChange(option)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
      onChange(filteredOptions[selectedIndex])
    }
  }, [selectedIndex, filteredOptions, onChange])

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
        className={className}
        upperCase={upperCase}
      />
      {showSuggestions && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => selectOption(option)}
              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-blue-500/30 transition-colors ${
                index === selectedIndex ? 'bg-blue-500/20' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
