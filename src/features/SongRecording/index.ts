import { getAudioContext } from '@/features/synth/utils'
import { Midi } from "@tonejs/midi";
import { MidiEvent } from "@/features/midi";

let mediaRecorder: MediaRecorder
let audioChunks: Blob[] = []

// Node that listens all gainNotes for recording purposes
let recordingDestinationNode: MediaStreamAudioDestinationNode
function getRecordingDestinationNode() {
    const audioContext = getAudioContext()
    if (!recordingDestinationNode && audioContext != null) {
        recordingDestinationNode = audioContext.createMediaStreamDestination()
    }
    return recordingDestinationNode
}

// Array that listens Midi messages
let recordedMidiEvents: Array<MidiEvent> | null
function getRecordedMidiEvents() {
    return recordedMidiEvents
}

// Record audio
function startRecordingAudio() {
    const isAble = canRecordAudio()

    if (isAble) {
        mediaRecorder = new MediaRecorder(getRecordingDestinationNode().stream, {mimeType: 'audio/webm'})
        audioChunks = []

        mediaRecorder.onstop = () => { trySaveAudioFile() }
        mediaRecorder.onerror = (error) => { console.error('MediaRecorder error:', error) }
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data)
            }
        }

        mediaRecorder.start()
    }

    return isAble
}

// TODO: Can't record audio state
function canRecordAudio(): boolean {
    return getRecordingDestinationNode() != null
}

function trySaveAudioFile() {
    if (audioChunks.length > 0) {
        const mimeType = audioChunks[0].type
        const audioBlob = new Blob(audioChunks, {type: mimeType})
        promptDownloadAudioFile(audioBlob, "Piano-Audio.webm", false)
    }
}

function promptDownloadAudioFile(blob: Blob, defaultFileName: string, customName: boolean) {
    const a = document.createElement("a")
    a.style.display = "none"
    document.body.appendChild(a)

    const url = window.URL.createObjectURL(blob)
    a.href = url

    let fileName: string | null = defaultFileName
    // This code blocks the page, TODO: Make a save as... window
    if (customName) fileName = prompt("Enter a filename:", defaultFileName)
    if (fileName) {
        a.download = fileName
        a.click()
    }

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

function stopRecordingAudio() {
    const isAble = mediaRecorder && mediaRecorder.state !== 'inactive'
    if (isAble) {
        mediaRecorder.stop()
    }
}

// Record Midi
function startRecordingMidi() {
    console.log("Starting recording midi")
    recordedMidiEvents = []
}

function stopRecordingMidi() {
    console.log("Stopping recording midi", recordedMidiEvents)
    trySaveMidiFile()
    recordedMidiEvents = null
}

function trySaveMidiFile() {
    if (recordedMidiEvents && recordedMidiEvents.length > 1) {
        console.log("Recorded Midi Events", recordedMidiEvents)
        const midi = midiEventsToMidi(recordedMidiEvents)
        const base64MidiData = Buffer.from(midi.toArray()).toString('base64');
        console.log(encodeURIComponent(base64MidiData));
        const midiBlob = new Blob([midi.toArray()], { type: "audio/midi" })
        const midiBlobURL = URL.createObjectURL(midiBlob)
        const downloadLink = document.createElement('a')
        downloadLink.href = midiBlobURL
        downloadLink.download = 'recorded_midi.mid'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        URL.revokeObjectURL(midiBlobURL)
        document.body.removeChild(downloadLink)
    }
}

type MidiNote = {
    midi: number // Midi note
    time: number // Time in seconds
    velocity: number // normalized 0-1 velocity
    duration: number // duration in seconds between noteOn and noteOff
}

function midiEventsToMidi(midiEvents: Array<MidiEvent>): Midi {
    const midi = new Midi()
    const track = midi.addTrack()
    const notes: MidiNote[] = midiEventsToMidiNotes(midiEvents)
    console.log("Notes", notes)
    for (const note of notes) {
        track.addNote(note)
    }
    
    return midi
}

function midiEventsToMidiNotes(midiEvents: Array<MidiEvent>): MidiNote[] {
    const notes: MidiNote[] = []
    const noteBuffer: MidiNote[] = []
    let newNote: MidiNote = {
        midi: 0,
        time: 0,
        velocity: 0,
        duration: 0
    }

    const delay: number = (midiEvents.length > 0)? midiEvents[0].timeStamp : 0

    for (const event of midiEvents) {
        if (event.velocity > 0) {
            // Note On
            newNote.midi = event.note
            newNote.time = (event.timeStamp - delay) / 1000
            newNote.velocity = event.velocity / 100
            noteBuffer.push({...newNote})
        } else {
            // Note Off
            const foundNote = noteBuffer.find((note) => note.midi === event.note)
            if (foundNote) {
                foundNote.duration = (event.timeStamp - delay) / 1000 - foundNote.time
                notes.push(foundNote)
                noteBuffer.splice(noteBuffer.indexOf(foundNote), 1)
            }
        }
    }

    return notes
}


export { getRecordingDestinationNode, startRecordingAudio, stopRecordingAudio, getRecordedMidiEvents, startRecordingMidi, stopRecordingMidi }