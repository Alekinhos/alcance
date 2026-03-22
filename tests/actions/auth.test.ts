import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockRedirect,
  mockRevalidatePath,
  mockHeaders,
  mockChain,
  mockAuth,
  mockSupabase,
  mockSupabaseAdmin,
} = vi.hoisted(() => {
  const mockChain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  }
  Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))
  mockChain.single.mockResolvedValue({ data: null, error: null })
  mockChain.insert.mockResolvedValue({ data: null, error: null })
  mockChain.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })

  const mockAuth = {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    admin: { createUser: vi.fn() },
  }
  const mockSupabase = { auth: mockAuth, from: vi.fn().mockReturnValue(mockChain) }
  const mockSupabaseAdmin = { auth: { admin: { createUser: vi.fn() } } }
  const mockRedirect = vi.fn().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  })

  return {
    mockRedirect,
    mockRevalidatePath: vi.fn(),
    mockHeaders: vi.fn(),
    mockChain,
    mockAuth,
    mockSupabase,
    mockSupabaseAdmin,
  }
})

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))
vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))
vi.mock('next/headers', () => ({ headers: mockHeaders }))
vi.mock('@/lib/supabase/server', () => ({
  criarClienteServidor: vi.fn().mockResolvedValue(mockSupabase),
  criarClienteAdmin: vi.fn().mockResolvedValue(mockSupabaseAdmin),
}))

import {
  cadastrarComConvite,
  solicitarResetSenha,
  gerarConvite,
  excluirConvite,
} from '@/app/actions/auth'

function formData(dados: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(dados).forEach(([k, v]) => fd.append(k, v))
  return fd
}

const dadosValidos = {
  codigo: 'ABCD-1234',
  nome: 'João Silva',
  email: 'joao@email.com',
  senha: 'Senha123',
  confirmar_senha: 'Senha123',
}

describe('cadastrarComConvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRedirect.mockImplementation((url: string) => { throw new Error(`REDIRECT:${url}`) })
    mockSupabase.from.mockReturnValue(mockChain)
    Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))
    mockChain.single.mockResolvedValue({ data: null, error: null })
    mockChain.insert.mockResolvedValue({ data: null, error: null })
  })

  it('retorna erro para dados inválidos (senha fraca)', async () => {
    const resultado = await cadastrarComConvite(
      formData({ ...dadosValidos, senha: 'fraca', confirmar_senha: 'fraca' })
    )
    expect(resultado?.erro).toBeDefined()
  })

  it('retorna erro quando convite é inválido', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })
    const resultado = await cadastrarComConvite(formData(dadosValidos))
    expect(resultado?.erro).toMatch(/convite inválido/i)
  })

  it('retorna erro quando convite já foi usado', async () => {
    mockChain.single.mockResolvedValueOnce({ data: { id: '1', usado: true }, error: null })
    const resultado = await cadastrarComConvite(formData(dadosValidos))
    expect(resultado?.erro).toMatch(/já foi utilizado/i)
  })

  it('retorna erro quando email já está cadastrado', async () => {
    mockChain.single.mockResolvedValueOnce({ data: { id: '1', usado: false }, error: null })
    mockSupabaseAdmin.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    })
    const resultado = await cadastrarComConvite(formData(dadosValidos))
    expect(resultado?.erro).toMatch(/já está cadastrado/i)
  })

  it('cria usuário e redireciona quando tudo é válido', async () => {
    mockChain.single.mockResolvedValueOnce({ data: { id: 'invite-1', usado: false }, error: null })
    mockSupabaseAdmin.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null,
    })
    mockChain.update.mockReturnValueOnce({ eq: vi.fn().mockResolvedValueOnce({ error: null }) })
    mockAuth.signInWithPassword.mockResolvedValueOnce({ error: null })

    await expect(cadastrarComConvite(formData(dadosValidos))).rejects.toThrow('REDIRECT:/dashboard')
    expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'joao@email.com' })
    )
  })
})

describe('solicitarResetSenha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockResolvedValue({ get: vi.fn().mockReturnValue('http://localhost:3000') })
  })

  it('retorna erro para email inválido', async () => {
    const resultado = await solicitarResetSenha(formData({ email: 'invalido' }))
    expect(resultado?.erro).toBeDefined()
  })

  it('chama resetPasswordForEmail com email correto', async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValueOnce({ error: null })
    const resultado = await solicitarResetSenha(formData({ email: 'user@teste.com' }))
    expect(resultado).toEqual({ sucesso: true })
    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@teste.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/auth/redefinir-senha') })
    )
  })

  it('retorna erro quando Supabase falha', async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'fail' } })
    const resultado = await solicitarResetSenha(formData({ email: 'user@teste.com' }))
    expect(resultado?.erro).toBeDefined()
  })
})

describe('gerarConvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue(mockChain)
    Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))
    mockChain.single.mockResolvedValue({ data: null, error: null })
    mockChain.insert.mockResolvedValue({ data: null, error: null })
  })

  it('retorna erro quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    const resultado = await gerarConvite()
    expect(resultado?.erro).toMatch(/não autenticado/i)
  })

  it('retorna erro para usuário sem permissão (membro)', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'membro' }, error: null })
    const resultado = await gerarConvite()
    expect(resultado?.erro).toMatch(/sem permissão/i)
  })

  it('gera convite para admin com formato XXXX-XXXX', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'admin' }, error: null })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    const resultado = await gerarConvite()
    expect(resultado?.codigo).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })

  it('gera convite para pastor', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'pastor-1' } } })
    mockChain.single.mockResolvedValueOnce({ data: { papel: 'pastor' }, error: null })
    mockChain.insert.mockResolvedValueOnce({ error: null })
    const resultado = await gerarConvite()
    expect(resultado?.codigo).toBeDefined()
  })
})

describe('excluirConvite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue(mockChain)
    Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))
  })

  it('não deleta quando não autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await excluirConvite('invite-1')
    expect(mockChain.delete).not.toHaveBeenCalled()
  })

  it('deleta o convite quando autenticado', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } } })
    mockChain.eq.mockResolvedValueOnce({ error: null })
    await excluirConvite('invite-1')
    expect(mockChain.delete).toHaveBeenCalled()
  })
})
