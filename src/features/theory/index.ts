export * from './keySignature'
export * from './glyphs'

const blackIndices = new Set([1, 3, 6, 8, 10])
export function isBlack(note: number) {
  return blackIndices.has(note % 12)
}
