'use client'

import { useState } from 'react'
import { criarClienteSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Church } from 'lucide-react'
import { Campo } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import Link from 'next/link'

export default function PaginaLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const supabase = criarClienteSupabase()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Email ou senha incorretos. Tente novamente.')
      setCarregando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Igreja Alcance</h1>
          <p className="mt-1 text-sm text-gray-500">Entre na sua conta para continuar</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <Campo
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
            <div className="space-y-1">
              <Campo
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end">
                <Link href="/auth/esqueci-senha" className="text-xs text-blue-600 hover:text-blue-800">
                  Esqueci a senha
                </Link>
              </div>
            </div>

            {erro && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <Botao type="submit" carregando={carregando} className="w-full" tamanho="lg">
              Entrar
            </Botao>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Tem um código de convite?{' '}
            <Link href="/auth/cadastro" className="font-medium text-blue-600 hover:text-blue-800">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
