'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface PropsBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma'
  tamanho?: 'sm' | 'md' | 'lg'
  carregando?: boolean
}

const Botao = forwardRef<HTMLButtonElement, PropsBotao>(
  ({ className, variante = 'primario', tamanho = 'md', carregando, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || carregando}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600': variante === 'primario',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500': variante === 'secundario',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600': variante === 'perigo',
            'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500': variante === 'fantasma',
          },
          {
            'h-8 px-3 text-sm': tamanho === 'sm',
            'h-10 px-4 text-sm': tamanho === 'md',
            'h-12 px-6 text-base': tamanho === 'lg',
          },
          className
        )}
        {...props}
      >
        {carregando ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

Botao.displayName = 'Botao'

export { Botao }
