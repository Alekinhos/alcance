import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { mockSolicitar } = vi.hoisted(() => ({ mockSolicitar: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/app/actions/auth', () => ({
  solicitarResetSenha: (...args: unknown[]) => mockSolicitar(...args),
}))

import PaginaEsqueciSenha from '@/app/auth/esqueci-senha/page'

describe('PaginaEsqueciSenha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSolicitar.mockResolvedValue({ sucesso: true })
  })

  it('renderiza campo de email', () => {
    render(<PaginaEsqueciSenha />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renderiza botão de envio', () => {
    render(<PaginaEsqueciSenha />)
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument()
  })

  it('exibe link para login', () => {
    render(<PaginaEsqueciSenha />)
    expect(screen.getByRole('link', { name: /voltar ao login/i })).toBeInTheDocument()
  })

  it('exibe erro para email inválido sem chamar a action', async () => {
    render(<PaginaEsqueciSenha />)
    await userEvent.type(screen.getByLabelText('Email'), 'nao-e-email')
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
    expect(mockSolicitar).not.toHaveBeenCalled()
  })

  it('exibe estado de sucesso com o email informado', async () => {
    render(<PaginaEsqueciSenha />)
    await userEvent.type(screen.getByLabelText('Email'), 'usuario@teste.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByText(/email enviado/i)).toBeInTheDocument()
      expect(screen.getByText('usuario@teste.com')).toBeInTheDocument()
    })
  })

  it('exibe erro retornado pela action e mantém formulário', async () => {
    mockSolicitar.mockResolvedValueOnce({ erro: 'Erro ao enviar o email. Tente novamente.' })
    render(<PaginaEsqueciSenha />)

    await userEvent.type(screen.getByLabelText('Email'), 'usuario@teste.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }))

    await waitFor(() => {
      expect(screen.getByText(/erro ao enviar/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})
