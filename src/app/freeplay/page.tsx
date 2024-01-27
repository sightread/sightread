'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { MidiStateEvent, SongConfig } from '@/types'
import { SongVisualizer } from '@/features/SongVisualization'
import { InstrumentName, useSynth } from '@/features/synth'
import midiState, { useRecordMidi } from '@/features/midi'
import { useSingleton } from '@/hooks'
import FreePlayer from './utils/freePlayer'
import TopBar from './components/TopBar'
import RecordingModal from './components/RecordingModal'
import { MidiModal } from '@/app/play/components/MidiModal'

export default function FreePlay() {
  const [instrumentName, setInstrumentName] = useState<InstrumentName>('acoustic_grand_piano')
  const synthState = useSynth(instrumentName)
  const freePlayer = useSingleton(() => new FreePlayer())
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const { isRecording, startRecording, stopRecording } = useRecordMidi(midiState)
  const [recordingPreview, setRecordingPreview] = useState('')

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
    <>
      <div className="w-screen h-screen flex flex-col">
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
        />
        <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
        <RecordingModal
          show={recordingPreview.length > 0}
          onClose={() => setRecordingPreview('')}
          songMeta={{ source: 'base64', id: recordingPreview }}
        />
        <div className="flex-grow relative">
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
    </>
  )
}
