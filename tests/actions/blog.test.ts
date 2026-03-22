import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRedirect, mockRevalidatePath, mockChain, mockAuth, mockSupabase } = vi.hoisted(() => {
  const mockStorage = {
    upload: vi.fn().mockResolvedValue({ data: { path: 'capas/img.jpg' }, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://storage/img.jpg' } }),
  }
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
  const mockSupabase = {
    auth: mockAuth,
    from: vi.fn().mockReturnValue(mockChain),
    storage: { from: vi.fn().mockReturnValue(mockStorage) },
  }
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

import { criarPost, atualizarPost, excluirPost } from '@/app/actions/blog'

function fd(dados: Record<string, string>): FormData {
  const f = new FormData()
  Object.entries(dados).forEach(([k, v]) => f.append(k, v))
  return f
}

const postValido = {
  titulo: 'Meu Post',
  conteudo: '<p>Conteúdo</p>',
  tags: 'fé, amor',
  publicado: 'true',
}

describe('criarPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
    mockSupabase.from.mockReturnValue(mockChain)
    mockChain.insert.mockResolvedValue({ error: null })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(criarPost(fd(postValido))).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('cria post e redireciona, revalidando paths', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(criarPost(fd(postValido))).rejects.toThrow('REDIRECT:/dashboard/blog')
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Meu Post', publicado: true, tags: ['fé', 'amor'] })
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/blog')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/blog')
  })

  it('retorna erro quando DB falha', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.insert.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const resultado = await criarPost(fd(postValido))
    expect(resultado?.erro).toBe('DB error')
  })

  it('cria post com tags=null quando campo está vazio', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(criarPost(fd({ ...postValido, tags: '' }))).rejects.toThrow()
    expect(mockChain.insert).toHaveBeenCalledWith(expect.objectContaining({ tags: null }))
  })
})

describe('atualizarPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(atualizarPost('post-1', fd(postValido))).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('atualiza post e redireciona', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    await expect(atualizarPost('post-1', fd(postValido))).rejects.toThrow(
      'REDIRECT:/dashboard/blog'
    )
  })
})

describe('excluirPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(excluirPost('post-1')).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('deleta post e revalida paths', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    await excluirPost('post-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/blog')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/blog')
  })
})
