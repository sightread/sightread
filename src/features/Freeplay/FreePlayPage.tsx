import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MidiStateEvent, SongConfig } from '@/types'
import { Select } from '@/components'
import { PianoRoll, BpmDisplay, RuleLines, SongVisualizer } from '@/features/PlaySongPage'
import { useSynth } from '@/features/PlaySongPage/utils'
import { formatInstrumentName, mapValues } from '@/utils'
import { gmInstruments, InstrumentName } from '@/synth/instruments'
import { ArrowLeftIcon } from '@/icons'
import { useRouter } from 'next/router'
import midiState from '@/features/midi'
import { useSingleton } from '@/hooks'
import { palette } from '@/styles/common'
import { SubscriptionCallback } from '@/features/PlaySongPage/PianoRoll'
import FreePlayer from './utils/freePlayer'
import { css } from '@sightread/flake'

const classes = css({
  topbar: {
    '& i': {
      color: 'white',
      cursor: 'pointer',
      transition: 'color 0.1s',
      fontSize: 24,
      width: 22,
    },
    '& i:hover': {
      color: 'rgba(58, 104, 231, 1)',
    },
    '& i.active': {
      color: 'rgba(58, 104, 231, 1)',
    },
  },
  topbarIcon: {
    fill: 'white',
    cursor: 'pointer',
    transition: '100ms',
    '&:hover': {
      fill: 'rgba(58, 104, 231, 1)',
    },
  },
})

export default function FreePlay() {
  const [instrumentName, setInstrumentName] = useState<InstrumentName>('acoustic_grand_piano')
  const synthState = useSynth(instrumentName)
  const router = useRouter()
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
      <div
        id="topbar"
        className={`${classes.topbar}`}
        style={{
          position: 'fixed',
          height: 55,
          width: '100vw',
          zIndex: 2,
          backgroundColor: '#292929',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          aria-label="left-items"
          style={{ width: '33%', paddingLeft: '20px', boxSizing: 'border-box', cursor: 'pointer' }}
        >
          <ArrowLeftIcon
            className={classes.topbarIcon}
            width={50}
            height={40}
            onClick={() => {
              router.back()
            }}
          />
        </div>
        <div
          aria-label="center-items"
          className="nav-buttons"
          style={{ width: '33%', display: 'flex', justifyContent: 'center' }}
        >
          <BpmDisplay />
        </div>
        <div
          aria-label="right-items"
          style={{
            width: '34%',
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: '20px',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ width: '200px', display: 'inline-block' }}>
            <Select
              loading={synthState.loading}
              error={synthState.error}
              value={instrumentName}
              onChange={(name) => setInstrumentName(name)}
              options={gmInstruments as any}
              format={formatInstrumentName}
              display={formatInstrumentName}
            />
          </span>
        </div>
      </div>
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
        <RuleLines />
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
