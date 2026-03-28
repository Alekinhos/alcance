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
  recorrente: boolean
  frequencia: 'semanal' | 'quinzenal' | 'mensal' | null
  data_fim_recorrencia: string | null
}

export function FormularioEditarEvento({ evento }: { evento: Evento }) {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [recorrente, setRecorrente] = useState(evento.recorrente)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    dados.set('recorrente', recorrente ? 'true' : 'false')
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
            <Campo
              label={recorrente ? 'Data da primeira ocorrência' : 'Data'}
              name="data"
              type="date"
              required
              defaultValue={evento.data}
            />
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

          {/* Toggle Recorrente */}
          <div className="flex items-center justify-between rounded-lg border border-pao p-4">
            <div>
              <p className="font-medium text-porta">Evento recorrente</p>
              <p className="text-sm text-pao">Repete automaticamente em intervalos regulares</p>
            </div>
            <button
              type="button"
              onClick={() => setRecorrente(!recorrente)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                recorrente ? 'bg-sangue' : 'bg-pao/40'
              }`}
              role="switch"
              aria-checked={recorrente}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  recorrente ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Opções de recorrência */}
          {recorrente && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Frequência"
                name="frequencia"
                required
                defaultValue={evento.frequencia ?? 'semanal'}
              >
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
              </Select>
              <Campo
                label="Repetir até (opcional)"
                name="data_fim_recorrencia"
                type="date"
                defaultValue={evento.data_fim_recorrencia ?? ''}
              />
            </div>
          )}

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
