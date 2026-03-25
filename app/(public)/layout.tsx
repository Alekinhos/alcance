import Link from 'next/link'
import { Church } from 'lucide-react'

export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cordeiro">
      <header className="border-b border-pao bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-porta">
            <Church className="h-6 w-6 text-sangue" />
            <span className="font-bold">Igreja Alcance</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/eventos" className="text-sm text-pao hover:text-porta">
              Eventos
            </Link>
            <Link href="/blog" className="text-sm text-pao hover:text-porta">
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md bg-sangue px-4 py-2 text-sm font-medium text-white hover:bg-porta"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-pao bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-pao">
          © {new Date().getFullYear()} Igreja Alcance. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
