import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRedirect, mockRevalidatePath, mockChain, mockAuth, mockSupabase } = vi.hoisted(() => {
  const mockChain: Record<string, ReturnType<typeof vi.fn>> = {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
  }
  mockChain.eq.mockReturnValue(mockChain)
  mockChain.delete.mockReturnValue(mockChain)
  mockChain.insert.mockResolvedValue({ error: null })
  mockChain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

  const mockAuth = { getUser: vi.fn() }
  const mockSupabase = { auth: mockAuth, from: vi.fn().mockReturnValue(mockChain) }

  // redirect lança erro para simular o comportamento do Next.js
  const mockRedirect = vi.fn().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  })

  return { mockRedirect, mockRevalidatePath: vi.fn(), mockChain, mockAuth, mockSupabase }
})

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))
vi.mock('@/lib/supabase/server', () => ({
  criarClienteServidor: vi.fn().mockResolvedValue(mockSupabase),
}))

import { criarEvento, atualizarEvento, excluirEvento } from '@/app/actions/eventos'

function fd(dados: Record<string, string>): FormData {
  const f = new FormData()
  Object.entries(dados).forEach(([k, v]) => f.append(k, v))
  return f
}

const eventoValido = {
  titulo: 'Culto de Domingo',
  descricao: 'Culto semanal',
  data: '2024-03-17',
  hora: '10:00',
  local: 'Sede',
  tipo: 'culto',
}

describe('criarEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
    mockSupabase.from.mockReturnValue(mockChain)
    mockChain.insert.mockResolvedValue({ error: null })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(criarEvento(fd(eventoValido))).rejects.toThrow('REDIRECT:/auth/login')
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
  })

  it('retorna erro quando Supabase falha', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.insert.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const resultado = await criarEvento(fd(eventoValido))
    expect(resultado?.erro).toBe('DB error')
  })

  it('insere evento e redireciona quando válido', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(criarEvento(fd(eventoValido))).rejects.toThrow('REDIRECT:/dashboard/eventos')
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Culto de Domingo', tipo: 'culto', criado_por: 'u1' })
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/eventos')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/eventos')
  })
})

describe('atualizarEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(atualizarEvento('ev-1', fd(eventoValido))).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('atualiza evento e redireciona', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    await expect(atualizarEvento('ev-1', fd(eventoValido))).rejects.toThrow(
      'REDIRECT:/dashboard/eventos'
    )
  })
})

describe('excluirEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(excluirEvento('ev-1')).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('deleta evento e revalida paths', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    await excluirEvento('ev-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/eventos')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/eventos')
  })
})
