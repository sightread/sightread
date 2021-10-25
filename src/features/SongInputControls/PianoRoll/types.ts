export type SubscriptionCallback =
  | null
  | ((pressedKeys: { [note: number]: { color?: string | void } }) => void)
export type PianoRollProps = {
  activeColor: string
  onNoteDown?: (midiNote: number) => void
  onNoteUp?: (midiNote: number) => void
  startNote?: number
  endNote?: number
  setKeyColorUpdater?: (cb: SubscriptionCallback | null) => void
}
