'use client'

import { useState } from 'react'
import { atualizarPost } from '@/app/actions/blog'
import { Campo, Textarea } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  titulo: string
  conteudo: string
  tags: string[] | null
  publicado: boolean
  capa_url: string | null
}

export function FormularioEditarPost({ post }: { post: Post }) {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [publicado, setPublicado] = useState(post.publicado)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    dados.set('publicado', String(publicado))

    const resultado = await atualizarPost(post.id, dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/blog"
          className="mb-4 flex items-center gap-1 text-sm text-porta hover:text-sangue"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-porta">Editar Post</h1>
      </div>

      <div className="max-w-3xl rounded-lg border border-pao bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Título" name="titulo" required defaultValue={post.titulo} />

          <Textarea
            label="Conteúdo (HTML)"
            name="conteudo"
            required
            className="min-h-[300px] font-mono text-sm"
            defaultValue={post.conteudo}
          />

          <Campo
            label="Tags"
            name="tags"
            placeholder="fé, sermão, evangelismo"
            ajuda="Separe as tags por vírgula."
            defaultValue={post.tags?.join(', ') ?? ''}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-porta">Imagem de Capa</label>
            {post.capa_url && (
              <p className="text-xs text-pao">
                Capa atual: <a href={post.capa_url} target="_blank" className="underline">ver imagem</a>
              </p>
            )}
            <input
              name="capa"
              type="file"
              accept="image/*"
              className="text-sm text-pao file:mr-4 file:rounded-md file:border-0 file:bg-cordeiro file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-porta hover:file:bg-pao/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publicado"
              checked={publicado}
              onChange={(e) => setPublicado(e.target.checked)}
              className="h-4 w-4 rounded border-pao text-sangue"
            />
            <label htmlFor="publicado" className="text-sm font-medium text-porta">
              Publicado
            </label>
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/blog">
              <Botao type="button" variante="secundario">Cancelar</Botao>
            </Link>
            <Botao type="submit" carregando={carregando}>Salvar Alterações</Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
