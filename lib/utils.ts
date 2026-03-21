import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas))
}

export function formatarData(data: string | Date): string {
  return format(new Date(data), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatarDataCurta(data: string | Date): string {
  return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
