'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schemaRedefinirSenha, type RedefinirSenhaInput } from '@/lib/validations/auth'
import { criarClienteSupabase } from '@/lib/supabase/client'
import { Campo } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { Church } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function calcularForca(senha: string): { nivel: 0 | 1 | 2 | 3; label: string; cor: string } {
  if (!senha) return { nivel: 0, label: '', cor: '' }
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (/[A-Z]/.test(senha)) pontos++
  if (/[0-9]/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  if (pontos <= 1) return { nivel: 1, label: 'Fraca', cor: 'bg-red-500' }
  if (pontos <= 2) return { nivel: 2, label: 'Média', cor: 'bg-yellow-500' }
  return { nivel: 3, label: 'Forte', cor: 'bg-green-500' }
}

function FormRedefinirSenha() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = criarClienteSupabase()

  const [status, setStatus] = useState<'verificando' | 'pronto' | 'erro'>('verificando')
  const [erroServidor, setErroServidor] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaInput>({
    resolver: zodResolver(schemaRedefinirSenha),
    mode: 'onTouched',
  })

  const senhaAtual = watch('senha') ?? ''
  const forca = calcularForca(senhaAtual)

  useEffect(() => {
    // Com PKCE, a sessão já foi trocada pelo /auth/callback.
    // Verifica se o usuário tem uma sessão ativa do tipo recovery.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('pronto')
      } else {
        // Fallback: tenta token_hash para links antigos
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        if (tokenHash && type === 'recovery') {
          supabase.auth
            .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
            .then(({ error }) => setStatus(error ? 'erro' : 'pronto'))
        } else {
          setStatus('erro')
        }
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: RedefinirSenhaInput) {
    setErroServidor('')
    const { error } = await supabase.auth.updateUser({ password: data.senha })
    if (error) {
      setErroServidor('Erro ao redefinir senha. O link pode ter expirado.')
      return
    }
    router.push('/dashboard')
  }

  if (status === 'verificando') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Verificando link...</p>
      </div>
    )
  }

  if (status === 'erro') {
    return (
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-4">
        <p className="font-medium text-gray-900">Link inválido ou expirado</p>
        <p className="text-sm text-gray-500">
          Solicite um novo link de recuperação de senha.
        </p>
        <Link
          href="/auth/esqueci-senha"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
          <Church className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Nova Senha</h1>
        <p className="mt-1 text-sm text-gray-500">Escolha uma senha forte para sua conta.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Campo
              label="Nova senha"
              type="password"
              {...register('senha')}
              erro={errors.senha?.message}
              autoComplete="new-password"
              ajuda="Mínimo 8 caracteres, uma maiúscula e um número"
            />
            {senhaAtual && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        forca.nivel >= n ? forca.cor : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {forca.label && (
                  <p className="text-xs text-gray-500">
                    Força da senha:{' '}
                    <span
                      className={
                        forca.nivel === 1
                          ? 'font-medium text-red-600'
                          : forca.nivel === 2
                            ? 'font-medium text-yellow-600'
                            : 'font-medium text-green-600'
                      }
                    >
                      {forca.label}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          <Campo
            label="Confirmar nova senha"
            type="password"
            {...register('confirmar_senha')}
            erro={errors.confirmar_senha?.message}
            autoComplete="new-password"
          />

          {erroServidor && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erroServidor}</div>
          )}

          <Botao type="submit" carregando={isSubmitting} className="w-full" tamanho="lg">
            Redefinir Senha
          </Botao>
        </form>
      </div>
    </div>
  )
}

export default function PaginaRedefinirSenha() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        }
      >
        <FormRedefinirSenha />
      </Suspense>
    </div>
  )
}
