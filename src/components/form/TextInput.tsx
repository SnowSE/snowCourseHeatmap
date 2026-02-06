export const TextInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    label?: string
    upperCase?: boolean
    inputRef?: React.RefObject<HTMLInputElement | null>
  }
> = ({ label, upperCase = false, inputRef, ...props }) => {
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
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
