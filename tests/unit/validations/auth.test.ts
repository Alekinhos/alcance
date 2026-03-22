import { describe, it, expect } from 'vitest'
import { schemaCadastro, schemaEmail, schemaRedefinirSenha } from '@/lib/validations/auth'

// ---------------------------------------------------------------------------
// schemaCadastro
// ---------------------------------------------------------------------------
describe('schemaCadastro', () => {
  const dadosValidos = {
    codigo: 'ABCD-1234',
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'Senha123',
    confirmar_senha: 'Senha123',
  }

  it('aceita dados válidos', () => {
    const resultado = schemaCadastro.safeParse(dadosValidos)
    expect(resultado.success).toBe(true)
  })

  it('rejeita código de convite com menos de 9 caracteres', () => {
    const resultado = schemaCadastro.safeParse({ ...dadosValidos, codigo: 'ABC' })
    expect(resultado.success).toBe(false)
    const erros = resultado.error!.flatten().fieldErrors
    expect(erros.codigo).toBeDefined()
  })

  it('rejeita nome com menos de 3 caracteres', () => {
    const resultado = schemaCadastro.safeParse({ ...dadosValidos, nome: 'Jo' })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.nome).toBeDefined()
  })

  it('rejeita nome com números', () => {
    const resultado = schemaCadastro.safeParse({ ...dadosValidos, nome: 'João123' })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.nome).toBeDefined()
  })

  it('rejeita nome muito longo (> 100 chars)', () => {
    const resultado = schemaCadastro.safeParse({ ...dadosValidos, nome: 'A'.repeat(101) })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.nome).toBeDefined()
  })

  it('aceita nome com acentos', () => {
    const resultado = schemaCadastro.safeParse({ ...dadosValidos, nome: 'Ângela Conceição' })
    expect(resultado.success).toBe(true)
  })

  it('rejeita email inválido', () => {
    const resultado = schemaCadastro.safeParse({ ...dadosValidos, email: 'nao-e-email' })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.email).toBeDefined()
  })

  it('rejeita senha com menos de 8 caracteres', () => {
    const resultado = schemaCadastro.safeParse({
      ...dadosValidos,
      senha: 'Ab1',
      confirmar_senha: 'Ab1',
    })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.senha).toBeDefined()
  })

  it('rejeita senha sem letra maiúscula', () => {
    const resultado = schemaCadastro.safeParse({
      ...dadosValidos,
      senha: 'senha1234',
      confirmar_senha: 'senha1234',
    })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.senha).toBeDefined()
  })

  it('rejeita senha sem número', () => {
    const resultado = schemaCadastro.safeParse({
      ...dadosValidos,
      senha: 'SenhaSemNumero',
      confirmar_senha: 'SenhaSemNumero',
    })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.senha).toBeDefined()
  })

  it('rejeita quando senhas não coincidem', () => {
    const resultado = schemaCadastro.safeParse({
      ...dadosValidos,
      senha: 'Senha123',
      confirmar_senha: 'Senha456',
    })
    expect(resultado.success).toBe(false)
    const erros = resultado.error!.flatten().fieldErrors
    expect(erros.confirmar_senha).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// schemaEmail
// ---------------------------------------------------------------------------
describe('schemaEmail', () => {
  it('aceita email válido', () => {
    expect(schemaEmail.safeParse({ email: 'teste@dominio.com' }).success).toBe(true)
  })

  it('rejeita email sem @', () => {
    expect(schemaEmail.safeParse({ email: 'testedominio.com' }).success).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(schemaEmail.safeParse({ email: '' }).success).toBe(false)
  })

  it('rejeita sem domínio', () => {
    expect(schemaEmail.safeParse({ email: 'teste@' }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// schemaRedefinirSenha
// ---------------------------------------------------------------------------
describe('schemaRedefinirSenha', () => {
  it('aceita dados válidos', () => {
    const resultado = schemaRedefinirSenha.safeParse({
      senha: 'NovaSenha1',
      confirmar_senha: 'NovaSenha1',
    })
    expect(resultado.success).toBe(true)
  })

  it('rejeita senha fraca', () => {
    const resultado = schemaRedefinirSenha.safeParse({
      senha: 'fraca',
      confirmar_senha: 'fraca',
    })
    expect(resultado.success).toBe(false)
  })

  it('rejeita senhas diferentes', () => {
    const resultado = schemaRedefinirSenha.safeParse({
      senha: 'NovaSenha1',
      confirmar_senha: 'NovaSenha2',
    })
    expect(resultado.success).toBe(false)
    expect(resultado.error!.flatten().fieldErrors.confirmar_senha).toBeDefined()
  })
})
