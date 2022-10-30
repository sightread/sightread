import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MidiStateEvent, SongConfig } from '@/types'
import { SongVisualizer } from '@/features/SongVisualization'
import { InstrumentName, useSynth } from '@/features/synth'
import midiState from '@/features/midi'
import { useSingleton } from '@/hooks'
import FreePlayer from './utils/freePlayer'
import TopBar from './components/TopBar'

export default function FreePlay() {
  const [instrumentName, setInstrumentName] = useState<InstrumentName>('acoustic_grand_piano')
  const synthState = useSynth(instrumentName)
  const freePlayer = useSingleton(() => new FreePlayer())

  const handleNoteDown = useCallback(
    (note: number, velocity: number = 80) => {
      synthState.synth.playNote(note, velocity)
      freePlayer.addNote(note, velocity)
    },
    [freePlayer, synthState.synth],
  )

  const handleNoteUp = useCallback(
    (note: number) => {
      synthState.synth.stopNote(note)
      freePlayer.releaseNote(note)
    },
    [freePlayer, synthState.synth],
  )

  useEffect(() => {
    const handleMidiStateEvent = (e: MidiStateEvent) => {
      if (e.type === 'up') {
        handleNoteUp(e.note)
      } else {
        handleNoteDown(e.note, e.velocity)
      }
    }
    midiState.subscribe(handleMidiStateEvent)
    return () => {
      midiState.unsubscribe(handleMidiStateEvent)
    }
  }, [handleNoteDown, handleNoteUp])

  return (
    <div className="w-screen h-screen flex flex-col">
      <TopBar
        isLoading={synthState.loading}
        isError={synthState.error}
        value={instrumentName}
        onChange={(name) => setInstrumentName(name)}
      />
      <div className="flex-grow relative">
        <SongVisualizer
          song={freePlayer.song}
          config={{ visualization: 'falling-notes', noteLetter: false } as SongConfig}
          hand="both"
          handSettings={{ 1: { hand: 'right' } }}
          getTime={() => freePlayer.getTime()}
          constrictView={false}
          disableTouchscroll={true}
        />
      </div>
    </div>
  )
}
