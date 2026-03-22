import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { mockPush, mockRefresh, mockSignIn } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockSignIn: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/supabase/client', () => ({
  criarClienteSupabase: () => ({ auth: { signInWithPassword: mockSignIn } }),
}))

import PaginaLogin from '@/app/auth/login/page'

describe('PaginaLogin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza campos de email e senha', () => {
    render(<PaginaLogin />)
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument()
  })

  it('renderiza botão de entrar', () => {
    render(<PaginaLogin />)
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('exibe link "Esqueci a senha"', () => {
    render(<PaginaLogin />)
    expect(screen.getByRole('link', { name: /esqueci a senha/i })).toBeInTheDocument()
  })

  it('exibe link para cadastro', () => {
    render(<PaginaLogin />)
    expect(screen.getByRole('link', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('redireciona para /dashboard após login bem-sucedido', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })
    render(<PaginaLogin />)

    await userEvent.type(screen.getByLabelText(/^email/i), 'admin@teste.com')
    await userEvent.type(screen.getByLabelText(/^senha/i), 'Senha123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'admin@teste.com',
        password: 'Senha123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('exibe erro quando credenciais são inválidas', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })
    render(<PaginaLogin />)

    await userEvent.type(screen.getByLabelText(/^email/i), 'errado@email.com')
    await userEvent.type(screen.getByLabelText(/^senha/i), 'senhaErrada')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/email ou senha incorretos/i)).toBeInTheDocument()
    })
  })

  it('não redireciona quando login falha', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'fail' } })
    render(<PaginaLogin />)

    await userEvent.type(screen.getByLabelText(/^email/i), 'x@x.com')
    await userEvent.type(screen.getByLabelText(/^senha/i), 'qualquer')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(mockPush).not.toHaveBeenCalled())
  })
})
