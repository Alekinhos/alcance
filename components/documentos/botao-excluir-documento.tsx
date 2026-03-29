'use client'

import { useState, useTransition } from 'react'
import { excluirDocumento } from '@/app/actions/documentos'
import { Botao } from '@/components/ui/botao'
import { ModalConfirmacao } from '@/components/ui/modal-confirmacao'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  arquivoPath: string
}

export function BotaoExcluirDocumento({ id, arquivoPath }: Props) {
  const [aberto, setAberto] = useState(false)
  const [isPending, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      await excluirDocumento(id, arquivoPath)
      setAberto(false)
    })
  }

  return (
    <>
      <ModalConfirmacao
        aberto={aberto}
        titulo="Excluir documento"
        mensagem="Tem certeza que deseja excluir este documento? O arquivo também será removido permanentemente."
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
