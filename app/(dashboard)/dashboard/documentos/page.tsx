import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FolderOpen, Search, X, FileText, FileImage, File, ExternalLink } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Badge } from '@/components/ui/badge'
import { BotaoExcluirDocumento } from '@/components/documentos/botao-excluir-documento'
import { formatarDataCurta } from '@/lib/utils'
import type { PapelUsuario, CategoriaDocumento } from '@/types/supabase'

const rotulosCategoria: Record<CategoriaDocumento, string> = {
  ata: 'Ata de Reunião',
  contrato: 'Contrato',
  estatuto: 'Estatuto',
  relatorio: 'Relatório',
  outro: 'Outro',
}

const variantesCategoria: Record<CategoriaDocumento, 'info' | 'sucesso' | 'aviso' | 'perigo' | 'padrao'> = {
  ata: 'info',
  contrato: 'sucesso',
  estatuto: 'aviso',
  relatorio: 'perigo',
  outro: 'padrao',
}

function IconeArquivo({ tipo }: { tipo: string | null }) {
  if (tipo?.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />
  if (tipo === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />
  return <File className="h-5 w-5 text-pao" />
}

function formatarTamanho(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const inputClasse =
  'rounded-md border border-pao bg-white px-3 py-2 text-sm text-black focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue'

export default async function PaginaDocumentos({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; categoria?: string }>
}) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = perfil?.papel as PapelUsuario

  const { busca, categoria } = await searchParams

  let query = supabase.from('documentos').select('*, criador:profiles!documentos_criado_por_fkey(nome)').order('created_at', { ascending: false })
  if (busca) query = query.ilike('titulo', `%${busca}%`)
  if (categoria) query = query.eq('categoria', categoria)

  const { data: documentos } = await query

  const podeEnviar = ['admin', 'pastor', 'lider'].includes(papel)
  const podeDeletar = ['admin', 'pastor'].includes(papel)
  const temFiltro = !!(busca || categoria)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-porta">Documentos</h1>
          <p className="mt-1 text-pao">{documentos?.length ?? 0} documento(s)</p>
        </div>
        {podeEnviar && (
          <Link href="/dashboard/documentos/novo">
            <Botao>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Novo Documento</span>
              <span className="sm:hidden">Novo</span>
            </Botao>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pao" />
          <input
            name="busca"
            defaultValue={busca}
            type="search"
            placeholder="Buscar por título..."
            className={`${inputClasse} pl-9 w-52`}
          />
        </div>

        <select name="categoria" defaultValue={categoria ?? ''} className={inputClasse}>
          <option value="">Todas as categorias</option>
          <option value="ata">Ata de Reunião</option>
          <option value="contrato">Contrato</option>
          <option value="estatuto">Estatuto</option>
          <option value="relatorio">Relatório</option>
          <option value="outro">Outro</option>
        </select>

        <button type="submit" className="rounded-md border border-sangue bg-sangue px-4 py-2 text-sm font-medium text-white hover:bg-porta focus:outline-none">
          Filtrar
        </button>

        {temFiltro && (
          <Link href="/dashboard/documentos" className="flex items-center gap-1 text-sm text-pao hover:text-sangue">
            <X className="h-3.5 w-3.5" /> Limpar
          </Link>
        )}
      </form>

      <div className="space-y-3">
        {documentos && documentos.length > 0 ? (
          documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-lg border border-pao bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cordeiro">
                <IconeArquivo tipo={doc.arquivo_tipo} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variante={variantesCategoria[doc.categoria as CategoriaDocumento]}>
                    {rotulosCategoria[doc.categoria as CategoriaDocumento]}
                  </Badge>
                  <h3 className="font-medium text-porta truncate">{doc.titulo}</h3>
                </div>
                {doc.descricao && (
                  <p className="mt-0.5 text-sm text-pao line-clamp-1">{doc.descricao}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-pao">
                  <span>{doc.arquivo_nome}</span>
                  <span>·</span>
                  <span>{formatarTamanho(doc.arquivo_tamanho)}</span>
                  <span>·</span>
                  <span>{formatarDataCurta(doc.created_at)}</span>
                  {doc.criador && (
                    <>
                      <span>·</span>
                      <span>por {(doc.criador as { nome: string }).nome}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={doc.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir arquivo"
                >
                  <Botao variante="fantasma" tamanho="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Botao>
                </a>
                {podeDeletar && (
                  <BotaoExcluirDocumento id={doc.id} arquivoPath={doc.arquivo_path} />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-pao p-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-pao" />
            <p className="mt-2 text-pao">
              {temFiltro ? 'Nenhum documento encontrado com esses filtros.' : 'Nenhum documento cadastrado.'}
            </p>
            {!temFiltro && podeEnviar && (
              <Link href="/dashboard/documentos/novo" className="mt-4 inline-block">
                <Botao variante="secundario" tamanho="sm">Enviar primeiro documento</Botao>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
