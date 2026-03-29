'use server'

import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { CategoriaDocumento } from '@/types/supabase'

export async function criarDocumento(
  _prevState: { erro?: string } | null,
  formData: FormData
): Promise<{ erro: string }> {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const arquivo = formData.get('arquivo') as File | null
  if (!arquivo || arquivo.size === 0) return { erro: 'Selecione um arquivo.' }
  if (arquivo.size > 10 * 1024 * 1024) return { erro: 'O arquivo não pode ultrapassar 10 MB.' }

  const ext = arquivo.name.split('.').pop() ?? 'bin'
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error: storageError } = await supabase.storage
    .from('documentos')
    .upload(path, arquivo, { contentType: arquivo.type, upsert: false })

  if (storageError) return { erro: storageError.message }

  const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(path)

  const { error: dbError } = await supabase.from('documentos').insert({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    categoria: formData.get('categoria') as CategoriaDocumento,
    arquivo_url: publicUrl,
    arquivo_path: path,
    arquivo_nome: arquivo.name,
    arquivo_tamanho: arquivo.size,
    arquivo_tipo: arquivo.type,
    criado_por: user.id,
  })

  if (dbError) {
    await supabase.storage.from('documentos').remove([path])
    return { erro: dbError.message }
  }

  revalidatePath('/dashboard/documentos')
  redirect('/dashboard/documentos')
}

export async function excluirDocumento(id: string, arquivoPath: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.storage.from('documentos').remove([arquivoPath])
  await supabase.from('documentos').delete().eq('id', id)

  revalidatePath('/dashboard/documentos')
}
