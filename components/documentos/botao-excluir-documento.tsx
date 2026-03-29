'use client'

import { excluirDocumento } from '@/app/actions/documentos'
import { ModalConfirmacao } from '@/components/ui/modal-confirmacao'

interface Props {
  id: string
  arquivoPath: string
}

export function BotaoExcluirDocumento({ id, arquivoPath }: Props) {
  return (
    <ModalConfirmacao
      titulo="Excluir documento"
      descricao="Tem certeza que deseja excluir este documento? O arquivo também será removido permanentemente."
      onConfirmar={() => excluirDocumento(id, arquivoPath)}
    />
  )
}
