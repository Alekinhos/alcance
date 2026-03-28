'use client'

import { useState, useRef, useEffect } from 'react'

interface Membro {
  id: string
  nome: string
}

interface Props {
  membros: Membro[]
}

export function BuscaMembro({ membros }: Props) {
  const [busca, setBusca] = useState('')
  const [idSelecionado, setIdSelecionado] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtrados = busca.length > 0
    ? membros.filter((m) =>
        m.nome.toLowerCase().includes(busca.toLowerCase())
      ).slice(0, 8)
    : []

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function selecionar(membro: Membro) {
    setBusca(membro.nome)
    setIdSelecionado(membro.id)
    setAberto(false)
  }

  function limpar() {
    setBusca('')
    setIdSelecionado('')
  }

  return (
    <div ref={ref} className="relative flex flex-col gap-1">
      <label className="text-sm font-medium text-porta">
        Membro <span className="font-normal text-pao">(opcional)</span>
      </label>

      <input type="hidden" name="membro_id" value={idSelecionado} />

      <div className="relative">
        <input
          type="text"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setIdSelecionado('')
            setAberto(true)
          }}
          onFocus={() => busca.length > 0 && setAberto(true)}
          placeholder="Digite o nome do membro..."
          className="w-full rounded-md border border-pao bg-white px-3 py-2 text-sm text-black placeholder-pao/60 focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue"
        />
        {busca && (
          <button
            type="button"
            onClick={limpar}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-pao hover:text-porta"
          >
            ✕
          </button>
        )}
      </div>

      {aberto && filtrados.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-md border border-pao bg-white shadow-lg">
          {filtrados.map((m) => (
            <li
              key={m.id}
              onMouseDown={() => selecionar(m)}
              className="cursor-pointer px-3 py-2 text-sm text-black hover:bg-cordeiro"
            >
              {m.nome}
            </li>
          ))}
        </ul>
      )}

      {busca && !idSelecionado && filtrados.length === 0 && (
        <p className="text-xs text-pao">Nenhum membro encontrado.</p>
      )}

      <p className="text-xs text-pao">Deixe em branco para entradas anônimas.</p>
    </div>
  )
}
