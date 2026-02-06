export const TextInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    label?: string
    className?: string
    upperCase?: boolean
    inputRef?: React.RefObject<HTMLInputElement | null>
  }
> = ({ label, className = '', upperCase = false, inputRef, ...props }) => {
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder=" "
        className={`w-full peer ${className} ${upperCase ? 'uppercase' : ''}`}
        {...props}
      />
      {label && (
        <label
          className="absolute left-3 top-2 text-slate-100/50 text-sm transition-all duration-200 pointer-events-none
                     peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm
                     peer-focus:top-0 peer-focus:text-xs peer-focus:text-slate-400
                     peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-400"
        >
          {label}
        </label>
      )}
    </div>
  )
}
