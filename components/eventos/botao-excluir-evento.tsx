'use client'

import { useState, useTransition } from 'react'
import { excluirEvento } from '@/app/actions/eventos'
import { Botao } from '@/components/ui/botao'
import { ModalConfirmacao } from '@/components/ui/modal-confirmacao'
import { Trash2 } from 'lucide-react'

export function BotaoExcluirEvento({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      await excluirEvento(id)
      setAberto(false)
    })
  }

  return (
    <>
      <ModalConfirmacao
        aberto={aberto}
        titulo="Excluir evento"
        mensagem="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
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
