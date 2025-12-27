import { Canvas } from '@/components'
import { NoteContextMenu, Hand as MenuHand, Finger } from '@/components/NoteContextMenu'
import * as touchscroll from '@/features/SongVisualization/touchscroll'
import { useSize } from '@/hooks'
import { Hand, Song, SongConfig, SongNote } from '@/types'
import { LegacyRef, useEffect, useMemo, useRef, useState } from 'react'
import { usePlayer } from '../player'
import { GivenState, render } from './canvas-renderer'
import { getNoteAtPosition } from './falling-notes'
import { waitForImages } from './images'
import { PIXELS_PER_SECOND as pps } from './utils'

type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}

type CanvasRendererProps = {
  song: Song | undefined
  songId?: string
  config: SongConfig
  hand: Hand
  handSettings: HandSettings
  getTime: () => number
  constrictView?: boolean
  selectedRange?: { start: number; end: number }
  enableTouchscroll?: boolean
  game?: boolean
}

function CanvasRenderer({
  song,
  songId,
  config,
  hand,
  handSettings,
  selectedRange,
  getTime,
  constrictView = true,
  enableTouchscroll = false,
  game = false,
}: CanvasRendererProps) {
  const isReady = useRef(false)
  const { width, height, measureRef } = useSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const player = usePlayer()

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    note: SongNote
  } | null>(null)

  useEffect(() => {
    waitForImages().then(() => (isReady.current = true))
  })

  const canvasRect: DOMRect = useMemo(() => {
    return canvasRef.current?.getBoundingClientRect() ?? {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]) as DOMRect

  function renderCanvas(ctx: CanvasRenderingContext2D, { width, height }: any) {
    if (!song || !isReady.current) {
      return
    }

    const state: GivenState = {
      time: getTime(),
      visualization: config.visualization,
      noteLabels: config.noteLabels,
      coloredNotes: config.coloredNotes,
      windowWidth: width,
      height,
      pps,
      hands: handSettings,
      hand,
      ctx,
      items: song.items,
      constrictView: !!constrictView,
      keySignature: config.keySignature ?? song.keySignature,
      timeSignature: song.timeSignature,
      canvasRect,
      selectedRange,
      game,
      player,
      handFingerMetadata: song.handFingerMetadata,
    }
    render(state)
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()

    if (!song) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const note = getNoteAtPosition(x, y)

    if (note) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        note,
      })
    }
  }

  async function handleAnnotationSelect(hand: MenuHand, finger: Finger) {
    if (!contextMenu || !song || !songId) return

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: songId,
          time: contextMenu.note.time,
          midiNote: contextMenu.note.midiNote,
          hand,
          finger,
        }),
      })

      if (!response.ok) {
        console.error('Failed to update metadata')
      } else {
        // Update the local metadata to reflect the change
        if (!song.handFingerMetadata) {
          // Initialize metadata structure if it doesn't exist
          song.handFingerMetadata = { notes: [] }
        }

        const noteMetadata = song.handFingerMetadata.notes.find(
          (n) =>
            n.midiNote === contextMenu.note.midiNote &&
            Math.abs(n.time - contextMenu.note.time) < 0.05
        )

        if (noteMetadata) {
          // Update existing note
          noteMetadata.hand = hand
          noteMetadata.finger = finger
        } else {
          // Add new note entry
          song.handFingerMetadata.notes.push({
            midiNote: contextMenu.note.midiNote,
            time: contextMenu.note.time,
            hand,
            finger,
          })
        }
      }
    } catch (error) {
      console.error('Error updating metadata:', error)
    }
  }

  return (
    <>
      <div
        className="absolute h-full w-full touch-none"
        ref={measureRef}
        onPointerMove={(e) => enableTouchscroll && touchscroll.handleMove(player, e.nativeEvent)}
        onPointerDown={(e) => enableTouchscroll && touchscroll.handleDown(player, e.nativeEvent)}
        onPointerUp={(e) => enableTouchscroll && touchscroll.handleUp(player, e.nativeEvent)}
        onContextMenu={handleContextMenu}
      >
        <Canvas ref={canvasRef as LegacyRef<HTMLCanvasElement>} render={renderCanvas} />
      </div>
      {contextMenu && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSelect={handleAnnotationSelect}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}

export default CanvasRenderer
