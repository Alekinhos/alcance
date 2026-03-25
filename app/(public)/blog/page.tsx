import { criarClienteServidor } from '@/lib/supabase/server'
import { formatarData } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

export default async function PaginaBlog() {
  const supabase = await criarClienteServidor()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, autor:profiles(nome)')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-porta">Blog</h1>
      <p className="mt-2 text-pao">Sermões, devocionais e notícias da nossa comunidade.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group rounded-lg border border-pao bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {post.capa_url && (
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={post.capa_url}
                    alt={post.titulo}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-porta group-hover:text-sangue">
                  {post.titulo}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-pao">
                  {post.autor && <span>{(post.autor as { nome: string }).nome}</span>}
                  <span>•</span>
                  <span>{formatarData(post.created_at)}</span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-cordeiro px-2 py-0.5 text-xs text-porta"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-2 py-12 text-center text-pao">
            Nenhum post publicado ainda.
          </p>
        )}
      </div>
    </div>
  )
}
