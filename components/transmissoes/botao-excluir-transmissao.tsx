'use client'

import { useState, useTransition } from 'react'
import { excluirTransmissao } from '@/app/actions/transmissoes'
import { Botao } from '@/components/ui/botao'
import { ModalConfirmacao } from '@/components/ui/modal-confirmacao'
import { Trash2 } from 'lucide-react'

export function BotaoExcluirTransmissao({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      await excluirTransmissao(id)
      setAberto(false)
    })
  }

  return (
    <>
      <ModalConfirmacao
        aberto={aberto}
        titulo="Excluir transmissão"
        mensagem="Tem certeza que deseja excluir esta transmissão? Esta ação não pode ser desfeita."
        onConfirmar={confirmar}
        onCancelar={() => setAberto(false)}
        carregando={isPending}
      />
      <Botao variante="fantasma" tamanho="sm" onClick={() => setAberto(true)}>
        <Trash2 className="h-4 w-4 text-sangue" />
      </Botao>
    </>
  )
}
