import { criarClienteServidor } from '@/lib/supabase/server'
import { formatarData } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaginaPost({ params }: Props) {
  const { id } = await params
  const supabase = await criarClienteServidor()

  const { data: post } = await supabase
    .from('posts')
    .select('*, autor:profiles(nome)')
    .eq('id', id)
    .eq('publicado', true)
    .single()

  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/blog"
        className="mb-8 flex items-center gap-1 text-sm text-sangue hover:text-porta"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
      </Link>

      {post.capa_url && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl">
          <Image src={post.capa_url} alt={post.titulo} fill className="object-cover" />
        </div>
      )}

      <h1 className="text-4xl font-bold text-porta">{post.titulo}</h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-pao">
        {post.autor && <span>Por {(post.autor as { nome: string }).nome}</span>}
        <span>•</span>
        <span>{formatarData(post.created_at)}</span>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cordeiro px-3 py-1 text-sm text-porta"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="prose prose-stone mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.conteudo }}
      />
    </article>
  )
}
