import Link from 'next/link'
import { Church } from 'lucide-react'
import { NavPublica } from '@/components/layout/nav-publica'

export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cordeiro">
      <NavPublica />
      <main className="flex-1">{children}</main>
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
                <li><Link href="/ao-vivo" className="hover:text-white">Ao Vivo</Link></li>
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
