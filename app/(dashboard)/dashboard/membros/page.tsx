import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Botao } from '@/components/ui/botao'
import { Paginacao } from '@/components/ui/paginacao'
import type { PapelUsuario } from '@/types/supabase'

const rotulosPapel: Record<PapelUsuario, string> = {
  admin: 'Admin',
  pastor: 'Pastor',
  lider: 'Líder',
  membro: 'Membro',
}

const variantesPapel: Record<PapelUsuario, 'perigo' | 'aviso' | 'info' | 'padrao'> = {
  admin: 'perigo',
  pastor: 'aviso',
  lider: 'info',
  membro: 'padrao',
}

const ITENS_POR_PAGINA = 15

export default async function PaginaMembros({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; page?: string }>
}) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: meuPerfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = meuPerfil?.papel as PapelUsuario
  if (papel === 'membro') redirect('/dashboard')

  const { busca, page } = await searchParams

  let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true })
  if (busca) countQuery = countQuery.ilike('nome', `%${busca}%`)
  const { count } = await countQuery

  const totalItens = count ?? 0
  const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA))
  const pagina = Math.min(Math.max(1, parseInt(page ?? '1') || 1), totalPaginas)
  const inicio = (pagina - 1) * ITENS_POR_PAGINA

  let query = supabase.from('profiles').select('*').order('nome').range(inicio, inicio + ITENS_POR_PAGINA - 1)
  if (busca) query = query.ilike('nome', `%${busca}%`)

  const { data: membros } = await query
  const podeEditar = papel === 'admin' || papel === 'pastor'

  function gerarHref(n: number) {
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (n > 1) params.set('page', String(n))
    const qs = params.toString()
    return `/dashboard/membros${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-porta">Membros</h1>
          <p className="mt-1 text-pao">{totalItens} membro(s)</p>
        </div>
        {podeEditar && (
          <Link href="/dashboard/membros/novo">
            <Botao>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Novo Membro</span>
              <span className="sm:hidden">Novo</span>
            </Botao>
          </Link>
        )}
      </div>

      {/* Busca */}
      <form className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pao" />
          <input
            name="busca"
            defaultValue={busca}
            type="search"
            placeholder="Buscar por nome..."
            className="w-full rounded-md border border-pao bg-white py-2 pl-9 pr-4 text-sm text-black focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue"
          />
        </div>
      </form>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {membros && membros.length > 0 ? (
          membros.map((membro) => (
            <div key={membro.id} className="rounded-lg border border-pao bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {membro.foto_url ? (
                    <Image
                      src={membro.foto_url}
                      alt={membro.nome}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cordeiro text-sm font-medium text-porta">
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-porta">{membro.nome}</p>
                    <p className="text-xs text-pao">{membro.email}</p>
                  </div>
                </div>
                <Badge variante={variantesPapel[membro.papel as PapelUsuario]}>
                  {rotulosPapel[membro.papel as PapelUsuario]}
                </Badge>
              </div>
              {(membro.grupo || membro.telefone) && (
                <div className="mt-2 space-y-0.5 text-sm text-pao">
                  {membro.grupo && <p>Grupo: {membro.grupo}</p>}
                  {membro.telefone && <p>Tel: {membro.telefone}</p>}
                </div>
              )}
              {podeEditar && (
                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/dashboard/membros/${membro.id}/editar`}
                    className="text-sm font-medium text-sangue hover:text-porta"
                  >
                    Editar
                  </Link>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-pao bg-white p-8 text-center text-pao">
            Nenhum membro encontrado.
          </p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-pao bg-white">
        <table className="w-full">
          <thead className="bg-cordeiro">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Membro</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Papel</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Grupo/Célula</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-porta">Telefone</th>
              {podeEditar && (
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-porta">Ações</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-cordeiro">
            {membros && membros.length > 0 ? (
              membros.map((membro) => (
                <tr key={membro.id} className="hover:bg-cordeiro/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {membro.foto_url ? (
                        <Image
                          src={membro.foto_url}
                          alt={membro.nome}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cordeiro text-sm font-medium text-porta">
                          {membro.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-porta">{membro.nome}</p>
                        <p className="text-xs text-pao">{membro.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variante={variantesPapel[membro.papel as PapelUsuario]}>
                      {rotulosPapel[membro.papel as PapelUsuario]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-pao">{membro.grupo ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-pao">{membro.telefone ?? '—'}</td>
                  {podeEditar && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/membros/${membro.id}/editar`}
                        className="text-sm text-sangue hover:text-porta"
                      >
                        Editar
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-pao">
                  Nenhum membro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} gerarHref={gerarHref} />
    </div>
  )
}
