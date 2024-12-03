'use client'

import { MidiModal } from '@/app/play/components/MidiModal'
import midiState, { useRecordMidi } from '@/features/midi'
import { SongVisualizer } from '@/features/SongVisualization'
import { InstrumentName, useSynth } from '@/features/synth'
import { useSingleton } from '@/hooks'
import { MidiStateEvent, SongConfig } from '@/types'
import React, { useCallback, useEffect, useState } from 'react'
import RecordingModal from './components/RecordingModal'
import TopBar from './components/TopBar'
import FreePlayer from './utils/freePlayer'
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { ButtonWithTooltip } from '@/app/play/components/TopBar.tsx'
import { ChevronsDown } from 'react-feather'

export default function FreePlay() {
  const [instrumentName, setInstrumentName] = useState<InstrumentName>('acoustic_grand_piano')
  const synthState = useSynth(instrumentName)
  const freePlayer = useSingleton(() => new FreePlayer())
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const { isRecording, startRecording, stopRecording } = useRecordMidi(midiState)
  const [recordingPreview, setRecordingPreview] = useState('')
  const [isHide, setHide] = useState<boolean>(false)
  const fullScreenHandle = useFullScreenHandle()

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
    <FullScreen handle={fullScreenHandle}>
      <div className="flex h-screen w-screen flex-col">
        {!isHide &&
          <>
            <TopBar
              onClickMidi={(e) => {
                e.stopPropagation()
                setMidiModal(!isMidiModalOpen)
              }}
              onClickRecord={(e) => {
                e.stopPropagation()
                if (!isRecording) {
                  startRecording()
                } else {
                  const midiBytes = stopRecording()
                  if (midiBytes !== null) {
                    const base64MidiData = Buffer.from(midiBytes).toString('base64')
                    setRecordingPreview(base64MidiData)
                  }
                }
              }}
              isRecordingAudio={isRecording}
              isLoading={synthState.loading}
              isError={synthState.error}
              value={instrumentName}
              onChange={(name) => setInstrumentName(name)}
              onClickFullScreen={() => fullScreenHandle.active ?
                fullScreenHandle.exit() :
                fullScreenHandle.enter()}
              isFullScreen={fullScreenHandle.active}
              onClickHide={() => setHide(!isHide)}
            />
            <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
            <RecordingModal
              show={recordingPreview.length > 0}
              onClose={() => setRecordingPreview('')}
              songMeta={{ source: 'base64', id: recordingPreview }}
            />
          </>
        }
        {isHide &&
          <div className="flex min-h-[50px] right-[16px] fixed z-10">
            <ButtonWithTooltip tooltip="Open Menu">
              <ChevronsDown className={'border rounded-lg'} size={24} onClick={() => setHide(false)} />
            </ButtonWithTooltip>
          </div>
        }
        <div className="relative flex-grow">
          <SongVisualizer
            song={freePlayer.song}
            config={{ visualization: 'falling-notes', noteLetter: false } as SongConfig}
            hand="both"
            handSettings={{ 1: { hand: 'right' } }}
            getTime={() => freePlayer.getTime()}
            constrictView={false}
          />
        </div>
      </div>
    </FullScreen>
  )
}
