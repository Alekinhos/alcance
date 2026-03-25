import Link from 'next/link'
import Image from 'next/image'
import { Church, Users, Calendar, BookOpen, ArrowRight, Heart, MapPin, Clock } from 'lucide-react'
import { criarClienteServidor } from '@/lib/supabase/server'
import { formatarDataCurta } from '@/lib/utils'
import { NavPublica } from '@/components/layout/nav-publica'

export default async function PaginaInicial() {
  const supabase = await criarClienteServidor()

  const [
    { data: proximosEventos },
    { data: ultimosPosts },
  ] = await Promise.all([
    supabase
      .from('eventos')
      .select('*')
      .gte('data', new Date().toISOString().split('T')[0])
      .order('data', { ascending: true })
      .limit(3),
    supabase
      .from('posts')
      .select('*, autor:profiles(nome)')
      .eq('publicado', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  return (
    <div className="min-h-screen">
      <NavPublica />

      {/* Hero */}
      <section className="relative overflow-hidden py-28 text-center md:py-40">
        {/* Imagem de fundo desfocada */}
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/Cruz.png"
            alt=""
            fill
            className="object-cover blur-sm scale-105"
            priority
          />
          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black/82" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sangue" />
            Bem-vindo à Igreja Alcance
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Uma comunidade de{' '}
            <span className="text-sangue">fé, esperança</span>
            <br />e amor
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Venha fazer parte da nossa família. Aqui você encontra acolhimento,
            crescimento espiritual e uma comunidade que cuida de você.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/eventos"
              className="flex items-center gap-2 rounded-md bg-sangue px-8 py-3 font-medium text-white transition-colors hover:bg-cordeiro hover:text-porta"
            >
              Ver Eventos <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 rounded-md border border-white/30 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Ler Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-pao bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-pao">
          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-bold text-porta">{proximosEventos?.length ?? 0}</p>
            <p className="mt-1 text-sm text-pao">Próximos Eventos</p>
          </div>
          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-bold text-porta">{ultimosPosts?.length ?? 0}</p>
            <p className="mt-1 text-sm text-pao">Publicações</p>
          </div>
        </div>
      </section>

      {/* Por que nos? */}
      <section className="bg-cordeiro py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-porta">Faça parte dessa história</h2>
            <p className="mt-2 text-pao">Descubra tudo que a Igreja Alcance tem para oferecer</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-pao bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-cordeiro p-3">
                <Users className="h-6 w-6 text-sangue" />
              </div>
              <h3 className="text-lg font-semibold text-porta">Nossa Comunidade</h3>
              <p className="mt-2 text-sm text-pao">
                Junte-se a membros que compartilham a mesma fé e caminham juntos na vida cristã.
              </p>
            </div>

            <div className="rounded-xl border border-pao bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-cordeiro p-3">
                <Calendar className="h-6 w-6 text-sangue" />
              </div>
              <h3 className="text-lg font-semibold text-porta">Cultos e Eventos</h3>
              <p className="mt-2 text-sm text-pao">
                Participe dos nossos cultos, retiros e eventos especiais ao longo do ano.
              </p>
            </div>

            <div className="rounded-xl border border-pao bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-cordeiro p-3">
                <BookOpen className="h-6 w-6 text-sangue" />
              </div>
              <h3 className="text-lg font-semibold text-porta">Conteúdo Espiritual</h3>
              <p className="mt-2 text-sm text-pao">
                Sermões, devocionais e reflexões para edificar sua fé no dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      {proximosEventos && proximosEventos.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-porta">Próximos Eventos</h2>
                <p className="mt-1 text-pao">Não perca o que está por vir</p>
              </div>
              <Link href="/eventos" className="flex items-center gap-1 text-sm font-medium text-sangue hover:text-porta">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {proximosEventos.map((evento) => {
                const data = new Date(evento.data + 'T00:00:00')
                return (
                  <div key={evento.id} className="flex gap-4 rounded-xl border border-pao bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    {/* Badge data */}
                    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-sangue py-3 text-white">
                      <span className="text-2xl font-bold leading-none">
                        {data.getDate()}
                      </span>
                      <span className="mt-0.5 text-xs uppercase">
                        {data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-porta">{evento.titulo}</p>
                      {evento.hora && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-pao">
                          <Clock className="h-3 w-3" /> {evento.hora}
                        </p>
                      )}
                      {evento.local && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-pao">
                          <MapPin className="h-3 w-3" /> {evento.local}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Últimas Mensagens */}
      {ultimosPosts && ultimosPosts.length > 0 && (
        <section className="bg-cordeiro py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-porta">Últimas Mensagens</h2>
                <p className="mt-1 text-pao">Reflexões e ensinamentos para sua semana</p>
              </div>
              <Link href="/blog" className="flex items-center gap-1 text-sm font-medium text-sangue hover:text-porta">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {ultimosPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group overflow-hidden rounded-xl border border-pao bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {post.capa_url ? (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={post.capa_url}
                        alt={post.titulo}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111111]">
                      <BookOpen className="h-12 w-12 text-cordeiro/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-porta transition-colors group-hover:text-sangue line-clamp-2">
                      {post.titulo}
                    </h3>
                    <p className="mt-2 text-xs text-pao">
                      {post.autor && (post.autor as { nome: string }).nome} · {formatarDataCurta(post.created_at)}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-full bg-cordeiro px-2 py-0.5 text-xs text-porta">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="bg-gradient-to-br from-[#111111] to-[#2a2a2a] py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Heart className="mx-auto mb-4 h-10 w-10 text-sangue" />
          <h2 className="text-3xl font-bold">Faça parte da nossa família</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Você tem um código de convite? Crie sua conta e acesse a área exclusiva de membros da Igreja Alcance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/cadastro"
              className="rounded-md bg-sangue px-8 py-3 font-medium text-white transition-colors hover:bg-cordeiro hover:text-porta"
            >
              Criar conta
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md border border-white/30 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] py-12 text-white/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Church className="h-5 w-5 text-sangue" />
                <span className="font-bold text-white">Igreja Alcance</span>
              </div>
              <p className="text-sm">Inspirando pessoas a viver para Jesus.</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Acesso rápido</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/eventos" className="hover:text-white">Eventos</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Área do membro</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Conta</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/cadastro" className="hover:text-white">Cadastrar</Link></li>
                <li><Link href="/auth/esqueci-senha" className="hover:text-white">Recuperar senha</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Igreja Alcance. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
