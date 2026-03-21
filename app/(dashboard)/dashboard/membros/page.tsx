import { criarClienteServidor } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Botao } from '@/components/ui/botao'
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

export default async function PaginaMembros({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>
}) {
  const supabase = await criarClienteServidor()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Verificar permissão
  const { data: meuPerfil } = await supabase
    .from('profiles')
    .select('papel')
    .eq('id', user.id)
    .single()

  const papel = meuPerfil?.papel as PapelUsuario
  if (papel === 'membro') redirect('/dashboard')

  const { busca } = await searchParams

  let query = supabase.from('profiles').select('*').order('nome')

  if (busca) {
    query = query.ilike('nome', `%${busca}%`)
  }

  const { data: membros } = await query

  const podeEditar = papel === 'admin' || papel === 'pastor'

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
          <p className="mt-1 text-gray-500">{membros?.length ?? 0} membro(s) cadastrado(s)</p>
        </div>
        {podeEditar && (
          <Link href="/dashboard/membros/novo">
            <Botao>
              <Plus className="mr-2 h-4 w-4" />
              Novo Membro
            </Botao>
          </Link>
        )}
      </div>

      {/* Busca */}
      <form className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="busca"
            defaultValue={busca}
            type="search"
            placeholder="Buscar por nome..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Tabela de membros */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Membro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Papel
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Grupo/Célula
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Telefone
              </th>
              {podeEditar && (
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {membros && membros.length > 0 ? (
              membros.map((membro) => (
                <tr key={membro.id} className="hover:bg-gray-50">
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                          {membro.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{membro.nome}</p>
                        <p className="text-xs text-gray-500">{membro.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variante={variantesPapel[membro.papel as PapelUsuario]}>
                      {rotulosPapel[membro.papel as PapelUsuario]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {membro.grupo ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {membro.telefone ?? '—'}
                  </td>
                  {podeEditar && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/membros/${membro.id}/editar`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhum membro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
