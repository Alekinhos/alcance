'use client'

import { useState } from 'react'
import { criarPost } from '@/app/actions/blog'
import { Campo, Textarea } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaginaNovoPost() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [publicado, setPublicado] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    dados.set('publicado', String(publicado))

    const resultado = await criarPost(dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/blog"
          className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Post</h1>
      </div>

      <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Título" name="titulo" required />

          <Textarea
            label="Conteúdo (HTML)"
            name="conteudo"
            required
            className="min-h-[300px] font-mono text-sm"
            placeholder="<p>Escreva o conteúdo do post aqui...</p>"
          />

          <Campo
            label="Tags"
            name="tags"
            placeholder="fé, sermão, evangelismo"
            ajuda="Separe as tags por vírgula."
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Imagem de Capa</label>
            <input
              name="capa"
              type="file"
              accept="image/*"
              className="text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publicado"
              checked={publicado}
              onChange={(e) => setPublicado(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="publicado" className="text-sm font-medium text-gray-700">
              Publicar imediatamente
            </label>
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/blog">
              <Botao type="button" variante="secundario">Cancelar</Botao>
            </Link>
            <Botao type="submit" carregando={carregando}>
              {publicado ? 'Publicar Post' : 'Salvar Rascunho'}
            </Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
