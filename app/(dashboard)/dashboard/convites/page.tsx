'use client'

import { useState, useEffect, useCallback } from 'react'
import { gerarConvite, excluirConvite } from '@/app/actions/auth'
import { criarClienteSupabase } from '@/lib/supabase/client'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { formatarDataCurta } from '@/lib/utils'
import { Plus, Copy, Trash2, Check, Link as LinkIcon } from 'lucide-react'
import type { Convite } from '@/types/supabase'

export default function PaginaConvites() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [carregando, setCarregando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [novocodigo, setNovoCodigo] = useState<string | null>(null)
  const supabase = criarClienteSupabase()

  const buscarConvites = useCallback(async () => {
    const { data } = await supabase
      .from('convites')
      .select('*')
      .order('created_at', { ascending: false })
    setConvites(data ?? [])
  }, [supabase])

  useEffect(() => {
    buscarConvites()
  }, [buscarConvites])

  async function handleGerar() {
    setCarregando(true)
    setNovoCodigo(null)
    const resultado = await gerarConvite()
    if (resultado?.codigo) {
      setNovoCodigo(resultado.codigo)
      await buscarConvites()
    }
    setCarregando(false)
  }

  async function handleExcluir(id: string) {
    await excluirConvite(id)
    await buscarConvites()
  }

  function copiarCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  function copiarLink(codigo: string) {
    const url = `${window.location.origin}/auth/cadastro?codigo=${codigo}`
    navigator.clipboard.writeText(url)
    setCopiado(`link-${codigo}`)
    setTimeout(() => setCopiado(null), 2000)
  }

  const disponiveis = convites.filter((c) => !c.usado)
  const usados = convites.filter((c) => c.usado)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-porta">Convites</h1>
          <p className="mt-1 text-pao">
            {disponiveis.length} disponível(is) · {usados.length} usado(s)
          </p>
        </div>
        <Botao onClick={handleGerar} carregando={carregando}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Gerar Convite</span>
          <span className="sm:hidden">Gerar</span>
        </Botao>
      </div>

      {/* Novo código gerado */}
      {novocodigo && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-2 text-sm font-medium text-green-800">Novo convite gerado!</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-widest text-green-900">
              {novocodigo}
            </span>
            <Botao variante="secundario" tamanho="sm" onClick={() => copiarCodigo(novocodigo)}>
              {copiado === novocodigo ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Botao>
            <Botao variante="secundario" tamanho="sm" onClick={() => copiarLink(novocodigo)}>
              {copiado === `link-${novocodigo}` ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
            </Botao>
          </div>
          <p className="mt-2 break-all text-xs text-green-700">
            Link: {typeof window !== 'undefined' ? window.location.origin : ''}/auth/cadastro?codigo={novocodigo}
          </p>
        </div>
      )}

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {convites.length > 0 ? (
          convites.map((convite) => (
            <div key={convite.id} className="rounded-lg border border-pao bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-base font-bold tracking-widest text-porta">
                    {convite.codigo}
                  </span>
                  <p className="mt-0.5 text-xs text-pao">{formatarDataCurta(convite.created_at)}</p>
                </div>
                <Badge variante={convite.usado ? 'padrao' : 'sucesso'}>
                  {convite.usado ? 'Usado' : 'Disponível'}
                </Badge>
              </div>
              <div className="mt-3 flex justify-end gap-1">
                {!convite.usado && (
                  <>
                    <Botao variante="fantasma" tamanho="sm" onClick={() => copiarCodigo(convite.codigo)} title="Copiar código">
                      {copiado === convite.codigo ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Botao>
                    <Botao variante="fantasma" tamanho="sm" onClick={() => copiarLink(convite.codigo)} title="Copiar link">
                      {copiado === `link-${convite.codigo}` ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
                    </Botao>
                  </>
                )}
                <Botao variante="fantasma" tamanho="sm" onClick={() => handleExcluir(convite.id)} title="Excluir">
                  <Trash2 className="h-4 w-4 text-sangue" />
                </Botao>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-pao bg-white p-8 text-center text-pao">
            Nenhum convite gerado ainda.
          </p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-pao bg-white">
        <table className="w-full">
          <thead className="bg-cordeiro">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Criado em</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-porta">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cordeiro">
            {convites.length > 0 ? (
              convites.map((convite) => (
                <tr key={convite.id} className="hover:bg-cordeiro/30">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold tracking-widest text-porta">
                      {convite.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variante={convite.usado ? 'padrao' : 'sucesso'}>
                      {convite.usado ? 'Usado' : 'Disponível'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-pao">{formatarDataCurta(convite.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {!convite.usado && (
                        <>
                          <Botao variante="fantasma" tamanho="sm" onClick={() => copiarCodigo(convite.codigo)} title="Copiar código">
                            {copiado === convite.codigo ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </Botao>
                          <Botao variante="fantasma" tamanho="sm" onClick={() => copiarLink(convite.codigo)} title="Copiar link de cadastro">
                            {copiado === `link-${convite.codigo}` ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
                          </Botao>
                        </>
                      )}
                      <Botao variante="fantasma" tamanho="sm" onClick={() => handleExcluir(convite.id)} title="Excluir convite">
                        <Trash2 className="h-4 w-4 text-sangue" />
                      </Botao>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-pao">
                  Nenhum convite gerado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
