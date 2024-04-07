import { getMidiInputs } from '@/features/midi'
import { useEffect, useMemo, useReducer, useState } from 'react'

interface MidiInputReturn {
  inputs: WebMidi.MIDIInputMap | null
  loading: boolean
  refreshInput: () => void
}

export default function useMidiInputs(): MidiInputReturn {
  const [midiMap, setMidiMap] = useState<WebMidi.MIDIInputMap | null>(null)
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    setMidiMap(null)
    getMidiInputs()
      .then(setMidiMap)
      .catch((error) => {
        console.log('Encountered error retrieving list of connected MIDI instrumentd', error)
        setMidiMap(new Map())
      })
  }, [ignored])

  return useMemo(
    () => ({
      inputs: midiMap,
      loading: midiMap === null,
      refreshInput: forceUpdate,
    }),
    [midiMap],
  )
}
