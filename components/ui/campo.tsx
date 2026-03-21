import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  erro?: string
  ajuda?: string
}

const Campo = forwardRef<HTMLInputElement, PropsCampo>(
  ({ className, label, erro, ajuda, id, ...props }, ref) => {
    const campoId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={campoId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={campoId}
          className={cn(
            'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            erro && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {ajuda && !erro && <p className="text-xs text-gray-500">{ajuda}</p>}
        {erro && <p className="text-xs text-red-600">{erro}</p>}
      </div>
    )
  }
)

Campo.displayName = 'Campo'

interface PropsTextarea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  erro?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, PropsTextarea>(
  ({ className, label, erro, id, ...props }, ref) => {
    const campoId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={campoId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={campoId}
          className={cn(
            'min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50',
            erro && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {erro && <p className="text-xs text-red-600">{erro}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface PropsSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  erro?: string
}

const Select = forwardRef<HTMLSelectElement, PropsSelect>(
  ({ className, label, erro, id, children, ...props }, ref) => {
    const campoId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={campoId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={campoId}
          className={cn(
            'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50',
            erro && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {erro && <p className="text-xs text-red-600">{erro}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Campo, Textarea, Select }
