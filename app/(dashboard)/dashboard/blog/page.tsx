import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatarDataCurta } from '@/lib/utils'
import { Plus, Pencil, FileText, Search, X } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { BotaoExcluirPost } from '@/components/blog/botao-excluir-post'
import type { PapelUsuario } from '@/types/supabase'

const inputClasse =
  'rounded-md border border-pao bg-white px-3 py-2 text-sm text-black focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue'

export default async function PaginaBlogDashboard({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; status?: string }>
}) {
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

  const { busca, status } = await searchParams

  let query = supabase
    .from('posts')
    .select('*, autor:profiles(nome)')
    .order('created_at', { ascending: false })

  if (busca) query = query.ilike('titulo', `%${busca}%`)
  if (status === 'publicado') query = query.eq('publicado', true)
  if (status === 'rascunho') query = query.eq('publicado', false)

  const { data: posts } = await query

  const temFiltro = !!(busca || status)

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

      {/* Filtros */}
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pao" />
          <input
            name="busca"
            defaultValue={busca}
            type="search"
            placeholder="Buscar por título..."
            className={`${inputClasse} pl-9 w-56`}
          />
        </div>

        <select name="status" defaultValue={status ?? ''} className={inputClasse}>
          <option value="">Todos</option>
          <option value="publicado">Publicados</option>
          <option value="rascunho">Rascunhos</option>
        </select>

        <button type="submit" className={`${inputClasse} bg-sangue text-white border-sangue hover:bg-porta px-4`}>
          Filtrar
        </button>

        {temFiltro && (
          <Link
            href="/dashboard/blog"
            className="flex items-center gap-1 text-sm text-pao hover:text-sangue"
          >
            <X className="h-3.5 w-3.5" /> Limpar
          </Link>
        )}
      </form>

      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-lg border border-pao bg-white p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variante={post.publicado ? 'sucesso' : 'aviso'}>
                    {post.publicado ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <h3 className="font-medium text-porta truncate">{post.titulo}</h3>
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

              <div className="flex items-center gap-2 shrink-0">
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
            <p className="mt-2 text-pao">
              {temFiltro ? 'Nenhum post encontrado com esses filtros.' : 'Nenhum post criado ainda.'}
            </p>
            {!temFiltro && (
              <Link href="/dashboard/blog/novo" className="mt-4 inline-block">
                <Botao variante="secundario" tamanho="sm">Criar primeiro post</Botao>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
