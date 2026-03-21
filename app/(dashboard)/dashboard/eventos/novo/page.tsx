'use client'

import { useState } from 'react'
import { criarEvento } from '@/app/actions/eventos'
import { Campo, Textarea, Select } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaginaNovoEvento() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    const resultado = await criarEvento(dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/eventos"
          className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Evento</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Título" name="titulo" required />
          <Textarea label="Descrição" name="descricao" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Data" name="data" type="date" required />
            <Campo label="Horário" name="hora" type="time" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Local" name="local" />
            <Select label="Tipo" name="tipo" required>
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
            <Botao type="submit" carregando={carregando}>Criar Evento</Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
