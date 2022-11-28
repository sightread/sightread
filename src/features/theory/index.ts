export * from './difficulty'
export * from './keySignature'
export { default as glyphs } from './glyphs'

const blackIndices = new Set([1, 3, 6, 8, 10])
export function isBlack(note: number) {
  return blackIndices.has(note % 12)
}

export function isWhite(note: number) {
  return !isBlack(note)
}
