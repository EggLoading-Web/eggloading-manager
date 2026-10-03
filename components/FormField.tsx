type FormFieldProps = {
  label?: string
  error?: string
  children: React.ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}

export const inputBaseClass =
  'w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition'

export const inputErrorClass =
  'border-red-500 dark:border-red-500 focus:ring-red-500'