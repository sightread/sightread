import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MidiStateEvent, PlayableSong, SongNote } from 'src/types'
import { Select } from 'src/components'
import { PianoRoll, BpmDisplay, RuleLines, SongVisualizer } from 'src/features/PlaySongPage/index'
import { useSynth } from 'src/features/PlaySongPage/utils'
import { formatInstrumentName, isBrowser, mapValues } from 'src/utils'
import { gmInstruments, InstrumentName } from 'src/synth/instruments'
import { css } from '@sightread/flake'
import { ArrowLeftIcon } from 'src/icons'
import { useRouter } from 'next/router'
import { getPitch } from 'src/features/parsers'
import midiState from 'src/features/midi'
import { useSingleton } from 'src/hooks'
import { palette } from 'src/styles/common'
import { SubscriptionCallback } from 'src/features/PlaySongPage/PianoRoll'

/**
 * Notes:
 *  - can never go backwards always forward:
 *     - can delete items once out of view
 * Logic:
 *  - have items array
 *  - each loop:
 *      - check items that are in view and mutate the items array
 */

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

function FreePlay() {
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
            visualization="falling-notes"
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

class FreePlayer {
  time: number = 0
  lastTime: number = 0
  raf: number | undefined
  song: PlayableSong
  active: Map<number, number> // Map from midiNote --> time created.

  constructor() {
    this.time = Number.MAX_SAFE_INTEGER
    this.lastTime = 0
    this.active = new Map()
    this.song = {
      bpms: [],
      tracks: { 1: { instrument: 'piano' } },
      config: { 0: { hand: 'right', sound: true, instrument: 'acoustic_grand_piano', track: {} } },
      measures: [],
      notes: [],
      duration: 0,
      items: [],
    }
    this.song.items = this.song.notes // Hack
    if (isBrowser()) {
      this.loop()
    }
  }

  start() {
    this.time = Number.MAX_SAFE_INTEGER
    this.lastTime = Date.now()
    this.active.clear()
    this.loop()
  }

  stop() {
    if (typeof this.raf === 'number') {
      cancelAnimationFrame(this.raf)
    }
  }

  loop() {
    this.raf = requestAnimationFrame(() => {
      const now = Date.now()
      const dt = now - this.lastTime
      this.time -= dt
      this.lastTime = now

      // Extend each note.
      for (let [midiNote, pressedTime] of this.active.entries()) {
        let note = this.song.notes.find((n) => n.midiNote === midiNote)
        if (note) {
          note.time = this.getTime()
          note.duration = pressedTime - note.time
        }
      }
      this.loop()
    })
  }

  addNote(midiNote: number, velocity: number = 80) {
    const time = this.getTime()
    const note: SongNote = {
      midiNote,
      velocity,
      type: 'note',
      pitch: getPitch(midiNote),
      track: 1,
      time,
      duration: 0,
    }
    this.song.notes.unshift(note)
    this.active.set(midiNote, time)
  }
  releaseNote(midiNote: number) {
    this.active.delete(midiNote)
  }

  // In seconds
  getTime() {
    return this.time / 1000
  }
}

export default FreePlay
