'use server'

import { criarClienteServidor, criarClienteAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { schemaCadastro, schemaEmail } from '@/lib/validations/auth'

export async function cadastrarComConvite(formData: FormData) {
  const supabase = await criarClienteServidor()
  const supabaseAdmin = await criarClienteAdmin()

  const raw = {
    codigo: ((formData.get('codigo') as string) ?? '').trim().toUpperCase(),
    nome: formData.get('nome') as string,
    email: formData.get('email') as string,
    senha: formData.get('senha') as string,
    confirmar_senha: formData.get('confirmar_senha') as string,
  }

  const resultado = schemaCadastro.safeParse(raw)
  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors
    const primeiro = Object.values(erros).flat()[0]
    return { erro: primeiro ?? 'Dados inválidos.' }
  }

  const { codigo, nome, email, senha } = resultado.data

  const { data: convite, error: erroConvite } = await supabase
    .from('convites')
    .select('id, usado')
    .eq('codigo', codigo)
    .single()

  if (erroConvite || !convite) {
    return { erro: 'Código de convite inválido.' }
  }

  if (convite.usado) {
    return { erro: 'Este código de convite já foi utilizado.' }
  }

  const { data: novoUsuario, error: erroAuth } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  })

  if (erroAuth || !novoUsuario.user) {
    if (erroAuth?.message?.includes('already registered')) {
      return { erro: 'Este email já está cadastrado.' }
    }
    return { erro: erroAuth?.message ?? 'Erro ao criar conta. Tente novamente.' }
  }

  await supabase
    .from('convites')
    .update({ usado: true, usado_por: novoUsuario.user.id })
    .eq('id', convite.id)

  await supabase.auth.signInWithPassword({ email, password: senha })

  redirect('/dashboard')
}

export async function solicitarResetSenha(formData: FormData) {
  const supabase = await criarClienteServidor()

  const raw = { email: formData.get('email') as string }
  const resultado = schemaEmail.safeParse(raw)
  if (!resultado.success) {
    return { erro: 'Email inválido.' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const { error } = await supabase.auth.resetPasswordForEmail(resultado.data.email, {
    redirectTo: `${origin}/auth/redefinir-senha`,
  })

  if (error) {
    return { erro: 'Erro ao enviar o email. Tente novamente.' }
  }

  return { sucesso: true }
}

export async function gerarConvite() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  if (!['admin', 'pastor'].includes(perfil?.papel ?? '')) {
    return { erro: 'Sem permissão para gerar convites.' }
  }

  const codigo = randomBytes(6)
    .toString('base64')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
    .replace(/(.{4})/, '$1-')

  const { error } = await supabase
    .from('convites')
    .insert({ codigo, criado_por: user.id })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/convites')
  return { codigo }
}

export async function excluirConvite(id: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('convites').delete().eq('id', id)
  revalidatePath('/dashboard/convites')
}
