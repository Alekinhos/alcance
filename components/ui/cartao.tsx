import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface PropsCartao extends HTMLAttributes<HTMLDivElement> {}

function Cartao({ className, ...props }: PropsCartao) {
  return (
    <div
      className={cn('rounded-lg border border-pao bg-white shadow-sm', className)}
      {...props}
    />
  )
}

function CartaoHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-6', className)} {...props} />
}

function CartaoTitulo({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-porta', className)} {...props} />
}

function CartaoDescricao({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-pao', className)} {...props} />
}

function CartaoConteudo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

function CartaoRodape({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
}

export { Cartao, CartaoHeader, CartaoTitulo, CartaoDescricao, CartaoConteudo, CartaoRodape }
