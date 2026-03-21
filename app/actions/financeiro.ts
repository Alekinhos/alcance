'use server'

import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarTransacao(formData: FormData) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Verificar permissão
  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  if (!['admin', 'pastor'].includes(perfil?.papel ?? '')) {
    return { erro: 'Sem permissão para registrar transações.' }
  }

  const membroId = formData.get('membro_id') as string

  const { error } = await supabase.from('transacoes').insert({
    tipo: formData.get('tipo') as 'dizimo' | 'oferta' | 'doacao' | 'outro',
    valor: parseFloat(formData.get('valor') as string),
    descricao: (formData.get('descricao') as string) || null,
    membro_id: membroId || null,
    data: formData.get('data') as string,
    criado_por: user.id,
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/financeiro')
  redirect('/dashboard/financeiro')
}

export async function excluirTransacao(id: string) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  await supabase.from('transacoes').delete().eq('id', id)
  revalidatePath('/dashboard/financeiro')
}
