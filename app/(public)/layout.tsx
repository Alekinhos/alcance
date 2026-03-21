import Link from 'next/link'
import { Church } from 'lucide-react'

export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-900">
            <Church className="h-6 w-6 text-blue-600" />
            <span className="font-bold">Igreja Alcance</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/eventos" className="text-sm text-gray-600 hover:text-gray-900">
              Eventos
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
              Blog
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Igreja Alcance. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
