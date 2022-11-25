import React, { useState, useEffect, PropsWithChildren, useReducer, useRef } from 'react'

import { Song, SongConfig } from '@/types'
import { SongVisualizer, getHandSettings } from '@/features/SongVisualization'
import Player from '@/features/player'
import { useOnUnmount, useRAFLoop, useWakeLock } from '@/hooks'
import clsx from 'clsx'
import Head from 'next/head'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { MidiModal } from '../../PlaySong/components/MidiModal'
import { Select, Sizer, Toggle } from '@/components'
import { getGeneratedSong } from '@/features/theory/procedural'
import midiState from '@/features/midi'
import TopBar from './components/TopBar'
import { ButtonWithTooltip } from '../../PlaySong/components/TopBar'
import { ChevronDown, ChevronUp } from '@/icons'
import { round } from '@/utils'
import { useSignalEffect } from '@preact/signals-react'
import { playFailSound } from '../sound-effects'

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
  songConfig.noteLetter = showNoteLetters
  useSignalEffect(() => {
    if (player.score.pointless.value !== 0) {
      playFailSound()
    }
  })

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
    config.skipMissedNotes = true
    setSongConfig(config)
    player.setSong(song, config)
  }, [song, player, setSongConfig])
  const accuracy = player.score.accuracy.value + '%'
  const score = player.score.combined.value
  const streak = player.score.streak.value

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
        <div className="relative px-8 py-4 flex w-full justify-center gap-4 bg-gray-200">
          <div className="flex items-center gap-2 bg-white rounded-md p-2 text-black whitespace-nowrap">
            <label>BPM {round(player.bpmModifier.value * 100)}%</label>
            <ButtonWithTooltip tooltip="Increase BPM" onClick={() => player.increaseBpm()}>
              <ChevronUp className="text-black hover:text-purple-primary" />
            </ButtonWithTooltip>
            <ButtonWithTooltip tooltip="Decrease BPM" onClick={() => player.decreaseBpm()}>
              <ChevronDown className="text-black hover:text-purple-primary" />
            </ButtonWithTooltip>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-md p-2 whitespace-nowrap">
            <label>Show letter</label>
            <Toggle
              width={50}
              height={24}
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
        <Sizer height={24} />
        <div className="h-[100px] w-full flex justify-center gap-8 items-center">
          <ProgressDisplay />
          <StatDisplay label="Accuracy">{accuracy}</StatDisplay>
          <StatDisplay label="Score">{score}</StatDisplay>
          <StatDisplay label="Streak">{streak}</StatDisplay>
        </div>
        <Sizer height={32} />
        <div className={'relative w-[calc(100%-100px)] bg-white justify-center h-[325px] mx-auto'}>
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand}
            handSettings={getHandSettings(songConfig)}
            getTime={() => Player.player().getTimeForVisuals()}
            game={true}
          />
        </div>
        <div className="flex basis-0 items-center justify-center gap-4 text-white">
          <InfiniteBtn onClick={handleNext} className="bg-purple-primary hover:bg-purple-hover">
            Next
          </InfiniteBtn>
          <InfiniteBtn
            onClick={handleReplay}
            className="bg-white text-purple-primary border border-purple-primary hover:bg-purple-light"
          >
            Replay
          </InfiniteBtn>
        </div>
      </div>
    </>
  )
}

function ProgressDisplay() {
  const progressRef = useRef<HTMLDivElement>(null)
  useRAFLoop(() => {
    if (!progressRef.current) {
      return
    }
    const player = Player.player()
    const progress = (player.getTimeForVisuals() / player.getDuration()) * 100
    progressRef.current.style.width = `${progress}%`
  })
  return (
    <div className="flex flex-col gap-2 min-w-[150px]">
      <span className="text-black text-xl font-semibold w-full">Progress</span>
      <div className="relative w-full h-[40px]">
        <div className="absolute w-full bg-gray-300 rounded-r-3xl h-[34px] bottom-0" />
        <div
          style={{
            boxShadow: `inset 0px 2px 3px rgba(255, 255, 255, 0.4), inset 0px 7px 11px rgba(255, 255, 255, 0.25)`,
          }}
          className="absolute rounded-r-3xl h-[34px] bottom-0 bg-gradient-to-r from-purple-darkest to-purple-primary"
          ref={progressRef}
        />
      </div>
    </div>
  )
}

function StatDisplay(props: PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex flex-col gap-2 min-w-[150px]">
      <span className="text-black text-xl font-semibold">{props.label}</span>
      <span className="text-purple-primary text-4xl font-semibold">{props.children}</span>
    </div>
  )
}

type ButtonProps = React.HTMLProps<{}>
function InfiniteBtn({ children, ...rest }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...(rest as any)}
      className={clsx(rest.className, 'text-xl px-2 py-2 rounded-md w-[100px] transition')}
    >
      {children}
    </button>
  )
}
