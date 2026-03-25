import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Cartao, CartaoConteudo, CartaoHeader, CartaoTitulo } from '@/components/ui/cartao'
import { formatarMoeda, formatarDataCurta } from '@/lib/utils'
import { Users, Calendar, DollarSign, FileText } from 'lucide-react'
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
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-porta">
          Bem-vindo, {perfil?.nome?.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-pao">Aqui está um resumo da sua comunidade.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Cartao>
          <CartaoConteudo className="flex items-center gap-3 pt-5">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-pao">Membros</p>
              <p className="text-xl font-bold text-porta">{totalMembros ?? 0}</p>
            </div>
          </CartaoConteudo>
        </Cartao>

        <Cartao>
          <CartaoConteudo className="flex items-center gap-3 pt-5">
            <div className="rounded-lg bg-green-100 p-2.5">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-pao">Eventos</p>
              <p className="text-xl font-bold text-porta">{proximosEventos?.length ?? 0}</p>
            </div>
          </CartaoConteudo>
        </Cartao>

        {podeVerFinanceiro && (
          <Cartao>
            <CartaoConteudo className="flex items-center gap-3 pt-5">
              <div className="rounded-lg bg-yellow-100 p-2.5">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-pao">Mês</p>
                <p className="text-xl font-bold text-porta">{formatarMoeda(totalMes)}</p>
              </div>
            </CartaoConteudo>
          </Cartao>
        )}

        <Cartao>
          <CartaoConteudo className="flex items-center gap-3 pt-5">
            <div className="rounded-lg bg-purple-100 p-2.5">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-pao">Posts</p>
              <p className="text-xl font-bold text-porta">{totalPosts ?? 0}</p>
            </div>
          </CartaoConteudo>
        </Cartao>
      </div>

      {/* Próximos eventos + Transações */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Cartao>
          <CartaoHeader>
            <CartaoTitulo>Próximos Eventos</CartaoTitulo>
          </CartaoHeader>
          <CartaoConteudo>
            {proximosEventos && proximosEventos.length > 0 ? (
              <ul className="space-y-3">
                {proximosEventos.map((evento) => (
                  <li key={evento.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-md bg-cordeiro text-center">
                      <span className="text-xs font-bold text-sangue">
                        {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit' })}
                      </span>
                      <span className="text-xs text-pao">
                        {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-porta">{evento.titulo}</p>
                      {evento.local && (
                        <p className="text-xs text-pao">{evento.local}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-pao">Nenhum evento próximo.</p>
            )}
          </CartaoConteudo>
        </Cartao>

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
                        <p className="text-sm font-medium capitalize text-porta">{t.tipo}</p>
                        <p className="text-xs text-pao">{formatarDataCurta(t.data)}</p>
                      </div>
                      <span className="font-semibold text-green-600">{formatarMoeda(t.valor)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-pao">Nenhuma transação recente.</p>
              )}
            </CartaoConteudo>
          </Cartao>
        )}
      </div>
    </div>
  )
}
