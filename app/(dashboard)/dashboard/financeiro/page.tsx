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
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-porta">Financeiro</h1>
          <p className="mt-1 capitalize text-pao">{nomeMes}</p>
        </div>
        <Link href="/dashboard/financeiro/novo">
          <Botao>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova Entrada</span>
            <span className="sm:hidden">Nova</span>
          </Botao>
        </Link>
      </div>

      {/* Filtro por mês */}
      <form className="mb-6 flex flex-wrap items-center gap-2">
        <select
          name="mes"
          defaultValue={mes}
          className="rounded-md border border-pao bg-white px-3 py-2 text-sm text-black focus:border-sangue focus:outline-none"
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
          className="rounded-md border border-pao bg-white px-3 py-2 text-sm text-black focus:border-sangue focus:outline-none"
        >
          {[ano - 1, ano, ano + 1].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <Botao type="submit" variante="secundario" tamanho="sm">Filtrar</Botao>
      </form>

      {/* Cards de resumo */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Cartao className="col-span-2 lg:col-span-1">
          <CartaoConteudo className="flex items-center gap-3 pt-5">
            <div className="rounded-lg bg-green-100 p-2.5">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-pao">Total do Mês</p>
              <p className="text-lg font-bold text-porta">{formatarMoeda(total)}</p>
            </div>
          </CartaoConteudo>
        </Cartao>

        {Object.entries(totaisPorTipo).map(([tipo, valor]) => (
          <Cartao key={tipo}>
            <CartaoConteudo className="flex items-center gap-3 pt-5">
              <div className="rounded-lg bg-cordeiro p-2.5">
                <DollarSign className="h-5 w-5 text-porta" />
              </div>
              <div>
                <p className="text-xs text-pao">{rotulosTipo[tipo as TipoTransacao]}</p>
                <p className="text-lg font-bold text-porta">{formatarMoeda(valor)}</p>
              </div>
            </CartaoConteudo>
          </Cartao>
        ))}
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {transacoes && transacoes.length > 0 ? (
          transacoes.map((t) => (
            <div key={t.id} className="rounded-lg border border-pao bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variante="sucesso">{rotulosTipo[t.tipo]}</Badge>
                  <span className="text-xs text-pao">{formatarDataCurta(t.data)}</span>
                </div>
                <span className="font-bold text-green-600">{formatarMoeda(t.valor)}</span>
              </div>
              {(t.membro || t.descricao) && (
                <div className="mt-1.5 text-sm text-pao">
                  {t.membro && <p>{(t.membro as { nome: string }).nome}</p>}
                  {t.descricao && <p>{t.descricao}</p>}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-pao bg-white p-8 text-center text-pao">
            Nenhuma transação neste período.
          </p>
        )}
        {transacoes && transacoes.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-pao bg-cordeiro px-4 py-3">
            <span className="text-sm font-semibold text-porta">Total</span>
            <span className="font-bold text-green-700">{formatarMoeda(total)}</span>
          </div>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-pao bg-white">
        <table className="w-full">
          <thead className="bg-cordeiro">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Membro</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Descrição</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-porta">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cordeiro">
            {transacoes && transacoes.length > 0 ? (
              transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-cordeiro/30">
                  <td className="px-4 py-3 text-sm text-pao">{formatarDataCurta(t.data)}</td>
                  <td className="px-4 py-3">
                    <Badge variante="sucesso">{rotulosTipo[t.tipo]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-pao">
                    {t.membro ? (t.membro as { nome: string }).nome : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-pao">{t.descricao ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                    {formatarMoeda(t.valor)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-pao">
                  Nenhuma transação neste período.
                </td>
              </tr>
            )}
          </tbody>
          {transacoes && transacoes.length > 0 && (
            <tfoot className="bg-cordeiro">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-porta">Total</td>
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
