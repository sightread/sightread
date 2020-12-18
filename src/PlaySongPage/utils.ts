import { getSynthStub } from '../synth'

export function getNoteLanes(width: any) {
  const whiteWidth = width / 52
  const blackWidth = whiteWidth / 2
  const blackNotes = [1, 4, 6, 9, 11]
  const lanes: Array<{ left: number; width: number }> = []
  let totalNotes = 0

  for (var whiteNotes = 0; whiteNotes < 52; whiteNotes++, totalNotes++) {
    const lane = { width: whiteWidth, left: whiteWidth * whiteNotes }
    if (blackNotes.includes(totalNotes % 12)) {
      lanes.push({ width: blackWidth, left: lane.left - blackWidth / 2 })
      totalNotes++
    }
    lanes.push(lane)
  }
  return lanes
}

let synth = getSynthStub('acoustic_grand_piano')

export function useSynth() {
  return synth
}
