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
          <label htmlFor={campoId} className="text-sm font-medium text-porta">
            {label}
            {props.required && <span className="ml-1 text-sangue">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={campoId}
          className={cn(
            'rounded-md border border-pao bg-white px-3 py-2 text-sm text-black shadow-sm transition-colors placeholder:text-pao focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue disabled:cursor-not-allowed disabled:bg-cordeiro disabled:text-porta',
            erro && 'border-sangue focus:border-sangue focus:ring-sangue',
            className
          )}
          {...props}
        />
        {ajuda && !erro && <p className="text-xs text-pao">{ajuda}</p>}
        {erro && <p className="text-xs text-sangue">{erro}</p>}
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
          <label htmlFor={campoId} className="text-sm font-medium text-porta">
            {label}
            {props.required && <span className="ml-1 text-sangue">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={campoId}
          className={cn(
            'min-h-[100px] rounded-md border border-pao bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-pao focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue disabled:cursor-not-allowed disabled:bg-cordeiro',
            erro && 'border-sangue focus:border-sangue focus:ring-sangue',
            className
          )}
          {...props}
        />
        {erro && <p className="text-xs text-sangue">{erro}</p>}
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
          <label htmlFor={campoId} className="text-sm font-medium text-porta">
            {label}
            {props.required && <span className="ml-1 text-sangue">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={campoId}
          className={cn(
            'rounded-md border border-pao bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue disabled:cursor-not-allowed disabled:bg-cordeiro',
            erro && 'border-sangue focus:border-sangue focus:ring-sangue',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {erro && <p className="text-xs text-sangue">{erro}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Campo, Textarea, Select }
