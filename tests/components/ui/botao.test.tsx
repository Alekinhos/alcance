import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Botao } from '@/components/ui/botao'

describe('Botao', () => {
  it('renderiza o texto', () => {
    render(<Botao>Entrar</Botao>)
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('chama onClick ao clicar', async () => {
    const onClick = vi.fn()
    render(<Botao onClick={onClick}>Clique</Botao>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('desabilita e mostra spinner quando carregando=true', () => {
    render(<Botao carregando>Enviando</Botao>)
    const botao = screen.getByRole('button')
    expect(botao).toBeDisabled()
    expect(botao.querySelector('span')).toBeInTheDocument()
  })

  it('não desabilita quando carregando=false', () => {
    render(<Botao carregando={false}>Enviar</Botao>)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('não dispara onClick quando desabilitado', async () => {
    const onClick = vi.fn()
    render(<Botao disabled onClick={onClick}>Botão</Botao>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renderiza como type=submit', () => {
    render(<Botao type="submit">Enviar</Botao>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('usa type=button por padrão', () => {
    render(<Botao>Botão</Botao>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('aceita className extra', () => {
    render(<Botao className="w-full">Botão</Botao>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})
