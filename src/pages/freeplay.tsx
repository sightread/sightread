import React, { useEffect, useRef, useMemo, useState } from 'react'
import { SongMeasure, SongNote } from '../types'
import Player from '../player'
import Select from '../components/Select'
import {
  CanvasRenderer,
  Config,
  CanvasItem,
  PianoRoll,
  BpmDisplay,
  RuleLines,
} from '../PlaySongPage'
import { getNoteLanes, useSynth } from '../PlaySongPage/utils'
import midiKeyboard from '../midi'
import { isBlack, formatInstrumentName } from '../utils'
import { getNote } from '../synth/utils'
import { gmInstruments, InstrumentName } from '../synth/instruments'
import { css } from '../flakecss'
import { useSize } from '../hooks/size'
import { ArrowLeft } from '../icons'
import { useRouter } from 'next/router'

function findLastIndex<T>(
  array: Array<T>,
  predicate: (value: T, index: number, obj: T[]) => boolean,
): number {
  let l = array.length
  while (l--) {
    if (predicate(array[l], l, array)) return l
  }
  return -1
}
/**
 * Notes:
 *  - can never go backwards always forward:
 *     - can delete items once out of view
 * Logic:
 *  - have items array
 *  - each loop:
 *      - check items that are in view and mutate the items array
 */

const PIXELS_PER_SECOND = 150

const palette = {
  black: '#4912d4',
  white: '#7029fb',
  measure: '#C5C5C5', //'#C5C5C5',
}

function getKeyColor(midiNote: number): string {
  const keyType = isBlack(midiNote) ? 'black' : 'white'
  return palette[keyType]
}

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
function getItemStartEnd(item: CanvasItem) {
  const start = item.time * PIXELS_PER_SECOND
  if (item.type === 'note') {
    return { start, end: start + item.duration * PIXELS_PER_SECOND }
  } else {
    return { start, end: start }
  }
}
function getCurrentOffset(time: number) {
  return time * PIXELS_PER_SECOND
}

type NotesAndMeasures = CanvasItem[]
type SelectSynth = { loading: boolean; error: boolean }
function App() {
  const [selectSynth, setSelectSynth] = useState<SelectSynth>({
    loading: false,
    error: false,
  })
  const { width, height, measureRef } = useSize()
  const lanes = useMemo(() => getNoteLanes(width), [width])
  const router = useRouter()
  const player = Player.player()

  const synth = useSynth()
  const items = useRef<NotesAndMeasures>([])
  const playingItems = useRef<number[]>([])

  const time = (): number => -player.getTime()
  const noteColor = 'red'

  // Register ummount fns
  useEffect(() => {
    player.init()
    player.startTimeInterval(16)

    synth.subscribe((action, note, velocity) => {
      if (action === 'play') {
        return addNoteToItems(note, velocity)
      }
      return stopNoteInItems(note)
    })
    return () => {
      player.stop()
    }
  }, [])

  useEffect(() => {
    midiKeyboard.virtualKeyboard = true

    return function cleanup() {
      midiKeyboard.virtualKeyboard = false
    }
  }, [player])

  function setSynthInstrument(instrument: InstrumentName) {
    setSelectSynth({ ...selectSynth, loading: true })
    synth
      .setInstrument(instrument)
      .then((res) => {
        setSelectSynth({ loading: false, error: false })
      })
      .catch(() => {
        setSelectSynth({ loading: false, error: true })
      })
  }

  const pitch = { step: 'G', octave: 3, alter: 0 }
  const track = 1
  //  TODO what should track and pitch be for a key pressed?
  function addNoteToItems(note: number, velocity?: number) {
    const newNote: SongNote = {
      midiNote: note,
      velocity: velocity ?? 80,
      type: 'note',
      pitch,
      track,
      time: time(),
      duration: 0,
    }
    items.current.unshift(newNote)
    playingItems.current.push(note)
  }
  //
  function stopNoteInItems(note: number): void {
    playingItems.current = playingItems.current.filter((i) => i !== note)
  }
  // ¯\_(ツ)_/¯
  function canvasStartPosition(startTime: number) {
    return height - (startTime - time()) * PIXELS_PER_SECOND
  }

  function getItemsInView(sortedItems: NotesAndMeasures): NotesAndMeasures {
    if (sortedItems.length === 0) {
      return sortedItems
    }

    const viewportStart = getCurrentOffset(time())
    const viewportEnd = viewportStart + height * 1.5 // overscan a vp
    let lastIndex = sortedItems.length - 1
    const lastItemStillInView = getItemStartEnd(sortedItems[lastIndex]).start < viewportEnd

    if (lastItemStillInView) {
      return sortedItems
    }

    lastIndex = findLastIndex(sortedItems, (o) => getItemStartEnd(o).start >= viewportStart)

    return sortedItems.slice(0, lastIndex)
  }

  function getItemSettings<T extends CanvasItem>(item: T): Config<T> {
    const note = item as SongNote
    const lane = lanes[note.midiNote - getNote('A0')]
    const length = PIXELS_PER_SECOND * note.duration
    return {
      width: lane.width - 2, // accounting for piano key with border 1px
      posX: lane.left + 1,
      color: getKeyColor(note.midiNote),
      posY: canvasStartPosition(item.time) - length,
      length,
    } as Config<T>
  }

  // relys on the fact the notes are always pushed to the front
  // so playing notes are the numbers in playingItems and their first
  // occurence found in note.midiNote
  function incrementPlayingNotes(
    notes: NotesAndMeasures,
    playingItems: number[],
  ): NotesAndMeasures {
    for (const num of playingItems) {
      for (const note of notes) {
        if (note.type === 'measure') continue
        if (note.midiNote === num) {
          const currTime = time()
          note.duration += note.time - currTime // bc time is negative in freeplay
          note.time = time()
          break
        }
      }
    }
    return notes
  }

  function getItems(): CanvasItem[] {
    items.current = getItemsInView(incrementPlayingNotes(items.current, playingItems.current))

    return items.current
  }

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
          <ArrowLeft
            className={classes.topbarIcon}
            width={50}
            height={40}
            onClick={() => {
              player.pause()
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
              loading={selectSynth.loading}
              error={selectSynth.error}
              value={synth.getInstrument()}
              onChange={setSynthInstrument}
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
          <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={measureRef}>
            <CanvasRenderer
              getItems={getItems}
              itemSettings={getItemSettings}
              width={width}
              height={height}
            />
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            paddingBottom: '7%',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <PianoRoll getKeyColor={(_, t) => t} activeColor={noteColor} />
        </div>
        {/* {viz === 'falling-notes' && (
          <>
          </>
        )} */}
        {/* {viz === 'sheet' && (
          <>
            <WindowedStaffBoard song={songSettings?.song ?? null} selectedHand={hand} />
          </>
        )} */}
      </div>
    </div>
  )
}

export default App

function InstrumentPicker({
  value,
  onSelect,
}: {
  value: InstrumentName
  onSelect: (value: InstrumentName) => void
}) {
  const [state, setState] = useState(value)

  return (
    <select
      value={state}
      onChange={(e) => {
        const val = e.target.value as InstrumentName
        setState(val)
        onSelect(val)
      }}
    >
      {gmInstruments.map((instrument: InstrumentName) => {
        return (
          <option key={instrument} value={instrument}>
            {instrument}
          </option>
        )
      })}
    </select>
  )
}
