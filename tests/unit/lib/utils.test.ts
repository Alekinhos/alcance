import { describe, it, expect } from 'vitest'
import { cn, formatarData, formatarDataCurta, formatarMoeda, gerarSlug } from '@/lib/utils'

describe('cn', () => {
  it('combina classes simples', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('resolve conflitos do Tailwind (último ganha)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignora valores falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('aceita objetos condicionais', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })
})

describe('formatarData', () => {
  it('formata data no padrão longo em português', () => {
    // Usa new Date(year, month-1, day) para evitar problemas de fuso horário
    const resultado = formatarData(new Date(2024, 2, 15))
    expect(resultado).toBe('15 de março de 2024')
  })

  it('aceita objeto Date', () => {
    const resultado = formatarData(new Date(2024, 0, 1))
    expect(resultado).toContain('2024')
    expect(resultado).toContain('janeiro')
  })
})

describe('formatarDataCurta', () => {
  it('formata no padrão dd/MM/yyyy', () => {
    const resultado = formatarDataCurta(new Date(2024, 2, 15))
    expect(resultado).toBe('15/03/2024')
  })

  it('aceita objeto Date', () => {
    const resultado = formatarDataCurta(new Date(2024, 11, 25))
    expect(resultado).toBe('25/12/2024')
  })
})

describe('formatarMoeda', () => {
  it('formata valor em BRL', () => {
    const resultado = formatarMoeda(1500)
    expect(resultado).toContain('1.500')
    expect(resultado).toContain('R$')
  })

  it('formata zero corretamente', () => {
    const resultado = formatarMoeda(0)
    expect(resultado).toContain('0')
  })

  it('formata valores com centavos', () => {
    const resultado = formatarMoeda(99.9)
    expect(resultado).toContain('99')
  })
})

describe('gerarSlug', () => {
  it('converte texto simples para slug', () => {
    expect(gerarSlug('Meu Post')).toBe('meu-post')
  })

  it('remove acentos', () => {
    expect(gerarSlug('Ação e Reação')).toBe('acao-e-reacao')
  })

  it('remove caracteres especiais', () => {
    expect(gerarSlug('Olá! Como vai?')).toBe('ola-como-vai')
  })

  it('colapsa múltiplos hífens', () => {
    expect(gerarSlug('um  dois   três')).toBe('um-dois-tres')
  })

  it('converte para minúsculas', () => {
    expect(gerarSlug('TEXTO MAIÚSCULO')).toBe('texto-maiusculo')
  })
})
