import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Cartao, CartaoConteudo, CartaoHeader, CartaoTitulo } from '@/components/ui/cartao'
import { formatarMoeda, formatarDataCurta } from '@/lib/utils'
import { Users, Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react'
import type { PapelUsuario } from '@/types/supabase'

export default async function PainelPage() {
  const supabase = await criarClienteServidor()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('nome, papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario

  // Buscar dados para os cards de resumo
  const [
    { count: totalMembros },
    { data: proximosEventos },
    { data: transacoesRecentes },
    { count: totalPosts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('eventos')
      .select('*')
      .gte('data', new Date().toISOString().split('T')[0])
      .order('data', { ascending: true })
      .limit(3),
    papel === 'admin' || papel === 'pastor'
      ? supabase
          .from('transacoes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: null }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('publicado', true),
  ])

  // Calcular total financeiro do mês atual
  let totalMes = 0
  if (transacoesRecentes) {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    const { data: transacoesMes } = await supabase
      .from('transacoes')
      .select('valor')
      .gte('data', inicioMes.toISOString().split('T')[0])
    totalMes = transacoesMes?.reduce((soma, t) => soma + t.valor, 0) ?? 0
  }

  const podeVerFinanceiro = papel === 'admin' || papel === 'pastor'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {perfil?.nome?.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-gray-500">Aqui está um resumo da sua comunidade.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao>
          <CartaoConteudo className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Membros</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembros ?? 0}</p>
            </div>
          </CartaoConteudo>
        </Cartao>

        <Cartao>
          <CartaoConteudo className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Próximos Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{proximosEventos?.length ?? 0}</p>
            </div>
          </CartaoConteudo>
        </Cartao>

        {podeVerFinanceiro && (
          <Cartao>
            <CartaoConteudo className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-yellow-100 p-3">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Entradas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">{formatarMoeda(totalMes)}</p>
              </div>
            </CartaoConteudo>
          </Cartao>
        )}

        <Cartao>
          <CartaoConteudo className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-100 p-3">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Posts Publicados</p>
              <p className="text-2xl font-bold text-gray-900">{totalPosts ?? 0}</p>
            </div>
          </CartaoConteudo>
        </Cartao>
      </div>

      {/* Próximos eventos */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Cartao>
          <CartaoHeader>
            <CartaoTitulo>Próximos Eventos</CartaoTitulo>
          </CartaoHeader>
          <CartaoConteudo>
            {proximosEventos && proximosEventos.length > 0 ? (
              <ul className="space-y-3">
                {proximosEventos.map((evento) => (
                  <li key={evento.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-md bg-blue-50 text-center">
                      <span className="text-xs font-bold text-blue-600">
                        {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit' })}
                      </span>
                      <span className="text-xs text-blue-500">
                        {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{evento.titulo}</p>
                      {evento.local && (
                        <p className="text-xs text-gray-500">{evento.local}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nenhum evento próximo.</p>
            )}
          </CartaoConteudo>
        </Cartao>

        {/* Últimas transações (apenas admin/pastor) */}
        {podeVerFinanceiro && transacoesRecentes && (
          <Cartao>
            <CartaoHeader>
              <CartaoTitulo>Últimas Entradas</CartaoTitulo>
            </CartaoHeader>
            <CartaoConteudo>
              {transacoesRecentes.length > 0 ? (
                <ul className="space-y-3">
                  {transacoesRecentes.map((t) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize text-gray-900">{t.tipo}</p>
                        <p className="text-xs text-gray-500">{formatarDataCurta(t.data)}</p>
                      </div>
                      <span className="font-semibold text-green-600">{formatarMoeda(t.valor)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma transação recente.</p>
              )}
            </CartaoConteudo>
          </Cartao>
        )}
      </div>
    </div>
  )
}
