'use client'

import { Botao } from './botao'

interface Props {
  aberto: boolean
  titulo: string
  mensagem: string
  onConfirmar: () => void
  onCancelar: () => void
  carregando?: boolean
}

export function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  carregando,
}: Props) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-porta">{titulo}</h2>
        <p className="mt-2 text-sm text-pao">{mensagem}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Botao variante="secundario" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </Botao>
          <Botao variante="perigo" onClick={onConfirmar} carregando={carregando}>
            Excluir
          </Botao>
        </div>
      </div>
    </div>
  )
}
