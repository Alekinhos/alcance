'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { solicitarResetSenha } from '@/app/actions/auth'
import { schemaEmail } from '@/lib/validations/auth'
import { Campo } from '@/components/ui/campo'
import { Botao } from '@/components/ui/botao'
import { Church, MailCheck } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

type EmailInput = z.infer<typeof schemaEmail>

export default function PaginaEsqueciSenha() {
  const [enviado, setEnviado] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmailInput>({
    resolver: zodResolver(schemaEmail),
    mode: 'onTouched',
  })

  async function onSubmit(data: EmailInput) {
    const formData = new FormData()
    formData.append('email', data.email)
    const resultado = await solicitarResetSenha(formData)
    if (resultado?.erro) {
      setError('email', { message: resultado.erro })
      return
    }
    setEmailEnviado(data.email)
    setEnviado(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {enviado ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <MailCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email enviado!</p>
                <p className="mt-1 text-sm text-gray-500">
                  Enviamos um link de recuperação para{' '}
                  <span className="font-medium text-gray-700">{emailEnviado}</span>. Verifique sua
                  caixa de entrada e spam.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Campo
                label="Email"
                type="email"
                {...register('email')}
                erro={errors.email?.message}
                placeholder="seu@email.com"
                autoComplete="email"
              />

              <Botao type="submit" carregando={isSubmitting} className="w-full" tamanho="lg">
                Enviar link de recuperação
              </Botao>

              <p className="text-center text-sm text-gray-500">
                Lembrou a senha?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
