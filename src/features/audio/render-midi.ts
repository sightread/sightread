import { loadInstrument, soundfonts } from '@/features/synth/loadInstrument'
import { InstrumentName } from '@/features/synth/types'
import { getAudioContext, getKeyForSoundfont } from '@/features/synth/utils'
import { Midi } from '@tonejs/midi'

const DEFAULT_TAIL_SECONDS = 1
const MAX_RELEASE_SECONDS = 0.25
const RELEASE_RAMP_SECONDS = 0.05
const MP3_BITRATE = 128
const MP3_BLOCK_SIZE = 1152

type Mp3Encoder = Awaited<ReturnType<(typeof import('wasm-media-encoders'))['createMp3Encoder']>>

let mp3EncoderPromise: Promise<Mp3Encoder> | null = null

async function loadMp3Encoder() {
  if (!mp3EncoderPromise) {
    mp3EncoderPromise = import('wasm-media-encoders').then((mod) => mod.createMp3Encoder())
  }

  return mp3EncoderPromise
}

async function encodeMp3(audioBuffer: AudioBuffer) {
  const encoder = await loadMp3Encoder()
  const channels = Math.min(audioBuffer.numberOfChannels, 2) as 1 | 2
  const leftChannel = audioBuffer.getChannelData(0)
  const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : undefined
  encoder.configure({ channels, sampleRate: audioBuffer.sampleRate, bitrate: MP3_BITRATE })
  const mp3Chunks: BlobPart[] = []

  for (let i = 0; i < leftChannel.length; i += MP3_BLOCK_SIZE) {
    const leftChunk = leftChannel.subarray(i, i + MP3_BLOCK_SIZE)
    const samples = rightChannel
      ? ([leftChunk, rightChannel.subarray(i, i + MP3_BLOCK_SIZE)] as const)
      : ([leftChunk] as const)
    const mp3Buffer = encoder.encode(samples)
    if (mp3Buffer.length > 0) {
      mp3Chunks.push(mp3Buffer.slice())
    }
  }

  const endBuffer = encoder.finalize()
  if (endBuffer.length > 0) {
    mp3Chunks.push(endBuffer.slice())
  }

  return new Blob(mp3Chunks, { type: 'audio/mpeg' })
}

export async function renderMidiToMp3(
  midiBytes: Uint8Array,
  instrument: InstrumentName,
): Promise<Blob> {
  await loadInstrument(instrument)
  const soundfont = soundfonts[instrument]
  if (!soundfont) {
    throw new Error(`Missing soundfont for ${instrument}.`)
  }

  const midi = new Midi(midiBytes)
  const durationSeconds = Math.max(midi.duration, 0.1)
  const sampleRate = getAudioContext().sampleRate ?? 44100
  const tailSeconds = Math.max(DEFAULT_TAIL_SECONDS, MAX_RELEASE_SECONDS)
  const totalFrames = Math.ceil((durationSeconds + tailSeconds) * sampleRate)
  const offlineContext = new OfflineAudioContext(2, totalFrames, sampleRate)

  const masterGain = offlineContext.createGain()
  masterGain.gain.value = 1
  masterGain.connect(offlineContext.destination)

  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      const key = getKeyForSoundfont(note.midi)
      const buffer = soundfont[key]
      if (!buffer) {
        return
      }

      const source = offlineContext.createBufferSource()
      source.buffer = buffer

      const gainNode = offlineContext.createGain()
      gainNode.gain.setValueAtTime(note.velocity, Math.max(0, note.time))

      source.connect(gainNode)
      gainNode.connect(masterGain)

      const startTime = Math.max(0, note.time)
      const adaptiveRelease = Math.min(MAX_RELEASE_SECONDS, Math.max(0.04, note.duration * 0.25))
      const rawStopTime = Math.max(startTime + 0.05, startTime + note.duration + adaptiveRelease)
      const maxStopTime = startTime + buffer.duration
      const stopTime = Math.min(rawStopTime, maxStopTime)
      const releaseStartTime = Math.max(startTime, stopTime - RELEASE_RAMP_SECONDS)

      gainNode.gain.setValueAtTime(note.velocity, releaseStartTime)
      gainNode.gain.linearRampToValueAtTime(0, stopTime)
      source.start(startTime)
      source.stop(stopTime)
    })
  })

  const rendered = await offlineContext.startRendering()
  return encodeMp3(rendered)
}
