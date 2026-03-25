import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface PropsBadge extends HTMLAttributes<HTMLSpanElement> {
  variante?: 'padrao' | 'sucesso' | 'aviso' | 'perigo' | 'info'
}

function Badge({ className, variante = 'padrao', ...props }: PropsBadge) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-cordeiro text-porta': variante === 'padrao',
          'bg-green-100 text-green-800': variante === 'sucesso',
          'bg-yellow-100 text-yellow-800': variante === 'aviso',
          'bg-red-100 text-sangue': variante === 'perigo',
          'bg-pao/30 text-porta': variante === 'info',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
