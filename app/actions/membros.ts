'use server'

import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarMembro(formData: FormData) {
  const supabase = await criarClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const senha = formData.get('senha') as string
  const telefone = formData.get('telefone') as string
  const endereco = formData.get('endereco') as string
  const papel = formData.get('papel') as string
  const dataBatismo = formData.get('data_batismo') as string
  const grupo = formData.get('grupo') as string
  const fotoArquivo = formData.get('foto') as File | null

  // Criar usuário no Auth
  const { data: novoUsuario, error: erroAuth } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })

  if (erroAuth || !novoUsuario.user) {
    return { erro: erroAuth?.message ?? 'Erro ao criar usuário' }
  }

  let fotoUrl: string | null = null

  // Upload da foto se fornecida
  if (fotoArquivo && fotoArquivo.size > 0) {
    const extensao = fotoArquivo.name.split('.').pop()
    const caminho = `fotos/${novoUsuario.user.id}.${extensao}`

    const { data: upload, error: erroUpload } = await supabase.storage
      .from('membros')
      .upload(caminho, fotoArquivo, { upsert: true })

    if (!erroUpload && upload) {
      const { data: urlPublica } = supabase.storage
        .from('membros')
        .getPublicUrl(caminho)
      fotoUrl = urlPublica.publicUrl
    }
  }

  // Criar perfil
  const { error: erroPerfil } = await supabase.from('profiles').insert({
    id: novoUsuario.user.id,
    nome,
    email,
    telefone: telefone || null,
    endereco: endereco || null,
    papel: papel as 'admin' | 'pastor' | 'lider' | 'membro',
    data_batismo: dataBatismo || null,
    grupo: grupo || null,
    foto_url: fotoUrl,
  })

  if (erroPerfil) {
    return { erro: erroPerfil.message }
  }

  revalidatePath('/dashboard/membros')
  redirect('/dashboard/membros')
}

export async function atualizarMembro(id: string, formData: FormData) {
  const supabase = await criarClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const endereco = formData.get('endereco') as string
  const papel = formData.get('papel') as string
  const dataBatismo = formData.get('data_batismo') as string
  const grupo = formData.get('grupo') as string
  const fotoArquivo = formData.get('foto') as File | null

  let fotoUrl: string | undefined = undefined

  if (fotoArquivo && fotoArquivo.size > 0) {
    const extensao = fotoArquivo.name.split('.').pop()
    const caminho = `fotos/${id}.${extensao}`

    const { data: upload, error: erroUpload } = await supabase.storage
      .from('membros')
      .upload(caminho, fotoArquivo, { upsert: true })

    if (!erroUpload && upload) {
      const { data: urlPublica } = supabase.storage
        .from('membros')
        .getPublicUrl(caminho)
      fotoUrl = urlPublica.publicUrl
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nome,
      telefone: telefone || null,
      endereco: endereco || null,
      papel: papel as 'admin' | 'pastor' | 'lider' | 'membro',
      data_batismo: dataBatismo || null,
      grupo: grupo || null,
      ...(fotoUrl !== undefined && { foto_url: fotoUrl }),
    })
    .eq('id', id)

  if (error) {
    return { erro: error.message }
  }

  revalidatePath('/dashboard/membros')
  redirect('/dashboard/membros')
}

export async function excluirMembro(id: string) {
  const supabase = await criarClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('profiles').delete().eq('id', id)
  await supabase.auth.admin.deleteUser(id)

  revalidatePath('/dashboard/membros')
}
