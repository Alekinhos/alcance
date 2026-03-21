import { criarClienteServidor } from '@/lib/supabase/server'
import { formatarData } from '@/lib/utils'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

export default async function PaginaEventos() {
  const supabase = await criarClienteServidor()

  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .gte('data', new Date().toISOString().split('T')[0])
    .order('data', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Próximos Eventos</h1>
      <p className="mt-2 text-gray-500">Fique por dentro de tudo que está acontecendo na igreja.</p>

      <div className="mt-8 space-y-4">
        {eventos && eventos.length > 0 ? (
          eventos.map((evento) => (
            <div
              key={evento.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge variante={variantesTipo[evento.tipo]}>
                    {rotulosTipo[evento.tipo]}
                  </Badge>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">{evento.titulo}</h2>
                  {evento.descricao && (
                    <p className="mt-1 text-gray-600">{evento.descricao}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatarData(evento.data)}
                </span>
                {evento.hora && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {evento.hora}
                  </span>
                )}
                {evento.local && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {evento.local}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="py-12 text-center text-gray-500">
            Nenhum evento próximo agendado.
          </p>
        )}
      </div>
    </div>
  )
}
