import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  pagina: number
  totalPaginas: number
  gerarHref: (pagina: number) => string
}

export function Paginacao({ pagina, totalPaginas, gerarHref }: Props) {
  if (totalPaginas <= 1) return null

  const paginas: (number | '...')[] = []

  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i)
  } else {
    paginas.push(1)
    if (pagina > 3) paginas.push('...')
    for (let i = Math.max(2, pagina - 1); i <= Math.min(totalPaginas - 1, pagina + 1); i++) {
      paginas.push(i)
    }
    if (pagina < totalPaginas - 2) paginas.push('...')
    paginas.push(totalPaginas)
  }

  const classeBase =
    'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors'
  const classeAtiva = `${classeBase} bg-sangue text-white`
  const classeInativa = `${classeBase} border border-pao bg-white text-porta hover:bg-cordeiro`
  const classeDesabilitado = `${classeBase} border border-pao bg-white text-pao/40 cursor-not-allowed`

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Paginação">
      {pagina > 1 ? (
        <Link href={gerarHref(pagina - 1)} className={classeInativa} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={classeDesabilitado} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {paginas.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-pao">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={gerarHref(p)}
            className={p === pagina ? classeAtiva : classeInativa}
            aria-current={p === pagina ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {pagina < totalPaginas ? (
        <Link href={gerarHref(pagina + 1)} className={classeInativa} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={classeDesabilitado} aria-disabled="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
