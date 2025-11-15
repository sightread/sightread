export interface NoteMetadata {
  time: number
  midiNote: number
  duration: number
  hand: 'L' | 'l' | 'R' | 'r' | ' '  // "L"/"l" for left, "R"/"r" for right, " " for unset
  finger: 0 | 1 | 2 | 3 | 4 | 5  // 0 for unset, 1-5 for thumb to pinky
}

export interface HandFingerMetadata {
  version: number
  songId: string
  description?: string
  notes: NoteMetadata[]
}

/**
 * Load metadata file for a song if it exists
 */
export async function loadSongMetadata(songId: string): Promise<HandFingerMetadata | null> {
  try {
    // Try to fetch the metadata file
    const metadataPath = `/music/songs/${songId.replace('.mid', '')}.metadata.json`
    const response = await fetch(metadataPath)

    if (!response.ok) {
      // Metadata file doesn't exist, that's fine
      return null
    }

    const metadata: HandFingerMetadata = await response.json()
    return metadata
  } catch (e) {
    console.warn(`Could not load metadata for ${songId}:`, e)
    return null
  }
}

/**
 * Find metadata for a specific note at a given time
 */
export function findNoteMetadata(
  metadata: HandFingerMetadata | null,
  time: number,
  midiNote: number
): NoteMetadata | null {
  if (!metadata) return null

  // Find the note that matches both time and midiNote
  // Use a small tolerance for time matching (50ms)
  const tolerance = 0.05
  const match = metadata.notes.find(
    (n) =>
      n.midiNote === midiNote &&
      Math.abs(n.time - time) < tolerance
  )

  return match || null
}

/**
 * Convert finger number to letter code
 */
export function fingerToCode(finger: 0 | 1 | 2 | 3 | 4 | 5): string {
  if (finger === 0) return ' '

  const fingerMap: { [key: number]: string } = {
    1: 'T', // Thumb
    2: 'I', // Index
    3: 'M', // Middle
    4: 'R', // Ring
    5: 'P', // Pinky
  }

  return fingerMap[finger] || ' '
}

/**
 * Convert hand to letter code (normalizes lowercase to uppercase)
 */
export function handToCode(hand: 'L' | 'l' | 'R' | 'r' | ' '): string {
  // Normalize lowercase to uppercase
  if (hand === 'l') return 'L'
  if (hand === 'r') return 'R'
  return hand
}

/**
 * Get the formatted metadata string for display (e.g. "RT" for right hand, thumb)
 */
export function formatNoteMetadata(noteMetadata: NoteMetadata | null): string {
  if (!noteMetadata) return '  ' // Two spaces if no metadata

  const handCode = handToCode(noteMetadata.hand)
  const fingerCode = fingerToCode(noteMetadata.finger)

  return `${handCode}${fingerCode}`
}
