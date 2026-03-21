import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatarMoeda, formatarDataCurta } from '@/lib/utils'
import { DollarSign, TrendingUp, Plus } from 'lucide-react'
import { Cartao, CartaoConteudo } from '@/components/ui/cartao'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Botao } from '@/components/ui/botao'
import type { PapelUsuario, TipoTransacao } from '@/types/supabase'

const rotulosTipo: Record<TipoTransacao, string> = {
  dizimo: 'Dízimo',
  oferta: 'Oferta',
  doacao: 'Doação',
  outro: 'Outro',
}

interface Props {
  searchParams: Promise<{ mes?: string; ano?: string }>
}

export default async function PaginaFinanceiro({ searchParams }: Props) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario
  if (!['admin', 'pastor'].includes(papel)) redirect('/dashboard')

  const params = await searchParams
  const agora = new Date()
  const mes = parseInt(params.mes ?? String(agora.getMonth() + 1))
  const ano = parseInt(params.ano ?? String(agora.getFullYear()))

  const inicioMes = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fimMes = new Date(ano, mes, 0).toISOString().split('T')[0]

  const { data: transacoes } = await supabase
    .from('transacoes')
    .select('*, membro:profiles!transacoes_membro_id_fkey(nome)')
    .gte('data', inicioMes)
    .lte('data', fimMes)
    .order('data', { ascending: false })

  const total = transacoes?.reduce((soma, t) => soma + t.valor, 0) ?? 0

  const totaisPorTipo = (transacoes ?? []).reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.tipo] = (acc[t.tipo] ?? 0) + t.valor
      return acc
    },
    {}
  )

  const nomeMes = new Date(ano, mes - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="mt-1 capitalize text-gray-500">{nomeMes}</p>
        </div>
        <Link href="/dashboard/financeiro/novo">
          <Botao>
            <Plus className="mr-2 h-4 w-4" /> Nova Entrada
          </Botao>
        </Link>
      </div>

      {/* Filtro por mês */}
      <form className="mb-6 flex items-center gap-3">
        <select
          name="mes"
          defaultValue={mes}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleDateString('pt-BR', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          name="ano"
          defaultValue={ano}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {[ano - 1, ano, ano + 1].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <Botao type="submit" variante="secundario" tamanho="sm">Filtrar</Botao>
      </form>

      {/* Cards de resumo */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao className="lg:col-span-1">
          <CartaoConteudo className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total do Mês</p>
              <p className="text-xl font-bold text-gray-900">{formatarMoeda(total)}</p>
            </div>
          </CartaoConteudo>
        </Cartao>

        {Object.entries(totaisPorTipo).map(([tipo, valor]) => (
          <Cartao key={tipo}>
            <CartaoConteudo className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-blue-100 p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{rotulosTipo[tipo as TipoTransacao]}</p>
                <p className="text-xl font-bold text-gray-900">{formatarMoeda(valor)}</p>
              </div>
            </CartaoConteudo>
          </Cartao>
        ))}
      </div>

      {/* Tabela de transações */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Membro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Descrição
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transacoes && transacoes.length > 0 ? (
              transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatarDataCurta(t.data)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variante="sucesso">{rotulosTipo[t.tipo]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {t.membro ? (t.membro as { nome: string }).nome : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {t.descricao ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                    {formatarMoeda(t.valor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma transação neste período.
                </td>
              </tr>
            )}
          </tbody>
          {transacoes && transacoes.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-700">
                  {formatarMoeda(total)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
