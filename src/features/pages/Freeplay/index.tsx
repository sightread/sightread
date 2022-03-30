import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MidiStateEvent, SongConfig } from '@/types'
import { SongVisualizer } from '@/features/SongVisualization'
import { mapValues } from '@/utils'
import { InstrumentName, useSynth } from '@/features/synth'
import midiState from '@/features/midi'
import { useSingleton } from '@/hooks'
import { palette } from '@/styles/common'
import { SubscriptionCallback, PianoRoll } from '@/features/SongInputControls'
import FreePlayer from './utils/freePlayer'
import TopBar from './components/TopBar'

export default function FreePlay() {
  const [instrumentName, setInstrumentName] = useState<InstrumentName>('acoustic_grand_piano')
  const synthState = useSynth(instrumentName)
  const freePlayer = useSingleton(() => new FreePlayer())
  const noteColor = palette.purple.primary
  const keyColorUpdater = useRef<SubscriptionCallback>(null)

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

      const pressed = mapValues(Object.fromEntries(midiState.getPressedNotes()), () => ({}))
      keyColorUpdater.current?.(pressed)
    }
    midiState.subscribe(handleMidiStateEvent)
    return () => {
      midiState.unsubscribe(handleMidiStateEvent)
    }
  }, [handleNoteDown, handleNoteUp])

  return (
    <div className="App">
      <TopBar
        isLoading={synthState.loading}
        isError={synthState.error}
        value={instrumentName}
        onChange={(name) => setInstrumentName(name)}
      />
      <div
        style={{
          backgroundColor: '#2e2e2e',
          width: '100vw',
          height: '100vh',
          contain: 'strict',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <SongVisualizer
            song={freePlayer.song}
            config={{ visualization: 'falling-notes', noteLetter: false } as SongConfig}
            hand="both"
            handSettings={{ 1: { hand: 'right' } }}
            getTime={() => freePlayer.getTime()}
            constrictView={false}
          />
        </div>
        <div>
          <PianoRoll
            activeColor={noteColor}
            onNoteDown={handleNoteDown}
            onNoteUp={handleNoteUp}
            setKeyColorUpdater={(fn) => (keyColorUpdater.current = fn)}
          />
        </div>
      </div>
    </div>
  )
}
