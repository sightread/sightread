import { atom } from 'jotai'

export const midiModalOpenAtom = atom(false)

export const modalInputBlockAtom = atom((get) => {
  return get(midiModalOpenAtom)
})
