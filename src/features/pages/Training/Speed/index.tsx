import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import { Clef, MidiStateEvent } from '@/types'
import { useSingleton } from '@/hooks'
import { getSynthStub, Synth } from '@/features/synth'
import midiState from '@/features/midi'
import { SettingsSidebar } from './components'
import { usePersistedState } from '@/features/persist'
import { render } from './canvas'
import { Canvas, Sizer } from '@/components'
import { getRandomNote, KEY_SIGNATURE } from '@/features/theory'
import { isBrowser, round } from '@/utils'
import { playFailSound } from '../sound-effects'

export type Props = {}

export interface SpeedTrainingConfig {
  clef: Clef
  displayLetter: boolean
  generator: 'excerpts' | 'random'
  keySignature: KEY_SIGNATURE
}
export interface SpeedState {
  title: string
  notes: number[]
  currentNoteIndex: number
  complete: boolean
  speed: number
  correct: number
  startTime: Date
  lastNoteHitTime: Date
}

export default function SpeedTraining({}: Props) {
  const [sidebar, setSidebar] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  const router = useRouter()
  const [speedConfig, setSpeedConfig] = usePersistedState<SpeedTrainingConfig>('speedConfig', {
    clef: 'treble',
    displayLetter: false,
    generator: 'random',
    keySignature: 'C',
  })
  const [speedState, setSpeedState] = useState<SpeedState>(() => ({
    title: 'Random Notes',
    notes: generateRandomNotes(speedConfig.clef, speedConfig.keySignature),
    currentNoteIndex: 0,
    complete: false,
    speed: 2,
    correct: 0,
    startTime: new Date(),
    lastNoteHitTime: new Date(),
  }))

  useEffect(() => {
    const handleMidiEvent = (midiEvent: MidiStateEvent) => {
      advanceGame(speedState, setSpeedState, synth, midiEvent, soundOff)
    }

    midiState.subscribe(handleMidiEvent)
    return function cleanup() {
      midiState.unsubscribe(handleMidiEvent)
    }
  }, [synth, soundOff, setSpeedState, speedState])

  return (
    <div>
      <>
        <div
          style={{
            position: 'absolute',
            top: 55,
            width: 300,
            height: 'calc(100% - 55px)',
            right: 0,
            visibility: sidebar ? 'visible' : 'hidden',
            zIndex: 2,
          }}
        >
          <SettingsSidebar open={sidebar} onChange={setSpeedConfig} config={speedConfig} />
        </div>
      </>
      <div
        style={{
          backgroundColor: 'white',
          width: '100vw',
          height: `calc(100vh - 55px)`,
          position: 'fixed',
          top: 55,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h2 style={{ fontSize: 48, alignSelf: 'center' }}> {speedState.title}</h2>
        <div>
          <div style={{ position: 'relative', height: 300 }}>
            <Canvas
              render={(ctx: CanvasRenderingContext2D, size) => {
                const state = { ctx, canvasSize: size, speedState, speedConfig }
                render(state)
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScoreInfo speedState={speedState} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                style={{
                  width: 150,
                  height: 40,
                  backgroundColor: '#C4C4C4',
                  border: '1px solid black',
                }}
                onClick={() =>
                  setSpeedState({
                    ...speedState,
                    complete: false,
                    currentNoteIndex: 0,
                    startTime: new Date(),
                    lastNoteHitTime: new Date(),
                    correct: 0,
                    speed: 0,
                  })
                }
              >
                Restart
              </button>
              <Sizer height={20} />
              <button
                style={{
                  width: 150,
                  height: 40,
                  backgroundColor: '#C4C4C4',
                  border: '1px solid black',
                }}
                onClick={() =>
                  setSpeedState({
                    complete: false,
                    notes: generateRandomNotes(speedConfig.clef, speedConfig.keySignature),
                    currentNoteIndex: 0,
                    startTime: new Date(),
                    lastNoteHitTime: new Date(),
                    correct: 0,
                    title: 'Random',
                    speed: 0,
                  })
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreInfo({ speedState }: { speedState: SpeedState }) {
  const { correct, notes, currentNoteIndex, lastNoteHitTime, startTime } = speedState
  const accuracy = round(100 * (correct / currentNoteIndex), 2)
  const npm = round(
    (currentNoteIndex / (lastNoteHitTime.getTime() - startTime.getTime())) * 1000 * 60,
    2,
  )
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        visibility: speedState.complete ? 'visible' : 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
        <span style={{ fontSize: 32 }}>Speed</span>
        <Sizer height={8} />
        <span>{npm} notes/minute</span>
        {/* <span>Mx BPM</span> */}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
        <span style={{ fontSize: 32 }}>Accuracy</span>
        <Sizer height={8} />
        <span>{accuracy}%</span>
      </div>
    </div>
  )
}

function advanceGame(
  speedState: SpeedState,
  setSpeedState: (s: SpeedState) => void,
  synth: Synth,
  midiEvent: MidiStateEvent,
  soundOff: boolean,
) {
  if (speedState.complete) {
    return
  }
  const { note: midiNote, type } = midiEvent
  if (type === 'up') {
    synth.stopNote(midiNote)
    return
  }
  const currentNote = speedState.notes[speedState.currentNoteIndex]
  const complete = speedState.currentNoteIndex >= speedState.notes.length - 1
  if (midiNote === currentNote) {
    if (type === 'down' && !soundOff) {
      synth.playNote(midiNote)
    }
    setSpeedState({
      ...speedState,
      currentNoteIndex: speedState.currentNoteIndex + 1,
      correct: speedState.correct + 1,
      lastNoteHitTime: new Date(),
      complete,
    })
  } else {
    playFailSound()
    setSpeedState({
      ...speedState,
      currentNoteIndex: speedState.currentNoteIndex + 1,
      lastNoteHitTime: new Date(),
      complete,
    })
  }
}

function generateRandomNotes(clef: Clef, keySignature: KEY_SIGNATURE) {
  let minOctave = 4
  let maxOctave = 5
  if (clef === 'bass') {
    minOctave = 2
    maxOctave = 3
  }

  return Array.from({ length: 20 }).map(() => {
    return getRandomNote(minOctave, maxOctave, 'C')
  })
}
