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
        className="w-full rounded-lg pt-4 px-4 pb-1
                   border border-slate-700 bg-slate-900 
                   text-slate-200
                   backdrop-blur-sm 
                   focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
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
