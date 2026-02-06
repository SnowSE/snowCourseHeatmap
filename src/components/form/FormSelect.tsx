export function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full peer
          rounded-lg
          border border-white/20
          bg-white/10 backdrop-blur-sm
          px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
        `}
      >
        <option value=""></option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute left-3 top-0 text-slate-400 text-xs transition-all duration-200 pointer-events-none"
      >
        {label}
      </label>
    </div>
  )
}
