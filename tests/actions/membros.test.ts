import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRedirect, mockRevalidatePath, mockChain, mockAuth, mockAdminAuth, mockSupabase } =
  vi.hoisted(() => {
    const mockStorage = {
      upload: vi.fn().mockResolvedValue({ data: { path: 'fotos/u.jpg' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://storage/foto.jpg' } }),
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

    const mockAdminAuth = { createUser: vi.fn(), deleteUser: vi.fn() }
    const mockAuth = { getUser: vi.fn(), admin: mockAdminAuth }
    const mockSupabase = {
      auth: mockAuth,
      from: vi.fn().mockReturnValue(mockChain),
      storage: { from: vi.fn().mockReturnValue(mockStorage) },
    }
    const mockRedirect = vi.fn().mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`)
    })

    return {
      mockRedirect,
      mockRevalidatePath: vi.fn(),
      mockChain,
      mockAuth,
      mockAdminAuth,
      mockSupabase,
    }
  })

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))
vi.mock('@/lib/supabase/server', () => ({
  criarClienteServidor: vi.fn().mockResolvedValue(mockSupabase),
}))

import { criarMembro, atualizarMembro, excluirMembro } from '@/app/actions/membros'

function fd(dados: Record<string, string>): FormData {
  const f = new FormData()
  Object.entries(dados).forEach(([k, v]) => f.append(k, v))
  return f
}

const membroValido = {
  nome: 'Maria Silva',
  email: 'maria@email.com',
  senha: 'Senha123',
  telefone: '11999999999',
  endereco: 'Rua A, 1',
  papel: 'membro',
  data_batismo: '2023-01-01',
  grupo: 'Jovens',
}

describe('criarMembro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
    mockSupabase.from.mockReturnValue(mockChain)
    mockChain.insert.mockResolvedValue({ error: null })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(criarMembro(fd(membroValido))).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('retorna erro quando criação de auth falha', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockAdminAuth.createUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Email already taken' },
    })
    const resultado = await criarMembro(fd(membroValido))
    expect(resultado?.erro).toBe('Email already taken')
  })

  it('cria membro com sucesso e redireciona', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockAdminAuth.createUser.mockResolvedValueOnce({
      data: { user: { id: 'novo-user' } },
      error: null,
    })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(criarMembro(fd(membroValido))).rejects.toThrow('REDIRECT:/dashboard/membros')
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Maria Silva', email: 'maria@email.com', papel: 'membro' })
    )
  })

  it('retorna erro quando inserção do perfil falha', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockAdminAuth.createUser.mockResolvedValueOnce({
      data: { user: { id: 'novo-user' } },
      error: null,
    })
    mockChain.insert.mockResolvedValueOnce({ error: { message: 'Perfil error' } })
    const resultado = await criarMembro(fd(membroValido))
    expect(resultado?.erro).toBe('Perfil error')
  })
})

describe('atualizarMembro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(atualizarMembro('m-1', fd(membroValido))).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('atualiza membro e redireciona', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    await expect(atualizarMembro('m-1', fd(membroValido))).rejects.toThrow(
      'REDIRECT:/dashboard/membros'
    )
  })

  it('retorna erro quando update falha', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockSupabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update error' } }),
      }),
    })
    const resultado = await atualizarMembro('m-1', fd(membroValido))
    expect(resultado?.erro).toBe('Update error')
  })
})

describe('excluirMembro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
  })

  it('redireciona para login quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(excluirMembro('m-1')).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('deleta perfil e usuário auth', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockSupabase.from.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    })
    mockAdminAuth.deleteUser.mockResolvedValueOnce({ error: null })
    await excluirMembro('m-1')
    expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith('m-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/membros')
  })
})
