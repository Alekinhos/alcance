'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { criarDocumento } from '@/app/actions/documentos'
import Link from 'next/link'
import { Upload, ArrowLeft } from 'lucide-react'

const inputClasse =
  'w-full rounded-md border border-pao bg-white px-3 py-2 text-sm text-black focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue'
const labelClasse = 'block text-sm font-medium text-porta'

function BotaoEnviar() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-md bg-sangue px-5 py-2.5 text-sm font-medium text-white hover:bg-porta disabled:opacity-60 focus:outline-none"
    >
      <Upload className="h-4 w-4" />
      {pending ? 'Enviando...' : 'Enviar Documento'}
    </button>
  )
}

export function FormularioNovoDocumento() {
  const [state, action] = useActionState(criarDocumento, null)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/documentos"
          className="mb-4 flex items-center gap-1 text-sm text-pao hover:text-sangue"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold text-porta">Novo Documento</h1>
        <p className="mt-1 text-sm text-pao">Anexe um arquivo e preencha as informações abaixo.</p>
      </div>

      <form action={action} className="max-w-xl space-y-5">
        {state?.erro && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.erro}
          </div>
        )}

        <div>
          <label className={labelClasse}>Título *</label>
          <input name="titulo" required type="text" className={`mt-1 ${inputClasse}`} placeholder="Ex: Ata de Reunião — Março 2026" />
        </div>

        <div>
          <label className={labelClasse}>Categoria *</label>
          <select name="categoria" required className={`mt-1 ${inputClasse}`}>
            <option value="">Selecione uma categoria</option>
            <option value="ata">Ata de Reunião</option>
            <option value="contrato">Contrato</option>
            <option value="estatuto">Estatuto</option>
            <option value="relatorio">Relatório</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className={labelClasse}>Descrição</label>
          <textarea name="descricao" rows={3} className={`mt-1 ${inputClasse} resize-none`} placeholder="Descrição opcional do documento..." />
        </div>

        <div>
          <label className={labelClasse}>Arquivo * <span className="font-normal text-pao">(PDF, Word, Excel, imagem — máx. 10 MB)</span></label>
          <input
            name="arquivo"
            required
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            className="mt-1 block w-full text-sm text-pao file:mr-4 file:rounded-md file:border-0 file:bg-sangue file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-porta cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <BotaoEnviar />
          <Link href="/dashboard/documentos" className="text-sm text-pao hover:text-sangue">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
