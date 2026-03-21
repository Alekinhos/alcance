'use client'

import { useState } from 'react'
import { criarTransacao } from '@/app/actions/financeiro'
import { Campo, Textarea, Select } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaginaNovaTransacao() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    const resultado = await criarTransacao(dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/financeiro"
          className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova Entrada Financeira</h1>
      </div>

      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tipo" name="tipo" required>
              <option value="dizimo">Dízimo</option>
              <option value="oferta">Oferta</option>
              <option value="doacao">Doação</option>
              <option value="outro">Outro</option>
            </Select>
            <Campo label="Valor (R$)" name="valor" type="number" step="0.01" min="0" required />
          </div>

          <Campo label="Data" name="data" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />

          <Campo
            label="ID do Membro (opcional)"
            name="membro_id"
            ajuda="Deixe em branco para entradas anônimas."
          />

          <Textarea label="Descrição" name="descricao" />

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/dashboard/financeiro">
              <Botao type="button" variante="secundario">Cancelar</Botao>
            </Link>
            <Botao type="submit" carregando={carregando}>Registrar</Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
