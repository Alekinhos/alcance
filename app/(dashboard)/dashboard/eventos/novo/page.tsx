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
  const [recorrente, setRecorrente] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    dados.set('recorrente', recorrente ? 'true' : 'false')
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
          className="mb-4 flex items-center gap-1 text-sm text-sangue hover:text-porta"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-porta">Novo Evento</h1>
      </div>

      <div className="max-w-2xl rounded-lg border border-pao bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo label="Título" name="titulo" required />
          <Textarea label="Descrição" name="descricao" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              label={recorrente ? 'Data da primeira ocorrência' : 'Data'}
              name="data"
              type="date"
              required
            />
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
              <Select label="Frequência" name="frequencia" required>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
              </Select>
              <Campo
                label="Repetir até (opcional)"
                name="data_fim_recorrencia"
                type="date"
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
            <Botao type="submit" carregando={carregando}>Criar Evento</Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
