import { criarClienteServidor } from '@/lib/supabase/server'
import { formatarData } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Paginacao } from '@/components/ui/paginacao'

const ITENS_POR_PAGINA = 9

export default async function PaginaBlog({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await criarClienteServidor()

  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('publicado', true)

  const totalItens = count ?? 0
  const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA))

  const { page } = await searchParams
  const pagina = Math.min(Math.max(1, parseInt(page ?? '1') || 1), totalPaginas)

  const inicio = (pagina - 1) * ITENS_POR_PAGINA
  const { data: posts } = await supabase
    .from('posts')
    .select('*, autor:profiles(nome)')
    .eq('publicado', true)
    .order('created_at', { ascending: false })
    .range(inicio, inicio + ITENS_POR_PAGINA - 1)

  const postDestaque = pagina === 1 ? posts?.[0] : null
  const demaisposts = pagina === 1 ? (posts?.slice(1) ?? []) : (posts ?? [])

  function gerarHref(n: number) {
    return n === 1 ? '/blog' : `/blog?page=${n}`
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-porta">Blog</h1>
        <p className="mt-2 text-pao">Sermões, devocionais e notícias da nossa comunidade.</p>
      </div>

      {posts && posts.length > 0 ? (
        <>
          {/* Post em destaque (apenas na primeira página) */}
          {postDestaque && (
            <Link
              href={`/blog/${postDestaque.id}`}
              className="group mb-8 block overflow-hidden rounded-xl border border-pao bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="grid md:grid-cols-2">
                {postDestaque.capa_url ? (
                  <div className="relative h-56 md:h-auto">
                    <Image
                      src={postDestaque.capa_url}
                      alt={postDestaque.titulo}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111111] md:h-auto">
                    <BookOpen className="h-16 w-16 text-cordeiro/30" />
                  </div>
                )}
                <div className="flex flex-col justify-center p-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sangue">
                    Em destaque
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-porta transition-colors group-hover:text-sangue">
                    {postDestaque.titulo}
                  </h2>
                  <div className="mt-3 flex items-center gap-2 text-sm text-pao">
                    {postDestaque.autor && (
                      <span>{(postDestaque.autor as { nome: string }).nome}</span>
                    )}
                    <span>·</span>
                    <span>{formatarData(postDestaque.created_at)}</span>
                  </div>
                  {postDestaque.tags && postDestaque.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {postDestaque.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-cordeiro px-2 py-0.5 text-xs text-porta">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="mt-5 flex items-center gap-1 text-sm font-medium text-sangue">
                    Ler mais <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Demais posts */}
          {demaisposts.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {demaisposts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group overflow-hidden rounded-xl border border-pao bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {post.capa_url ? (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={post.capa_url}
                        alt={post.titulo}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111111]">
                      <BookOpen className="h-10 w-10 text-cordeiro/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="line-clamp-2 font-semibold text-porta transition-colors group-hover:text-sangue">
                      {post.titulo}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-xs text-pao">
                      {post.autor && <span>{(post.autor as { nome: string }).nome}</span>}
                      <span>·</span>
                      <span>{formatarData(post.created_at)}</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full bg-cordeiro px-2 py-0.5 text-xs text-porta">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-pao py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-pao" />
          <p className="mt-3 text-lg font-medium text-porta">Nenhum post publicado ainda</p>
          <p className="mt-1 text-sm text-pao">Em breve teremos conteúdo para você!</p>
        </div>
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} gerarHref={gerarHref} />
    </div>
  )
}
