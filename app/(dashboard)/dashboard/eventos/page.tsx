import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatarDataCurta } from '@/lib/utils'
import { Plus, Calendar, Clock, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { excluirEvento } from '@/app/actions/eventos'
import type { PapelUsuario, TipoEvento } from '@/types/supabase'

const rotulosTipo: Record<TipoEvento, string> = {
  culto: 'Culto',
  reuniao: 'Reunião',
  retiro: 'Retiro',
  outro: 'Evento',
}

export default async function PaginaEventosDashboard() {
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

  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="mt-1 text-gray-500">{eventos?.length ?? 0} evento(s) cadastrado(s)</p>
        </div>
        {podeEditar && (
          <Link href="/dashboard/eventos/novo">
            <Botao>
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Botao>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {eventos && eventos.length > 0 ? (
          eventos.map((evento) => (
            <div
              key={evento.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge>{rotulosTipo[evento.tipo]}</Badge>
                  <h3 className="font-medium text-gray-900">{evento.titulo}</h3>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
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
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/eventos/${evento.id}/editar`}>
                    <Botao variante="fantasma" tamanho="sm">
                      <Pencil className="h-4 w-4" />
                    </Botao>
                  </Link>
                  <form
                    action={async () => {
                      'use server'
                      await excluirEvento(evento.id)
                    }}
                  >
                    <Botao variante="fantasma" tamanho="sm" type="submit">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Botao>
                  </form>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">Nenhum evento cadastrado.</p>
            {podeEditar && (
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
