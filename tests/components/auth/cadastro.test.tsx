import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense } from 'react'

const { mockCadastrar } = vi.hoisted(() => ({ mockCadastrar: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/app/actions/auth', () => ({
  cadastrarComConvite: (...args: unknown[]) => mockCadastrar(...args),
}))

import PaginaCadastro from '@/app/auth/cadastro/page'

function Wrapped() {
  return (
    <Suspense fallback={null}>
      <PaginaCadastro />
    </Suspense>
  )
}

describe('PaginaCadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCadastrar.mockResolvedValue(undefined)
  })

  it('renderiza todos os campos do formulário', () => {
    render(<Wrapped />)
    expect(screen.getByPlaceholderText('XXXX-XXXX')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument()
  })

  it('exibe link para login', () => {
    render(<Wrapped />)
    expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument()
  })

  it('exibe erro de validação para nome curto ao submeter', async () => {
    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Jo')
    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByText(/ao menos 3 caracteres/i)).toBeInTheDocument()
    })
  })

  it('exibe erro para email inválido ao submeter', async () => {
    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText('Email'), 'nao-e-email')
    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it('exibe erro quando senhas não coincidem', async () => {
    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Senha456')
    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument()
    })
  })

  it('exibe indicador de força da senha ao digitar', async () => {
    render(<Wrapped />)
    await userEvent.type(screen.getByLabelText('Senha'), 'Fraca1')

    await waitFor(() => {
      expect(screen.getByText(/força da senha/i)).toBeInTheDocument()
    })
  })

  it('exibe erro de servidor retornado pela action', async () => {
    mockCadastrar.mockResolvedValueOnce({ erro: 'Código de convite inválido.' })
    render(<Wrapped />)

    await userEvent.type(screen.getByPlaceholderText('XXXX-XXXX'), 'ABCD-1234')
    await userEvent.type(screen.getByLabelText('Nome completo'), 'João Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'joao@email.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'Senha123')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'Senha123')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText('Código de convite inválido.')).toBeInTheDocument()
    })
  })
})
