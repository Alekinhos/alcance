import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { Campo } from '@/components/ui/campo'

describe('Campo', () => {
  it('renderiza o label', () => {
    render(<Campo label="Nome" name="nome" />)
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('mostra asterisco quando required', () => {
    render(<Campo label="Email" name="email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('não mostra asterisco sem required', () => {
    render(<Campo label="Email" name="email" />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('exibe mensagem de ajuda quando sem erro', () => {
    render(<Campo label="Senha" name="senha" ajuda="Mínimo 8 caracteres" />)
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument()
  })

  it('exibe mensagem de erro e oculta ajuda', () => {
    render(<Campo label="Senha" name="senha" ajuda="Mínimo 8 caracteres" erro="Senha inválida" />)
    expect(screen.getByText('Senha inválida')).toBeInTheDocument()
    expect(screen.queryByText('Mínimo 8 caracteres')).not.toBeInTheDocument()
  })

  it('aplica classe de erro no input quando há erro', () => {
    render(<Campo label="Email" name="email" erro="Email inválido" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-red-500')
  })

  it('não aplica classe de erro sem erro', () => {
    render(<Campo label="Email" name="email" />)
    const input = screen.getByLabelText('Email')
    expect(input).not.toHaveClass('border-red-500')
  })

  it('encaminha ref para o input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Campo label="Nome" name="nome" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('passa props adicionais para o input', () => {
    render(<Campo label="Email" name="email" type="email" placeholder="seu@email.com" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'seu@email.com')
  })

  it('renderiza sem label', () => {
    render(<Campo name="campo" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
