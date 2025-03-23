'use client'

import { MidiModal } from '@/app/play/components/MidiModal'
import { ButtonWithTooltip } from '@/app/play/components/TopBar'
import { Select, Sizer, Toggle } from '@/components'
import midiState from '@/features/midi'
import { usePlayer } from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { getGeneratedSong } from '@/features/theory/procedural'
import { useOnUnmount, useQueryString, useRAFLoop, useWakeLock } from '@/hooks'
import { ChevronDown, ChevronUp } from '@/icons'
import { Hand, Song, SongConfig } from '@/types'
import { round } from '@/utils'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { atomEffect } from 'jotai-effect'
import React, { PropsWithChildren, useEffect, useReducer, useRef, useState } from 'react'
import { playFailSound } from '../sound-effects'
import TopBar from './components/TopBar'

type Generator = 'eMinor' | 'dMajor' | 'random'
type Level = 0 | 1 | 2 | 3
export type GeneratedSongSettings = SongConfig & { generator: Generator }

function useGeneratedSong(
  type: Generator,
  level: Level,
  clef: PhraseClefType,
): [Song | undefined, () => void] {
  const [song, setSong] = useState<Song>()
  const [counter, forceNewSong] = useReducer((x) => x + 1, 0)
  const hasBass = clef === 'grand' || clef === 'bass'
  const hasTreble = clef === 'grand' || clef === 'treble'
  useEffect(() => {
    getGeneratedSong(type, level as any, { bass: hasBass, treble: hasTreble })
      .then((s) => setSong(s))
      .catch((e) => console.error(e))
  }, [type, level, counter, clef, hasBass, hasTreble])

  return [song, forceNewSong]
}

type QueryState = { level: string; clef: string; generator: Generator }
type PhraseClefType = 'treble' | 'bass' | 'grand'
export default function Phrases() {
  const [songConfig, setSongConfig] = useState(getDefaultSongSettings())
  const player = usePlayer()
  const [showNoteLetters, setShowNoteLetters] = useState(false)
  const [isMidiModalOpen, setMidiModal] = useState(false)
  const [queryState, setQueryState] = useQueryString<QueryState>({
    level: '0',
    clef: 'treble',
    generator: 'eMinor',
  })
  const clefType = queryState.clef as PhraseClefType
  const generatorType = queryState.generator as Generator
  const [song, forceNewSong] = useGeneratedSong(generatorType, +queryState.level as Level, clefType)

  const accuracy = useAtomValue(player.score.accuracy)
  const score = useAtomValue(player.score.combined)
  const streak = useAtomValue(player.score.streak)
  const bpmModifier = useAtomValue(player.getBpmModifier())

  const handMap = { bass: 'left', grand: 'both', treble: 'right' }
  const hand = handMap[clefType]
  player.setHand(hand)
  songConfig.noteLetter = showNoteLetters

  atomEffect((get) => {
    const pointlessHitsCount = get(player.score.pointless)
    if (pointlessHitsCount !== 0) {
      playFailSound()
    }
  })

  useWakeLock()
  useOnUnmount(() => player.stop())

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

  return (
    <>
      <MidiModal isOpen={isMidiModalOpen} onClose={() => setMidiModal(false)} />
      <div className={clsx('flex h-screen flex-col', 'h-[100dvh]')}>
        <TopBar
          onClickMidi={(e) => {
            e.stopPropagation()
            setMidiModal(!isMidiModalOpen)
          }}
        />
        <div className="relative flex w-full justify-center gap-4 bg-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 rounded-md bg-white p-2 whitespace-nowrap text-black">
            <label>BPM {round(bpmModifier * 100)}%</label>
            <ButtonWithTooltip tooltip="Increase BPM" onClick={() => player.increaseBpm()}>
              <ChevronUp className="hover:text-purple-primary text-black" />
            </ButtonWithTooltip>
            <ButtonWithTooltip tooltip="Decrease BPM" onClick={() => player.decreaseBpm()}>
              <ChevronDown className="hover:text-purple-primary text-black" />
            </ButtonWithTooltip>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white p-2 whitespace-nowrap">
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
            onChange={(generator) => setQueryState({ ...queryState, generator })}
            display={(v) =>
              ({
                random: 'Random',
                eMinor: 'Irish Folk in E Minor',
                dMajor: 'Irish Folk in D Major',
              })[v]
            }
            format={(v) =>
              ({
                random: 'Random',
                eMinor: 'Irish Folk in E Minor',
                dMajor: 'Irish Folk in D Major',
              })[v]
            }
          />
          <Select
            className="max-w-fit"
            options={['0', '1', '2', '3']}
            value={queryState.level}
            onChange={(level) => setQueryState({ ...queryState, level })}
            display={(lvl) => `Level: ${lvl}`}
          />
          <Select
            className="max-w-fit"
            options={['treble', 'bass', 'grand']}
            value={clefType}
            onChange={(clef) => setQueryState({ ...queryState, clef })}
            display={(v) => ({ treble: 'Treble', bass: 'Bass', grand: 'Grand' })[v]}
            format={(v) => ({ treble: 'Treble', bass: 'Bass', grand: 'Grand' })[v]}
          />
        </div>
        <Sizer height={24} />
        <div className="flex h-[100px] w-full items-center justify-center gap-8">
          <ProgressDisplay />
          <StatDisplay label="Accuracy">{accuracy + '%'}</StatDisplay>
          <StatDisplay label="Score">{score}</StatDisplay>
          <StatDisplay label="Streak">{streak}</StatDisplay>
        </div>
        <Sizer height={32} />
        <div className={'relative mx-auto h-[400px] w-[calc(100%-100px)] justify-center bg-white'}>
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand as Hand}
            handSettings={getHandSettings(songConfig)}
            getTime={() => player.getTime()}
            game={true}
          />
        </div>
        <div className="flex basis-0 items-center justify-center gap-4 text-white">
          <PhrasesBtn
            onClick={handleReplay}
            className="border-purple-primary text-purple-primary hover:bg-purple-light border bg-white"
          >
            Replay
          </PhrasesBtn>
          <PhrasesBtn onClick={handleNext} className="bg-purple-primary hover:bg-purple-hover">
            Next
          </PhrasesBtn>
        </div>
      </div>
    </>
  )
}

function ProgressDisplay() {
  const player = usePlayer()
  const progressRef = useRef<HTMLDivElement>(null)
  useRAFLoop(() => {
    if (!progressRef.current) {
      return
    }
    const progress = (player.getTime() / player.getDuration()) * 100
    progressRef.current.style.width = `${progress}%`
  })
  return (
    <div className="flex min-w-[150px] flex-col gap-2">
      <span className="w-full text-xl font-semibold text-black">Progress</span>
      <div className="relative h-[40px] w-full">
        <div className="absolute bottom-0 h-[34px] w-full rounded-r-3xl bg-gray-300" />
        <div
          style={{
            boxShadow: `inset 0px 2px 3px rgba(255, 255, 255, 0.4), inset 0px 7px 11px rgba(255, 255, 255, 0.25)`,
          }}
          className="from-purple-darkest to-purple-primary absolute bottom-0 h-[34px] rounded-r-3xl bg-linear-to-r"
          ref={progressRef}
        />
      </div>
    </div>
  )
}

function StatDisplay(props: PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex min-w-[150px] flex-col gap-2">
      <span className="text-xl font-semibold text-black">{props.label}</span>
      <span className="text-purple-primary text-4xl font-semibold">{props.children}</span>
    </div>
  )
}

type ButtonProps = React.HTMLProps<{}>
function PhrasesBtn({ children, ...rest }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...(rest as any)}
      className={clsx(rest.className, 'w-[100px] rounded-md px-2 py-2 text-xl transition')}
    >
      {children}
    </button>
  )
}
