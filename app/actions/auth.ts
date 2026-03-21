'use server'

import { criarClienteServidor, criarClienteAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function cadastrarComConvite(formData: FormData) {
  const supabase = await criarClienteServidor()
  const supabaseAdmin = await criarClienteAdmin()

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const confirmarSenha = formData.get('confirmar_senha') as string
  const codigo = (formData.get('codigo') as string).trim().toUpperCase()

  if (senha !== confirmarSenha) {
    return { erro: 'As senhas não coincidem.' }
  }

  if (senha.length < 6) {
    return { erro: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  // Verificar se o código de convite é válido
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

  // Criar usuário no Supabase Auth
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

  // Marcar convite como usado
  await supabase
    .from('convites')
    .update({ usado: true, usado_por: novoUsuario.user.id })
    .eq('id', convite.id)

  // Fazer login automaticamente
  await supabase.auth.signInWithPassword({ email, password: senha })

  redirect('/dashboard')
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

  // Gerar código legível: 3 grupos de 4 letras/números
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
