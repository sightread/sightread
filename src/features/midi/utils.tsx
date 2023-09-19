import { Midi } from "@tonejs/midi"
import fs from 'fs'
import { Song, Track, Tracks, Bpm, SongNote } from '@/types'

export function convertBase64MidiToSong(base64Midi: string) {
    const binaryMidi = Buffer.from(decodeURIComponent(base64Midi), 'base64')
    console.log(binaryMidi)
    const midi = new Midi(binaryMidi)
    console.log(midi)
    let tracks: Tracks = {}
    const bpms: Array<Bpm> = []
    const notes: Array<SongNote> = []
    
    let index: number = 0
    for (const track of midi.tracks) {
        const newTrack: Track = {
            instrument: track.instrument.name.replace(/ /g,"_"),
            name: "Track" + index
        }
        tracks[index] = {...newTrack}
        for (const note of track.notes) {
            const newNote: SongNote = {
                type: "note",
                midiNote: note.midi,
                duration: note.duration,
                track: index,
                velocity: note.velocity,
                time: note.time,
                measure: note.bars // ??
            }
            notes.push(newNote)
        }

        index++
    }

    for (const tempos of midi.header.tempos) {
        const newBpm: Bpm = {
            time: tempos.time? tempos.time : 0,
            bpm: tempos.bpm
        }
        bpms.push(newBpm)
    }
    
    // Not enough info to fill everything
    const song: Song = {
        tracks: tracks,
        duration: midi.duration,
        measures: [],
        notes: notes,
        bpms: bpms,
        timeSignature: undefined,
        keySignature: 'C',
        items: notes,
        backing: undefined
    };

    console.log(song)

    return song
}

