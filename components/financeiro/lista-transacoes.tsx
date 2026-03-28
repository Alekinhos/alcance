'use client'

import { useState, useTransition } from 'react'
import { formatarMoeda, formatarDataCurta } from '@/lib/utils'
import { excluirTransacao } from '@/app/actions/financeiro'
import { Badge } from '@/components/ui/badge'
import { Botao } from '@/components/ui/botao'
import { ModalConfirmacao } from '@/components/ui/modal-confirmacao'
import { Trash2 } from 'lucide-react'
import type { TipoTransacao } from '@/types/supabase'

const rotulosTipo: Record<TipoTransacao, string> = {
  dizimo: 'Dízimo',
  oferta: 'Oferta',
  doacao: 'Doação',
  outro: 'Outro',
}

interface Transacao {
  id: string
  tipo: TipoTransacao
  valor: number
  data: string
  descricao: string | null
  membro: { nome: string } | null
}

interface Props {
  transacoes: Transacao[]
  total: number
}

export function ListaTransacoes({ transacoes, total }: Props) {
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function confirmarExclusao() {
    if (!idParaExcluir) return
    startTransition(async () => {
      await excluirTransacao(idParaExcluir)
      setIdParaExcluir(null)
    })
  }

  return (
    <>
      <ModalConfirmacao
        aberto={!!idParaExcluir}
        titulo="Excluir transação"
        mensagem="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
        carregando={isPending}
      />

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {transacoes.length > 0 ? (
          transacoes.map((t) => (
            <div key={t.id} className="rounded-lg border border-pao bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variante="sucesso">{rotulosTipo[t.tipo]}</Badge>
                  <span className="text-xs text-pao">{formatarDataCurta(t.data)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">{formatarMoeda(t.valor)}</span>
                  <Botao
                    variante="fantasma"
                    tamanho="sm"
                    onClick={() => setIdParaExcluir(t.id)}
                  >
                    <Trash2 className="h-4 w-4 text-sangue" />
                  </Botao>
                </div>
              </div>
              {(t.membro || t.descricao) && (
                <div className="mt-1.5 text-sm text-pao">
                  {t.membro && <p>{t.membro.nome}</p>}
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
        {transacoes.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-pao bg-cordeiro px-4 py-3">
            <span className="text-sm font-semibold text-porta">Total</span>
            <span className="font-bold text-green-700">{formatarMoeda(total)}</span>
          </div>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-lg border border-pao bg-white md:block">
        <table className="w-full">
          <thead className="bg-cordeiro">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Data</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Membro</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Descrição</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-porta">Valor</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cordeiro">
            {transacoes.length > 0 ? (
              transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-cordeiro/30">
                  <td className="px-4 py-3 text-sm text-pao">{formatarDataCurta(t.data)}</td>
                  <td className="px-4 py-3">
                    <Badge variante="sucesso">{rotulosTipo[t.tipo]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-pao">
                    {t.membro ? t.membro.nome : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-pao">{t.descricao ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                    {formatarMoeda(t.valor)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Botao
                      variante="fantasma"
                      tamanho="sm"
                      onClick={() => setIdParaExcluir(t.id)}
                    >
                      <Trash2 className="h-4 w-4 text-sangue" />
                    </Botao>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pao">
                  Nenhuma transação neste período.
                </td>
              </tr>
            )}
          </tbody>
          {transacoes.length > 0 && (
            <tfoot className="bg-cordeiro">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-porta">Total</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-700">
                  {formatarMoeda(total)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  )
}
