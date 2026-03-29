import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Radio, Calendar, Pencil, ExternalLink } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { BotaoExcluirTransmissao } from '@/components/transmissoes/botao-excluir-transmissao'
import { formatarDataCurta } from '@/lib/utils'
import type { PapelUsuario } from '@/types/supabase'

export default async function PaginaTransmissoes() {
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

  const { data: transmissoes } = await supabase
    .from('transmissoes')
    .select('*')
    .order('data', { ascending: false })

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-porta">Transmissões</h1>
          <p className="mt-1 text-pao">{transmissoes?.length ?? 0} transmissão(ões)</p>
        </div>
        {podeEditar && (
          <Link href="/dashboard/transmissoes/nova">
            <Botao>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nova Transmissão</span>
              <span className="sm:hidden">Nova</span>
            </Botao>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {transmissoes && transmissoes.length > 0 ? (
          transmissoes.map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-pao bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {t.ao_vivo ? (
                    <Badge variante="perigo">
                      <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      Ao Vivo
                    </Badge>
                  ) : (
                    <Badge variante="padrao">Gravado</Badge>
                  )}
                  <h3 className="font-medium text-porta">{t.titulo}</h3>
                </div>
                {t.descricao && (
                  <p className="mt-1 text-sm text-pao line-clamp-1">{t.descricao}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-pao">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatarDataCurta(t.data)}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-xs">
                    <Radio className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t.youtube_url}</span>
                  </span>
                </div>
              </div>

              {podeEditar && (
                <div className="flex shrink-0 items-center gap-1">
                  <Link href={`/dashboard/transmissoes/${t.id}/editar`}>
                    <Botao variante="fantasma" tamanho="sm">
                      <Pencil className="h-4 w-4" />
                    </Botao>
                  </Link>
                  <BotaoExcluirTransmissao id={t.id} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-pao p-12 text-center">
            <Radio className="mx-auto h-12 w-12 text-pao" />
            <p className="mt-2 text-pao">Nenhuma transmissão cadastrada.</p>
            {podeEditar && (
              <Link href="/dashboard/transmissoes/nova" className="mt-4 inline-block">
                <Botao variante="secundario" tamanho="sm">
                  Cadastrar primeira transmissão
                </Botao>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
