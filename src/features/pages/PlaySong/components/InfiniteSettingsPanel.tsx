import React, { PropsWithChildren, useCallback, useRef, useState } from 'react'
import { Toggle } from '@/components'
import { Song, SongConfig, VisualizationMode } from '@/types'
import { getKeySignatures, KEY_SIGNATURE } from '@/features/theory'
import { useEventListener, useWhenClickedOutside } from '@/hooks'
import clsx from 'clsx'
import BpmDisplay from './BpmDisplay'
import { GeneratedSongSettings } from '../infinite'

type SidebarProps = {
  open: boolean
  config: GeneratedSongSettings
  song?: Song
  onClose?: () => void
  onChange: (settings: GeneratedSongSettings) => void
}

export default function InfiniteSettingsPanel(props: SidebarProps) {
  const { left, right, generator, waiting, noteLetter, keySignature } = props.config
  const { open, onClose } = props

  const sidebarRef = useRef<HTMLDivElement>(null)

  const clickedOutsideHandler = useCallback(() => {
    open && onClose?.()
  }, [open, onClose])
  useWhenClickedOutside(clickedOutsideHandler, sidebarRef)
  useEventListener<KeyboardEvent>('keydown', (e) => {
    if (e.key === 'Escape') {
      onClose?.()
    }
  })

  const handleHand = (selected: 'left' | 'right') => {
    if (selected === 'left') {
      props.onChange({ ...props.config, left: !props.config.left })
    }
    if (selected === 'right') {
      props.onChange({ ...props.config, right: !props.config.right })
    }
  }

  const handleGenerator = (selected: 'eMinor' | 'dMajor' | 'random') => {
    props.onChange({ ...props.config, generator: selected })
  }

  function handleWaiting(waiting: boolean) {
    props.onChange({ ...props.config, waiting })
  }
  function handleNotes() {
    props.onChange({ ...props.config, noteLetter: !noteLetter })
  }
  function handleKeySignature(keySignature: KEY_SIGNATURE) {
    props.onChange({ ...props.config, keySignature })
  }

  return (
    <div
      className="flex flex-col sm:flex-row relative w-full bg-gray-100 p-4 gap-4 overflow-auto max-h-[calc(100vh-300px)]"
      ref={sidebarRef}
    >
      <h3 className="text-2xl text-purple-primary text-center">Settings</h3>
      <div className="flex flex-col items-center sm:items-stretch sm:flex-row gap-4 whitespace-nowrap flex-wrap flex-grow">
        <Section title="Speed" className="min-w-[150px] flex-grow">
          <BpmDisplay />
        </Section>
        <Section title="Hands" className="flex flex-col flex-grow">
          <div className="flex gap-2 justify-center">
            <span className="w-10">Right</span>
            <Toggle checked={right} onChange={() => handleHand('right')} />
          </div>
          <div className="flex gap-2 justify-center">
            <span className="w-10">Left</span>
            <Toggle className="self-center" checked={left} onChange={() => handleHand('left')} />
          </div>
        </Section>
        <Section title="Generator" className="flex-grow">
          <button
            className="flex gap-1 items-center justify-center"
            onClick={() => handleGenerator('eMinor')}
          >
            <input type="radio" className="w-5" checked={generator === 'eMinor'} readOnly />
            <span className="block w-[120px] text-left">E Minor</span>
          </button>
          <button
            className="flex gap-1 items-center justify-center"
            onClick={() => handleGenerator('dMajor')}
          >
            <input className="w-5" type="radio" checked={generator === 'dMajor'} readOnly />
            <span className="block w-[120px] text-left"> D Major</span>
          </button>
          <button
            className="flex gap-1 items-center justify-center"
            onClick={() => handleGenerator('random')}
          >
            <input className="w-5" type="radio" checked={generator === 'random'} readOnly />
            <span className="block w-[120px] text-left"> Random</span>
          </button>
        </Section>
        <div className="flex gap-4 flex-grow flex-col sm:flex-row">
          <Section title="Additional settings" className="flex-grow justify-center">
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Wait Mode</span>
              <Toggle className="" checked={waiting} onChange={handleWaiting} />
            </div>
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Display note letter</span>
              <Toggle checked={noteLetter} onChange={handleNotes} />
            </div>
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Key signature</span>
              <select
                name="keySignature"
                className="border w-[50px]"
                value={keySignature ?? props.song?.keySignature}
                onChange={(e) => handleKeySignature(e.target.value as KEY_SIGNATURE)}
              >
                {getKeySignatures().map((keySig) => {
                  return <option key={`id-${keySig}`}>{keySig}</option>
                })}
              </select>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

type SectionProps = PropsWithChildren<{ title: string; className?: string; onClick?: any }>
function Section({ children, title, className, onClick }: SectionProps) {
  return (
    <article
      className={clsx(
        className,
        'bg-gray-200 p-4 rounded-md flex flex-col gap-4 max-w-[70vw] min-w-[70vw] sm:min-w-0',
      )}
      onClick={onClick}
    >
      <h3 className="font-semibold text-base text-center">{title}</h3>
      {children}
    </article>
  )
}
