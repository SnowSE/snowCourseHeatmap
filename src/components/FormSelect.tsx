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
    <div className={`flex min-w-0 flex-1 flex-col gap-1`}>
      <label htmlFor={id} className="text-sm font-medium ">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full
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
    </div>
  )
}
