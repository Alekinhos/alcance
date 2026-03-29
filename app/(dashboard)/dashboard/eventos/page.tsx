import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatarDataCurta } from '@/lib/utils'
import { Plus, Calendar, Clock, MapPin, Pencil, Repeat, Search, X } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { BotaoExcluirEvento } from '@/components/eventos/botao-excluir-evento'
import type { PapelUsuario, TipoEvento } from '@/types/supabase'

const rotulosTipo: Record<TipoEvento, string> = {
  culto: 'Culto',
  reuniao: 'Reunião',
  retiro: 'Retiro',
  outro: 'Evento',
}

const inputClasse =
  'rounded-md border border-pao bg-white px-3 py-2 text-sm text-black focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue'

export default async function PaginaEventosDashboard({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; data_de?: string; data_ate?: string; tipo?: string }>
}) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario
  const podeEditar = papel === 'admin' || papel === 'pastor' || papel === 'lider'

  const { busca, data_de, data_ate, tipo } = await searchParams

  let query = supabase.from('eventos').select('*').order('data', { ascending: false })
  if (busca) query = query.ilike('titulo', `%${busca}%`)
  if (data_de) query = query.gte('data', data_de)
  if (data_ate) query = query.lte('data', data_ate)
  if (tipo) query = query.eq('tipo', tipo)

  const { data: eventos } = await query

  const temFiltro = !!(busca || data_de || data_ate || tipo)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-porta">Eventos</h1>
          <p className="mt-1 text-pao">{eventos?.length ?? 0} evento(s)</p>
        </div>
        {podeEditar && (
          <Link href="/dashboard/eventos/novo">
            <Botao>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Novo Evento</span>
              <span className="sm:hidden">Novo</span>
            </Botao>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pao" />
          <input
            name="busca"
            defaultValue={busca}
            type="search"
            placeholder="Buscar por título..."
            className={`${inputClasse} pl-9 w-48`}
          />
        </div>

        <select name="tipo" defaultValue={tipo ?? ''} className={inputClasse}>
          <option value="">Todos os tipos</option>
          <option value="culto">Culto</option>
          <option value="reuniao">Reunião</option>
          <option value="retiro">Retiro</option>
          <option value="outro">Outro</option>
        </select>

        <div className="flex items-center gap-1">
          <input
            name="data_de"
            defaultValue={data_de}
            type="date"
            className={inputClasse}
            title="De"
          />
          <span className="text-pao text-sm">até</span>
          <input
            name="data_ate"
            defaultValue={data_ate}
            type="date"
            className={inputClasse}
            title="Até"
          />
        </div>

        <button type="submit" className={`${inputClasse} bg-sangue text-white border-sangue hover:bg-porta px-4`}>
          Filtrar
        </button>

        {temFiltro && (
          <Link
            href="/dashboard/eventos"
            className="flex items-center gap-1 text-sm text-pao hover:text-sangue"
          >
            <X className="h-3.5 w-3.5" /> Limpar
          </Link>
        )}
      </form>

      <div className="space-y-3">
        {eventos && eventos.length > 0 ? (
          eventos.map((evento) => (
            <div
              key={`${evento.id}-${evento.data}`}
              className="flex items-start justify-between gap-3 rounded-lg border border-pao bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{rotulosTipo[evento.tipo]}</Badge>
                  {evento.recorrente && (
                    <Badge variante="aviso">
                      <Repeat className="mr-1 h-3 w-3" />
                      {evento.frequencia === 'semanal' ? 'Semanal' : evento.frequencia === 'quinzenal' ? 'Quinzenal' : 'Mensal'}
                    </Badge>
                  )}
                  <h3 className="font-medium text-porta">{evento.titulo}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-pao">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatarDataCurta(evento.data)}
                  </span>
                  {evento.hora && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {evento.hora}
                    </span>
                  )}
                  {evento.local && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {evento.local}
                    </span>
                  )}
                </div>
              </div>

              {podeEditar && (
                <div className="flex shrink-0 items-center gap-1">
                  <Link href={`/dashboard/eventos/${evento.id}/editar`}>
                    <Botao variante="fantasma" tamanho="sm">
                      <Pencil className="h-4 w-4" />
                    </Botao>
                  </Link>
                  <BotaoExcluirEvento id={evento.id} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-pao p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-pao" />
            <p className="mt-2 text-pao">
              {temFiltro ? 'Nenhum evento encontrado com esses filtros.' : 'Nenhum evento cadastrado.'}
            </p>
            {!temFiltro && podeEditar && (
              <Link href="/dashboard/eventos/novo" className="mt-4 inline-block">
                <Botao variante="secundario" tamanho="sm">
                  Criar primeiro evento
                </Botao>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
