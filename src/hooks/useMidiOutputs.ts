import { getMidiOutputs } from '@/features/midi'
import { useEffect, useMemo, useReducer, useState } from 'react'

interface MidiOutputReturn {
  outputs: MIDIOutputMap | null
  loading: boolean
  refreshOutput: () => void
}

export default function useMidiOutputs(): MidiOutputReturn {
  const [midiMap, setMidiMap] = useState<MIDIOutputMap | null>(null)
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    setMidiMap(null)
    getMidiOutputs()
      .then(setMidiMap)
      .catch((error) => {
        console.log('Encountered error retrieving list of connected MIDI instruments', error)
        setMidiMap(new Map())
      })
  }, [ignored])

  return useMemo(
    () => ({
      outputs: midiMap,
      loading: midiMap === null,
      refreshOutput: () => forceUpdate(),
    }),
    [midiMap],
  )
}
