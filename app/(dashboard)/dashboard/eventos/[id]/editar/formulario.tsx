'use client'

import { useState } from 'react'
import { atualizarEvento } from '@/app/actions/eventos'
import { Campo, Textarea, Select } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Evento {
  id: string
  titulo: string
  descricao: string | null
  data: string
  hora: string | null
  local: string | null
  tipo: 'culto' | 'reuniao' | 'retiro' | 'outro'
}

export function FormularioEditarEvento({ evento }: { evento: Evento }) {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    const resultado = await atualizarEvento(evento.id, dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/eventos"
          className="mb-4 flex items-center gap-1 text-sm text-porta hover:text-sangue"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-porta">Editar Evento</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-pao bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Título" name="titulo" required defaultValue={evento.titulo} />
          <Textarea label="Descrição" name="descricao" defaultValue={evento.descricao ?? ''} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Data" name="data" type="date" required defaultValue={evento.data} />
            <Campo label="Horário" name="hora" type="time" defaultValue={evento.hora ?? ''} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Local" name="local" defaultValue={evento.local ?? ''} />
            <Select label="Tipo" name="tipo" required defaultValue={evento.tipo}>
              <option value="culto">Culto</option>
              <option value="reuniao">Reunião</option>
              <option value="retiro">Retiro</option>
              <option value="outro">Outro</option>
            </Select>
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/eventos">
              <Botao type="button" variante="secundario">Cancelar</Botao>
            </Link>
            <Botao type="submit" carregando={carregando}>Salvar Alterações</Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
