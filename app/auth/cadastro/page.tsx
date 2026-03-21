'use client'

import { useState } from 'react'
import { cadastrarComConvite } from '@/app/actions/auth'
import { Campo } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { Church, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function FormCadastro() {
  const searchParams = useSearchParams()
  const codigoInicial = searchParams.get('codigo') ?? ''

  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const dados = new FormData(e.currentTarget)
    const resultado = await cadastrarComConvite(dados)

    if (resultado?.erro) {
      setErro(resultado.erro)
      setCarregando(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
          <Church className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Criar Conta</h1>
        <p className="mt-1 text-sm text-gray-500">
          Você precisa de um código de convite para se cadastrar.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código de convite em destaque */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
              <KeyRound className="h-4 w-4" />
              Código de Convite
            </div>
            <input
              name="codigo"
              defaultValue={codigoInicial}
              required
              placeholder="XXXX-XXXX"
              className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-center font-mono text-lg font-bold uppercase tracking-widest text-blue-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={9}
            />
          </div>

          <Campo label="Nome completo" name="nome" required autoComplete="name" />
          <Campo label="Email" name="email" type="email" required autoComplete="email" />

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo
              label="Senha"
              name="senha"
              type="password"
              required
              autoComplete="new-password"
              ajuda="Mínimo 6 caracteres"
            />
            <Campo
              label="Confirmar senha"
              name="confirmar_senha"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</div>
          )}

          <Botao type="submit" carregando={carregando} className="w-full" tamanho="lg">
            Criar Conta
          </Botao>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-800">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PaginaCadastro() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />}>
        <FormCadastro />
      </Suspense>
    </div>
  )
}
