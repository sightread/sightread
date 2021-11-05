# tinysynth

A tiny synthesizer library for playing any of the 128 GeneralMIDI instruments.

## Usage

```js
import { getSynth } from 'tinysynth'

// Asynchronously downloads the relevant soundfont.
// See instruments.ts for all 128 options.
getSynth('acoustic_grand_piano').then((synth) => {
  synth.playNote(62)
  synth.stopNote(62)
})
```
