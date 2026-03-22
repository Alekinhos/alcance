import { z } from 'zod'

export const schemaCadastro = z
  .object({
    codigo: z.string().min(9, 'Código de convite inválido'),
    nome: z
      .string()
      .min(3, 'Nome deve ter ao menos 3 caracteres')
      .max(100, 'Nome muito longo')
      .regex(/^[A-Za-zÀ-ú\s]+$/, 'Nome deve conter apenas letras'),
    email: z.string().email('Email inválido'),
    senha: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula')
      .regex(/[0-9]/, 'Inclua ao menos um número'),
    confirmar_senha: z.string(),
  })
  .refine((d) => d.senha === d.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })

export type CadastroInput = z.infer<typeof schemaCadastro>

export const schemaEmail = z.object({
  email: z.string().email('Email inválido'),
})

export const schemaRedefinirSenha = z
  .object({
    senha: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula')
      .regex(/[0-9]/, 'Inclua ao menos um número'),
    confirmar_senha: z.string(),
  })
  .refine((d) => d.senha === d.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })

export type RedefinirSenhaInput = z.infer<typeof schemaRedefinirSenha>
