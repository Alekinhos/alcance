import { criarClienteServidor } from '@/lib/supabase/server'
import { Clock, MapPin, Calendar, Repeat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Paginacao } from '@/components/ui/paginacao'
import { expandirEventos } from '@/lib/recorrencia'
import type { TipoEvento } from '@/types/supabase'

const rotulosTipo: Record<TipoEvento, string> = {
  culto: 'Culto',
  reuniao: 'Reunião',
  retiro: 'Retiro',
  outro: 'Evento',
}

const variantesTipo: Record<TipoEvento, 'info' | 'sucesso' | 'aviso' | 'padrao'> = {
  culto: 'info',
  reuniao: 'sucesso',
  retiro: 'aviso',
  outro: 'padrao',
}

const ITENS_POR_PAGINA = 10

export default async function PaginaEventos({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await criarClienteServidor()

  const { data: eventosRaw } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: true })

  const todosEventos = expandirEventos(eventosRaw ?? [])
  const totalItens = todosEventos.length
  const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA))

  const { page } = await searchParams
  const pagina = Math.min(Math.max(1, parseInt(page ?? '1') || 1), totalPaginas)

  const inicio = (pagina - 1) * ITENS_POR_PAGINA
  const eventos = todosEventos.slice(inicio, inicio + ITENS_POR_PAGINA)

  function gerarHref(n: number) {
    return n === 1 ? '/eventos' : `/eventos?page=${n}`
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-porta">Próximos Eventos</h1>
        <p className="mt-2 text-pao">Fique por dentro de tudo que está acontecendo na igreja.</p>
      </div>

      <div className="space-y-4">
        {eventos && eventos.length > 0 ? (
          eventos.map((evento) => {
            const data = new Date(evento.data + 'T00:00:00')
            return (
              <div
                key={`${evento.id}-${evento.data}`}
                className="flex gap-4 overflow-hidden rounded-xl border border-pao bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Badge de data */}
                <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-sangue py-4 text-white">
                  <span className="text-3xl font-bold leading-none">{data.getDate()}</span>
                  <span className="mt-1 text-sm uppercase">
                    {data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                  </span>
                  <span className="mt-0.5 text-xs opacity-75">{data.getFullYear()}</span>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-1 flex-col justify-center py-5 pr-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variante={variantesTipo[evento.tipo]}>
                      {rotulosTipo[evento.tipo]}
                    </Badge>
                    {evento.recorrente && (
                      <span className="flex items-center gap-1 text-xs text-pao">
                        <Repeat className="h-3 w-3" />
                        {evento.frequencia === 'semanal' ? 'Semanal' : evento.frequencia === 'quinzenal' ? 'Quinzenal' : 'Mensal'}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1.5 text-xl font-semibold text-porta">{evento.titulo}</h2>
                  {evento.descricao && (
                    <p className="mt-1 text-sm text-pao line-clamp-2">{evento.descricao}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-pao">
                    {evento.hora && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-sangue" />
                        {evento.hora}
                      </span>
                    )}
                    {evento.local && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-sangue" />
                        {evento.local}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border border-dashed border-pao py-20 text-center">
            <Calendar className="mx-auto h-12 w-12 text-pao" />
            <p className="mt-3 text-lg font-medium text-porta">Nenhum evento próximo</p>
            <p className="mt-1 text-sm text-pao">Fique de olho, em breve teremos novidades!</p>
          </div>
        )}
      </div>

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} gerarHref={gerarHref} />
    </div>
  )
}
