import React, { useState, useEffect, PropsWithChildren, useReducer } from 'react'

import { Song, SongConfig } from '@/types'
import { SongVisualizer, getHandSettings } from '@/features/SongVisualization'
import Player from '@/features/player'
import { useOnUnmount, useWakeLock } from '@/hooks'
import clsx from 'clsx'
import Head from 'next/head'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { MidiModal } from '../../PlaySong/components/MidiModal'
import { Select, Sizer, Toggle } from '@/components'
import { getGeneratedSong } from '@/features/theory/procedural'
import midiState from '@/features/midi'
import TopBar from './components/TopBar'

type Generator = 'eMinor' | 'dMajor' | 'random'
type Level = 1 | 2 | 3
export type GeneratedSongSettings = SongConfig & { generator: Generator }

/**
 * Needs:
 * - Wait first note, then no more waiting.
 * - Next generates new song
 * - Restart resets all stats etc back to 0
 *
 * - BPM Modifier (soon)
 */

function useGeneratedSong(type: Generator, level: Level): [Song | undefined, () => void] {
  const [song, setSong] = useState<Song>()
  const [counter, forceNewSong] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    getGeneratedSong(type, level as any)
      .then((s) => setSong(s))
      .catch((e) => console.error(e))
  }, [type, level, counter])

  return [song, forceNewSong]
}

export function Phrases() {
  const [songConfig, setSongConfig] = useState(getDefaultSongSettings())
  const player = Player.player()
  const [showNoteLetters, setShowNoteLetters] = useState(false)
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const [generatorType, setGeneratorType] = useState<Generator>('dMajor')
  const [level, setLevel] = useState<Level>(1)
  const [song, forceNewSong] = useGeneratedSong(generatorType, level)

  useEffect(() => {
    setSongConfig({ ...songConfig, noteLetter: showNoteLetters })
  }, [showNoteLetters])

  useWakeLock()
  useOnUnmount(() => player.stop())
  const hand = 'right'

  function handleReplay() {
    player.stop()
  }

  function handleNext() {
    forceNewSong()
  }

  useEffect(() => {
    function handleMidiPressed() {
      player.play()
    }
    midiState.subscribe(handleMidiPressed)
    return () => midiState.unsubscribe(handleMidiPressed)
  }, [player])

  useEffect(() => {
    if (!song) return
    const config = getDefaultSongSettings(song)
    config.visualization = 'sheet'
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, player, setSongConfig])
  const accuracy = player.score.accuracy.value + '%'
  const score = player.score.combined.value

  return (
    <>
      <Head>
        <title>Sightread: Infinite</title>
      </Head>
      <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
      <div className={clsx('flex flex-col h-screen', 'h-[100dvh]')}>
        <TopBar
          onClickMidi={(e) => {
            e.stopPropagation()
            setMidiModal(!isMidiModalOpen)
          }}
        />
        <Sizer height={16} />
        <div className="px-8 flex w-full justify-center gap-4">
          <div className="flex items-center gap-2">
            <label>Show note letters</label>
            <Toggle
              checked={showNoteLetters}
              onChange={() => setShowNoteLetters(!showNoteLetters)}
            />
          </div>
          <Select
            className="max-w-fit"
            options={['random', 'eMinor', 'dMajor']}
            value={generatorType}
            onChange={(val) => setGeneratorType(val)}
          />
          <Select
            className="max-w-fit"
            options={[1, 2, 3]}
            value={level}
            onChange={(val) => setLevel(val)}
            display={(lvl) => `Level: ${lvl}`}
          />
        </div>
        <div className="h-[100px] w-full flex justify-center gap-2 items-center">
          <span>Accuracy: {accuracy}</span>
          <span>Score: {score}</span>
        </div>
        <div className={clsx('relative flex-grow flex bg-white px-8 justify-center')}>
          <div className={clsx('relative w-[min(100vw,900px)]')}>
            <SongVisualizer
              song={song}
              config={songConfig}
              hand={hand}
              handSettings={getHandSettings(songConfig)}
              getTime={() => Player.player().getTimeForVisuals()}
            />
          </div>
          <div className="p-8 flex flex-col basis-0 items-center justify-center gap-4 text-white">
            <InfiniteBtn onClick={handleReplay}>Replay</InfiniteBtn>
            <InfiniteBtn onClick={handleNext}>Next</InfiniteBtn>
          </div>
        </div>
      </div>
    </>
  )
}

type ButtonProps = React.HTMLProps<{}>
function InfiniteBtn({ children, ...rest }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...(rest as any)}
      className="text-xl px-2 py-2 bg-purple-primary hover:bg-purple-hover rounded-md w-[100px]"
    >
      {children}
    </button>
  )
}
