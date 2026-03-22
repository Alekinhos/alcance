import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRedirect, mockRevalidatePath, mockChain, mockAuth, mockSupabase } = vi.hoisted(() => {
  const mockChain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  }
  mockChain.select.mockReturnValue(mockChain)
  mockChain.eq.mockReturnValue(mockChain)
  mockChain.delete.mockReturnValue(mockChain)
  mockChain.single.mockResolvedValue({ data: null, error: null })
  mockChain.insert.mockResolvedValue({ error: null })

  const mockAuth = { getUser: vi.fn() }
  const mockSupabase = { auth: mockAuth, from: vi.fn().mockReturnValue(mockChain) }
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

import { criarTransacao, excluirTransacao } from '@/app/actions/financeiro'

function fd(dados: Record<string, string>): FormData {
  const f = new FormData()
  Object.entries(dados).forEach(([k, v]) => f.append(k, v))
  return f
}

const transacaoValida = {
  tipo: 'dizimo',
  valor: '500',
  descricao: 'Dízimo março',
  membro_id: 'membro-1',
  data: '2024-03-01',
}

describe('criarTransacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
    mockSupabase.from.mockReturnValue(mockChain)
    mockChain.select.mockReturnValue(mockChain)
    mockChain.eq.mockReturnValue(mockChain)
    mockChain.single.mockResolvedValue({ data: null, error: null })
    mockChain.insert.mockResolvedValue({ error: null })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(criarTransacao(fd(transacaoValida))).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('retorna erro para usuário sem permissão (lider)', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'lider' }, error: null })
    const resultado = await criarTransacao(fd(transacaoValida))
    expect(resultado?.erro).toMatch(/sem permissão/i)
  })

  it('retorna erro para usuário sem permissão (membro)', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'membro' }, error: null })
    const resultado = await criarTransacao(fd(transacaoValida))
    expect(resultado?.erro).toMatch(/sem permissão/i)
  })

  it('cria transação para admin e redireciona', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'admin' }, error: null })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(criarTransacao(fd(transacaoValida))).rejects.toThrow(
      'REDIRECT:/dashboard/financeiro'
    )
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'dizimo', valor: 500 })
    )
  })

  it('cria transação para pastor e redireciona', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'pastor-1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'pastor' }, error: null })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(criarTransacao(fd(transacaoValida))).rejects.toThrow(
      'REDIRECT:/dashboard/financeiro'
    )
  })

  it('retorna erro quando DB falha', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'admin' }, error: null })
    mockChain.insert.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const resultado = await criarTransacao(fd(transacaoValida))
    expect(resultado?.erro).toBe('DB error')
  })
})

describe('excluirTransacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
    mockSupabase.from.mockReturnValue(mockChain)
    mockChain.eq.mockReturnValue(mockChain)
    mockChain.delete.mockReturnValue(mockChain)
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(excluirTransacao('tx-1')).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('deleta transação e revalida path', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    await excluirTransacao('tx-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/financeiro')
  })
})
