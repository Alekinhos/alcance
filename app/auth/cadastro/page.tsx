'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cadastrarComConvite } from '@/app/actions/auth'
import { schemaCadastro, type CadastroInput } from '@/lib/validations/auth'
import { Campo } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { Church, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function calcularForca(senha: string): { nivel: 0 | 1 | 2 | 3; label: string; cor: string } {
  if (!senha) return { nivel: 0, label: '', cor: '' }
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (/[A-Z]/.test(senha)) pontos++
  if (/[0-9]/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  if (pontos <= 1) return { nivel: 1, label: 'Fraca', cor: 'bg-sangue' }
  if (pontos <= 2) return { nivel: 2, label: 'Média', cor: 'bg-yellow-500' }
  return { nivel: 3, label: 'Forte', cor: 'bg-green-500' }
}

function FormCadastro() {
  const searchParams = useSearchParams()
  const codigoInicial = searchParams.get('codigo') ?? ''

  const [erroServidor, setErroServidor] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({
    resolver: zodResolver(schemaCadastro),
    defaultValues: { codigo: codigoInicial },
    mode: 'onTouched',
  })

  const senhaAtual = watch('senha') ?? ''
  const forca = calcularForca(senhaAtual)

  async function onSubmit(data: CadastroInput) {
    setErroServidor('')
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.append(k, v))
    const resultado = await cadastrarComConvite(formData)
    if (resultado?.erro) setErroServidor(resultado.erro)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sangue">
          <Church className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-porta">Criar Conta</h1>
        <p className="mt-1 text-sm text-pao">
          Você precisa de um código de convite para se cadastrar.
        </p>
      </div>

      <div className="rounded-xl border border-pao bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Código de convite */}
          <div className="rounded-lg bg-cordeiro p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-porta">
              <KeyRound className="h-4 w-4 text-sangue" />
              Código de Convite
            </div>
            <input
              {...register('codigo')}
              placeholder="XXXX-XXXX"
              maxLength={9}
              className="w-full rounded-md border border-pao bg-white px-3 py-2 text-center font-mono text-lg font-bold uppercase tracking-widest text-black focus:border-sangue focus:outline-none focus:ring-1 focus:ring-sangue"
            />
            {errors.codigo && (
              <p className="mt-1 text-xs text-sangue">{errors.codigo.message}</p>
            )}
          </div>

          <Campo
            label="Nome completo"
            {...register('nome')}
            erro={errors.nome?.message}
            autoComplete="name"
          />

          <Campo
            label="Email"
            type="email"
            {...register('email')}
            erro={errors.email?.message}
            autoComplete="email"
          />

          <div className="space-y-1">
            <Campo
              label="Senha"
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
                        forca.nivel >= n ? forca.cor : 'bg-cordeiro'
                      }`}
                    />
                  ))}
                </div>
                {forca.label && (
                  <p className="text-xs text-pao">
                    Força da senha:{' '}
                    <span
                      className={
                        forca.nivel === 1
                          ? 'font-medium text-sangue'
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
            label="Confirmar senha"
            type="password"
            {...register('confirmar_senha')}
            erro={errors.confirmar_senha?.message}
            autoComplete="new-password"
          />

          {erroServidor && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-sangue">{erroServidor}</div>
          )}

          <Botao type="submit" carregando={isSubmitting} className="w-full" tamanho="lg">
            Criar Conta
          </Botao>
        </form>

        <p className="mt-4 text-center text-sm text-pao">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="font-medium text-sangue hover:text-porta">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PaginaCadastro() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cordeiro px-4">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sangue border-t-transparent" />
        }
      >
        <FormCadastro />
      </Suspense>
    </div>
  )
}
