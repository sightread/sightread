import midiState, { useRecordMidi } from '@/features/midi'
import { SongVisualizer } from '@/features/SongVisualization'
import { InstrumentName, useSynth } from '@/features/synth'
import { useLazyStableRef } from '@/hooks'
import { MidiModal } from '@/pages/play/components/MidiModal'
import { MidiStateEvent, SongConfig } from '@/types'
import { bytesToBase64 } from '@/utils'
import { useCallback, useEffect, useState } from 'react'
import RecordingModal from './components/RecordingModal'
import TopBar from './components/TopBar'
import FreePlayer from './utils/free-player'

export default function FreePlay() {
  const [instrumentName, setInstrumentName] = useState<InstrumentName>('acoustic_grand_piano')
  const synthState = useSynth(instrumentName)
  const freePlayer = useLazyStableRef(() => new FreePlayer())
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
      <title>Free Play</title>
      <div
        className="flex h-screen w-screen flex-col outline-none"
        {...midiState.getListenerProps()}
        autoFocus
      >
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
                const base64MidiData = bytesToBase64(midiBytes)
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
          instrument={instrumentName}
        />
        <div className="relative grow">
          <SongVisualizer
            song={freePlayer.song}
            config={
              {
                visualization: 'falling-notes',
                noteLabels: 'none',
                loop: {
                  enabled: false,
                  range: { start: 0, end: 0 },
                },
                metronome: {
                  enabled: false,
                  volume: 0.6,
                  speed: 1,
                  emphasizeFirst: true,
                },
              } as SongConfig
            }
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
