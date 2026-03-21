'use server'

import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarPost(formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const tags = (formData.get('tags') as string)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const capaArquivo = formData.get('capa') as File | null
  let capaUrl: string | null = null

  if (capaArquivo && capaArquivo.size > 0) {
    const extensao = capaArquivo.name.split('.').pop()
    const caminho = `capas/${Date.now()}.${extensao}`

    const { data: upload, error: erroUpload } = await supabase.storage
      .from('blog')
      .upload(caminho, capaArquivo)

    if (!erroUpload && upload) {
      const { data: urlPublica } = supabase.storage
        .from('blog')
        .getPublicUrl(caminho)
      capaUrl = urlPublica.publicUrl
    }
  }

  const { error } = await supabase.from('posts').insert({
    titulo: formData.get('titulo') as string,
    conteudo: formData.get('conteudo') as string,
    autor_id: user.id,
    tags: tags.length > 0 ? tags : null,
    capa_url: capaUrl,
    publicado: formData.get('publicado') === 'true',
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/blog')
  revalidatePath('/blog')
  redirect('/dashboard/blog')
}

export async function atualizarPost(id: string, formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const tags = (formData.get('tags') as string)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const capaArquivo = formData.get('capa') as File | null
  let capaUrl: string | undefined = undefined

  if (capaArquivo && capaArquivo.size > 0) {
    const extensao = capaArquivo.name.split('.').pop()
    const caminho = `capas/${id}.${extensao}`

    const { data: upload, error: erroUpload } = await supabase.storage
      .from('blog')
      .upload(caminho, capaArquivo, { upsert: true })

    if (!erroUpload && upload) {
      const { data: urlPublica } = supabase.storage
        .from('blog')
        .getPublicUrl(caminho)
      capaUrl = urlPublica.publicUrl
    }
  }

  const { error } = await supabase
    .from('posts')
    .update({
      titulo: formData.get('titulo') as string,
      conteudo: formData.get('conteudo') as string,
      tags: tags.length > 0 ? tags : null,
      publicado: formData.get('publicado') === 'true',
      updated_at: new Date().toISOString(),
      ...(capaUrl !== undefined && { capa_url: capaUrl }),
    })
    .eq('id', id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/blog')
  revalidatePath('/blog')
  redirect('/dashboard/blog')
}

export async function excluirPost(id: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('posts').delete().eq('id', id)
  revalidatePath('/dashboard/blog')
  revalidatePath('/blog')
}
