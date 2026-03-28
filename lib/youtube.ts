export function extrairYoutubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([^&\s?#/]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}
