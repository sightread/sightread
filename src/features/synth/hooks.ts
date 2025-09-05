import { getSynth, getSynthStub, InstrumentName, Synth } from '@/features/synth'
import { useEffect, useState } from 'react'

export function useSynth(instrument: InstrumentName): {
  loading: boolean
  error: boolean
  synth: Synth
} {
  const [loadError, setLoadError] = useState({ loading: true, error: false })

  useEffect(() => {
    let cancelled = false
    setLoadError({ loading: true, error: false })
    getSynth(instrument)
      .then(() => {
        if (!cancelled) {
          setLoadError({ loading: false, error: false })
        }
      })
      .catch((err) => {
        if (cancelled) {
          return
        }
        console.error(`Could not load synth. Error: ${err}`)
        setLoadError({ loading: false, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [instrument])

  return { ...loadError, synth: getSynthStub(instrument) }
}
