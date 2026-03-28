import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatarMoeda } from '@/lib/utils'
import { DollarSign, TrendingUp, Plus } from 'lucide-react'
import { Cartao, CartaoConteudo } from '@/components/ui/cartao'
import Link from 'next/link'
import { Botao } from '@/components/ui/botao'
import { ListaTransacoes } from '@/components/financeiro/lista-transacoes'
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

      <ListaTransacoes transacoes={(transacoes ?? []) as any} total={total} />
    </div>
  )
}
