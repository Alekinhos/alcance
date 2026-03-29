type EventoBase = {
  id: string
  titulo: string
  descricao: string | null
  data: string
  hora: string | null
  local: string | null
  tipo: string
  recorrente: boolean
  frequencia: 'semanal' | 'quinzenal' | 'mensal' | null
  data_fim_recorrencia: string | null
  [key: string]: unknown
}

function avancar(data: Date, frequencia: 'semanal' | 'quinzenal' | 'mensal'): Date {
  const d = new Date(data)
  if (frequencia === 'semanal') d.setDate(d.getDate() + 7)
  else if (frequencia === 'quinzenal') d.setDate(d.getDate() + 14)
  else d.setMonth(d.getMonth() + 1)
  return d
}

export function expandirEventos<T extends EventoBase>(
  eventos: T[],
  limiteOcorrenciasPorEvento = 8
): T[] {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const resultado: T[] = []

  for (const evento of eventos) {
    if (!evento.recorrente || !evento.frequencia) {
      const data = new Date(evento.data + 'T00:00:00')
      if (data >= hoje) resultado.push(evento)
      continue
    }

    let data = new Date(evento.data + 'T00:00:00')
    const dataFim = evento.data_fim_recorrencia
      ? new Date(evento.data_fim_recorrencia + 'T00:00:00')
      : null

    // Avança até a primeira ocorrência futura
    while (data < hoje) {
      data = avancar(data, evento.frequencia)
    }

    let count = 0
    while (count < limiteOcorrenciasPorEvento) {
      if (dataFim && data > dataFim) break
      resultado.push({ ...evento, data: data.toISOString().split('T')[0] })
      data = avancar(data, evento.frequencia)
      count++
    }
  }

  return resultado.sort((a, b) => a.data.localeCompare(b.data))
}
