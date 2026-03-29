import { criarClienteServidor } from '@/lib/supabase/server'
import { Radio, Calendar, Play } from 'lucide-react'
import { extrairYoutubeId } from '@/lib/youtube'
import { formatarDataCurta } from '@/lib/utils'

export default async function PaginaAoVivo() {
  const supabase = await criarClienteServidor()

  const { data: transmissoes } = await supabase
    .from('transmissoes')
    .select('*')
    .order('data', { ascending: false })

  const aoVivo = transmissoes?.find((t) => t.ao_vivo) ?? null
  const anteriores = transmissoes?.filter((t) => !t.ao_vivo) ?? []

  const idAoVivo = aoVivo ? extrairYoutubeId(aoVivo.youtube_url) : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Cabeçalho */}
      <div className="mb-10">
        <div className="flex items-center gap-2">
          {aoVivo ? (
            <span className="flex items-center gap-1.5 rounded-full bg-sangue px-3 py-1 text-xs font-semibold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              AO VIVO
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-pao/20 px-3 py-1 text-xs font-semibold text-pao">
              <Radio className="h-3 w-3" />
              TRANSMISSÕES
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-porta">
          {aoVivo ? aoVivo.titulo : 'Cultos Online'}
        </h1>
        {aoVivo?.descricao && (
          <p className="mt-2 text-pao">{aoVivo.descricao}</p>
        )}
        {!aoVivo && (
          <p className="mt-2 text-pao">
            Assista aos nossos cultos ao vivo pelo YouTube ou reveja as transmissões anteriores.
          </p>
        )}
      </div>

      {/* Player ao vivo */}
      {aoVivo && idAoVivo ? (
        <div className="mb-12 overflow-hidden rounded-2xl border border-sangue/30 shadow-xl">
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${idAoVivo}?autoplay=1&rel=0`}
              title={aoVivo.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      ) : (
        <div className="mb-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pao bg-white py-20 text-center">
          <Radio className="mx-auto h-14 w-14 text-pao" />
          <p className="mt-4 text-lg font-medium text-porta">Nenhuma transmissão ao vivo agora</p>
          <p className="mt-1 text-sm text-pao">
            Fique de olho nas redes sociais para saber quando o próximo culto começa.
          </p>
        </div>
      )}

      {/* Cultos anteriores */}
      {anteriores.length > 0 && (
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sangue" />
            <h2 className="text-xl font-bold text-porta">Cultos Anteriores</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {anteriores.map((transmissao) => {
              const videoId = extrairYoutubeId(transmissao.youtube_url)
              const thumb = videoId
                ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                : null

              return (
                <a
                  key={transmissao.id}
                  href={transmissao.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-pao bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#111111]">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={transmissao.titulo}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play className="h-10 w-10 text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-black/70 p-3">
                        <Play className="h-6 w-6 fill-white text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-semibold text-porta line-clamp-2 group-hover:text-sangue transition-colors">
                      {transmissao.titulo}
                    </p>
                    {transmissao.descricao && (
                      <p className="mt-1 text-xs text-pao line-clamp-2">{transmissao.descricao}</p>
                    )}
                    <p className="mt-2 flex items-center gap-1 text-xs text-pao">
                      <Calendar className="h-3 w-3" />
                      {formatarDataCurta(transmissao.data)}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {!aoVivo && anteriores.length === 0 && (
        <div className="text-center text-sm text-pao">
          Nenhum culto cadastrado ainda.
        </div>
      )}
    </div>
  )
}
