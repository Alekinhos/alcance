'use client'

import { useState } from 'react'
import { atualizarTransmissao } from '@/app/actions/transmissoes'
import { Campo, Textarea } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Transmissao {
  id: string
  titulo: string
  descricao: string | null
  youtube_url: string
  ao_vivo: boolean
  data: string
}

export function FormularioEditarTransmissao({ transmissao }: { transmissao: Transmissao }) {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [aoVivo, setAoVivo] = useState(transmissao.ao_vivo)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    dados.set('ao_vivo', aoVivo ? 'true' : 'false')
    const resultado = await atualizarTransmissao(transmissao.id, dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/transmissoes"
          className="mb-4 flex items-center gap-1 text-sm text-sangue hover:text-porta"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-porta">Editar Transmissão</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-pao bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo
            label="Título"
            name="titulo"
            required
            defaultValue={transmissao.titulo}
          />
          <Textarea
            label="Descrição"
            name="descricao"
            defaultValue={transmissao.descricao ?? ''}
          />
          <Campo
            label="Link do YouTube"
            name="youtube_url"
            required
            defaultValue={transmissao.youtube_url}
          />
          <Campo
            label="Data"
            name="data"
            type="date"
            required
            defaultValue={transmissao.data}
          />

          {/* Toggle Ao Vivo */}
          <div className="flex items-center justify-between rounded-lg border border-pao p-4">
            <div>
              <p className="font-medium text-porta">Transmissão ao vivo agora</p>
              <p className="text-sm text-pao">
                Ativa o player na página pública e exibe o badge "AO VIVO"
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAoVivo(!aoVivo)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                aoVivo ? 'bg-sangue' : 'bg-pao/40'
              }`}
              role="switch"
              aria-checked={aoVivo}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  aoVivo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/transmissoes">
              <Botao type="button" variante="secundario">Cancelar</Botao>
            </Link>
            <Botao type="submit" carregando={carregando}>Salvar alterações</Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
