import { useEffect, useRef } from 'react'

export const getShortcutString = (key: string): string => {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const modifier = isMac ? '⌘' : 'Ctrl'
  return `${modifier}+${key.toUpperCase()}`
}

export const TextInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    label: string
    upperCase?: boolean
    inputRef?: React.RefObject<HTMLInputElement | null>
    shortcutKey?: string
  }
> = ({ label, upperCase = false, inputRef, shortcutKey, ...props }) => {
  const internalRef = useRef<HTMLInputElement>(null)
  const effectiveRef = inputRef || internalRef

  useEffect(() => {
    if (!shortcutKey) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === shortcutKey.toLowerCase()
      ) {
        e.preventDefault()
        effectiveRef.current?.focus()
        effectiveRef.current?.select()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcutKey, effectiveRef])

  return (
    <div className="relative w-full">
      <input
        ref={effectiveRef}
        type="text"
        {...props}
        className={`peer w-full rounded-lg pt-4 px-4
                    border border-slate-700 bg-slate-900 
                    text-white 
                    backdrop-blur-sm 
                    focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent ${upperCase ? 'uppercase' : ''}`}
        placeholder=" "
      />
      {label && (
        <label
          className="absolute left-3 top-2 text-slate-400 text-sm transition-all duration-200 pointer-events-none
                     peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
                     peer-focus:top-0 peer-focus:text-xs 
                     peer-focus:text-slate-400
                     peer-[:not(:placeholder-shown)]:top-0 
                     peer-[:not(:placeholder-shown)]:text-xs 
                     peer-[:not(:placeholder-shown)]:text-slate-400"
        >
          {label}
        </label>
      )}
    </div>
  )
}
