'use client'

import { useState, useTransition } from 'react'
import { excluirPost } from '@/app/actions/blog'
import { Botao } from '@/components/ui/botao'
import { ModalConfirmacao } from '@/components/ui/modal-confirmacao'
import { Trash2 } from 'lucide-react'

export function BotaoExcluirPost({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      await excluirPost(id)
      setAberto(false)
    })
  }

  return (
    <>
      <ModalConfirmacao
        aberto={aberto}
        titulo="Excluir post"
        mensagem="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
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
