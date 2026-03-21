import Link from 'next/link'
import { Church, Users, Calendar, BookOpen, ArrowRight } from 'lucide-react'

export default function PaginaInicial() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      {/* Cabeçalho público */}
      <header className="border-b border-blue-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-white">
            <Church className="h-7 w-7" />
            <span className="text-xl font-bold">Igreja Alcance</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/eventos" className="text-sm text-blue-200 hover:text-white">
              Eventos
            </Link>
            <Link href="/blog" className="text-sm text-blue-200 hover:text-white">
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-white">
          Bem-vindo à<br />
          <span className="text-blue-300">Igreja Alcance</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-200">
          Uma comunidade de fé, esperança e amor. Venha fazer parte da nossa família.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/eventos"
            className="flex items-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-blue-900 hover:bg-blue-50"
          >
            Ver Eventos <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-2 rounded-md border border-blue-400 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Ler Blog
          </Link>
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 text-white backdrop-blur">
            <Users className="h-8 w-8 text-blue-300" />
            <h3 className="mt-4 text-lg font-semibold">Nossa Comunidade</h3>
            <p className="mt-2 text-sm text-blue-200">
              Junte-se a centenas de membros que compartilham a mesma fé.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 text-white backdrop-blur">
            <Calendar className="h-8 w-8 text-blue-300" />
            <h3 className="mt-4 text-lg font-semibold">Cultos e Eventos</h3>
            <p className="mt-2 text-sm text-blue-200">
              Participe dos nossos cultos, retiros e eventos especiais.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 text-white backdrop-blur">
            <BookOpen className="h-8 w-8 text-blue-300" />
            <h3 className="mt-4 text-lg font-semibold">Conteúdo Espiritual</h3>
            <p className="mt-2 text-sm text-blue-200">
              Sermões, devocionais e notícias para edificar sua fé.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
