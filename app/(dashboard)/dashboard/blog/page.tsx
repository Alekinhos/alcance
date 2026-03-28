import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatarDataCurta } from '@/lib/utils'
import { Plus, Pencil, FileText } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { BotaoExcluirPost } from '@/components/blog/botao-excluir-post'
import type { PapelUsuario } from '@/types/supabase'

export default async function PaginaBlogDashboard() {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario
  if (papel === 'membro') redirect('/dashboard')

  const { data: posts } = await supabase
    .from('posts')
    .select('*, autor:profiles(nome)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-porta">Blog</h1>
          <p className="mt-1 text-pao">{posts?.length ?? 0} post(s)</p>
        </div>
        <Link href="/dashboard/blog/novo">
          <Botao>
            <Plus className="mr-2 h-4 w-4" /> Novo Post
          </Botao>
        </Link>
      </div>

      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-lg border border-pao bg-white p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variante={post.publicado ? 'sucesso' : 'aviso'}>
                    {post.publicado ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <h3 className="font-medium text-porta">{post.titulo}</h3>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-pao">
                  {post.autor && <span>Por {(post.autor as { nome: string }).nome}</span>}
                  <span>•</span>
                  <span>{formatarDataCurta(post.created_at)}</span>
                  {post.tags && post.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{post.tags.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/blog/${post.id}/editar`}>
                  <Botao variante="fantasma" tamanho="sm">
                    <Pencil className="h-4 w-4" />
                  </Botao>
                </Link>
                <BotaoExcluirPost id={post.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-pao p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-pao" />
            <p className="mt-2 text-pao">Nenhum post criado ainda.</p>
            <Link href="/dashboard/blog/novo" className="mt-4 inline-block">
              <Botao variante="secundario" tamanho="sm">Criar primeiro post</Botao>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
