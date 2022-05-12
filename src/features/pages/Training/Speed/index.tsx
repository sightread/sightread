import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { MidiStateEvent } from '@/types'
import { useSingleton } from '@/hooks'
import { css } from '@sightread/flake'
import { getSynthStub } from '@/features/synth'
import midiState from '@/features/midi'
import { TopBar, SettingsSidebar } from './components'
import { usePersistedState } from '@/features/persist'
import Canvas from './components/Canvas'
import { render } from './canvas'
import { Sizer } from '@/components'
import { getRandomNote, KEY_SIGNATURE } from '@/features/theory'

export type Props = {}

const classes = css({
  topbarIcon: {
    cursor: 'pointer',
    fill: 'white',
    '&:hover': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& .active ': {
      fill: 'rgba(58, 104, 231, 1)',
    },
  },
  figmaIcon: {
    '&:hover path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '&:hover path.outline': {
      fill: 'black',
    },
    '& path': {
      cursor: 'pointer',
    },
    cursor: 'pointer',
  },
  fillWhite: {
    '& path': {
      fill: 'white',
    },
    fill: 'white',
  },
  active: {
    '& path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& path.outline': {
      fill: 'black',
    },
  },
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
})

export interface SpeedTrainingConfig {
  clef: 'bass' | 'treble'
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
    const handleMidiEvent = ({ type, note }: MidiStateEvent) => {
      if (type === 'down' && !soundOff) {
        synth.playNote(note)
        advanceGame(speedState, setSpeedState, note)
      } else {
        synth.stopNote(note)
      }
    }

    midiState.subscribe(handleMidiEvent)
    return function cleanup() {
      midiState.unsubscribe(handleMidiEvent)
    }
  }, [synth, soundOff, setSpeedState, speedState])

  const handleToggleSound = () => {
    setSoundOff(!soundOff)
  }

  return (
    <div>
      <>
        <TopBar
          isSoundOff={soundOff}
          onClickBack={() => router.back()}
          onClickSettings={() => setSidebar(!sidebar)}
          onClickSound={handleToggleSound}
          classNames={{ settingsCog: sidebar && classes.active }}
        />
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
          contain: 'strict',
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
                const state = { ctx, canvasSize: size, speedState, speedConfig, setSpeedState }
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
                    notes: generateRandomNotes(speedConfig.clef, speedConfig.keySignatuer),
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
  const accuracy = (100 * (correct / currentNoteIndex)).toFixed(2)
  const npm = (
    (currentNoteIndex / (lastNoteHitTime.getTime() - startTime.getTime())) *
    1000 *
    60
  ).toFixed(2)
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
  midiNote: number,
) {
  if (speedState.complete) {
    return
  }
  const currentNote = speedState.notes[speedState.currentNoteIndex]
  const complete = speedState.currentNoteIndex >= speedState.notes.length - 1
  if (midiNote === currentNote) {
    setSpeedState({
      ...speedState,
      currentNoteIndex: speedState.currentNoteIndex + 1,
      correct: speedState.correct + 1,
      lastNoteHitTime: new Date(),
      complete,
    })
  } else {
    setSpeedState({
      ...speedState,
      currentNoteIndex: speedState.currentNoteIndex + 1,
      lastNoteHitTime: new Date(),
      complete,
    })
  }
}

function generateRandomNotes(clef: 'bass' | 'treble', keySignature: KEY_SIGNATURE) {
  let minOctave = 4
  let maxOctave = 5
  if (clef === 'bass') {
    minOctave = 3
    maxOctave = 4
  }

  return Array.from({ length: 20 }).map(() => {
    return getRandomNote(minOctave, maxOctave, 'C')
  })
}
