'use client'

import { useState, useEffect } from 'react'
import { atualizarMembro } from '@/app/actions/membros'
import { criarClienteSupabase } from '@/lib/supabase/client'
import { Campo, Select } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import type { Profile } from '@/types/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default function PaginaEditarMembro({ params }: Props) {
  const { id } = use(params)
  const [membro, setMembro] = useState<Profile | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const supabase = criarClienteSupabase()

  useEffect(() => {
    async function buscarMembro() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      setMembro(data)
    }
    buscarMembro()
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    const resultado = await atualizarMembro(id, dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  if (!membro) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/membros"
          className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Membro</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nome completo" name="nome" defaultValue={membro.nome} required />
            <Campo label="Email" name="email" type="email" defaultValue={membro.email} disabled />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Telefone" name="telefone" type="tel" defaultValue={membro.telefone ?? ''} />
            <Select label="Papel" name="papel" defaultValue={membro.papel} required>
              <option value="membro">Membro</option>
              <option value="lider">Líder</option>
              <option value="pastor">Pastor</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <Campo label="Endereço" name="endereco" defaultValue={membro.endereco ?? ''} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              label="Data de Batismo"
              name="data_batismo"
              type="date"
              defaultValue={membro.data_batismo ?? ''}
            />
            <Campo label="Grupo/Célula" name="grupo" defaultValue={membro.grupo ?? ''} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nova Foto</label>
            <input
              name="foto"
              type="file"
              accept="image/*"
              className="text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/membros">
              <Botao type="button" variante="secundario">
                Cancelar
              </Botao>
            </Link>
            <Botao type="submit" carregando={carregando}>
              Salvar Alterações
            </Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
