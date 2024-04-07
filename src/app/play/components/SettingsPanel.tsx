import { Toggle } from '@/components'
import { AdjustInstruments } from '@/features/controls'
import { getKeySignatures, KEY_SIGNATURE } from '@/features/theory'
import { useEventListener, useWhenClickedOutside } from '@/hooks'
import { Song, SongConfig, VisualizationMode } from '@/types'
import clsx from 'clsx'
import React, { PropsWithChildren, useCallback, useRef, useState } from 'react'
import BpmDisplay from './BpmDisplay'

type SidebarProps = {
  onChange: (settings: SongConfig) => void
  config: SongConfig
  song?: Song
  onClose?: () => void
  isLooping: boolean
  onLoopToggled: (b: boolean) => void
}

export default function SettingsPanel(props: SidebarProps) {
  const { left, right, visualization, waiting, noteLetter, coloredNotes, keySignature } =
    props.config
  const { onClose, onLoopToggled, isLooping } = props
  const [showTrackConfig, setShowTrackConfig] = useState(false)

  const sidebarRef = useRef<HTMLDivElement>(null)

  const clickedOutsideHandler = useCallback(() => onClose?.(), [onClose])
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

  const handleVisualization = (visualization: VisualizationMode) => {
    props.onChange({ ...props.config, visualization })
  }
  function handleWaiting(waiting: boolean) {
    props.onChange({ ...props.config, waiting })
  }
  function handleNotes() {
    props.onChange({ ...props.config, noteLetter: !noteLetter })
  }
  function handleColoredNotes() {
    props.onChange({ ...props.config, coloredNotes: !coloredNotes })
  }
  function handleKeySignature(keySignature: KEY_SIGNATURE) {
    props.onChange({ ...props.config, keySignature })
  }

  return (
    <div
      className="relative flex max-h-[calc(100vh-300px)] w-full flex-col gap-4 overflow-auto bg-gray-100 p-4 sm:flex-row"
      ref={sidebarRef}
    >
      <h3 className="text-center text-2xl text-purple-primary">Settings</h3>
      <div className="flex flex-grow flex-col flex-wrap items-center gap-4 whitespace-nowrap sm:flex-row sm:items-stretch">
        <Section title="Speed" className="flex flex-grow">
          <BpmDisplay />
        </Section>
        <Section title="Hands" className="flex flex-grow flex-col">
          <div className="flex justify-center gap-2">
            <span className="w-10">Left</span>
            <Toggle className="self-center" checked={left} onChange={() => handleHand('left')} />
          </div>
          <div className="flex justify-center gap-2">
            <span className="w-10">Right</span>
            <Toggle checked={right} onChange={() => handleHand('right')} />
          </div>
        </Section>
        <Section title="Visualization" className="flex-grow">
          <button
            className="flex items-center justify-center gap-1"
            onClick={() => handleVisualization('falling-notes')}
          >
            <input
              type="radio"
              className="w-5"
              checked={visualization === 'falling-notes'}
              readOnly
            />
            <span className="block w-[120px] text-left">Falling notes</span>
          </button>
          <button
            className="flex items-center justify-center gap-1"
            onClick={() => handleVisualization('sheet')}
          >
            <input className="w-5" type="radio" checked={visualization === 'sheet'} readOnly />
            <span className="block w-[120px] text-left"> Sheet hero (beta)</span>
          </button>
        </Section>
        <div className="flex flex-grow flex-col gap-4 sm:flex-row">
          <Section title="Additional settings" className="flex-grow justify-center">
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Wait mode</span>
              <Toggle className="" checked={waiting} onChange={handleWaiting} />
            </div>
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Display note letter</span>
              <Toggle checked={noteLetter} onChange={handleNotes} />
            </div>
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Colored notes</span>
              <Toggle checked={coloredNotes} onChange={handleColoredNotes} />
            </div>
            <div className="flex justify-center">
              <span className="min-w-[15ch]">Key signature</span>
              <select
                name="keySignature"
                className="w-[50px] border"
                value={keySignature ?? props.song?.keySignature}
                onChange={(e) => handleKeySignature(e.target.value as KEY_SIGNATURE)}
              >
                {getKeySignatures().map((keySig) => {
                  return <option key={`id-${keySig}`}>{keySig}</option>
                })}
              </select>
            </div>
          </Section>
          <div className="flex flex-grow flex-col justify-between gap-4">
            <Section title="Practice loop">
              <div className="flex justify-center">
                <Toggle checked={isLooping} onChange={onLoopToggled} />
              </div>
            </Section>
            <Section
              title="Track configuration"
              onClick={() => setShowTrackConfig((b) => !b)}
              className="cursor-pointer hover:bg-purple-light"
            ></Section>
          </div>
        </div>
        {showTrackConfig && (
          <div className="flex max-w-[70vw] basis-full flex-wrap justify-center">
            <AdjustInstruments
              config={props.config}
              setTracks={(tracks) => {
                props.onChange({ ...props.config, tracks })
              }}
              song={props.song}
            />
          </div>
        )}
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
        'flex min-w-[70vw] max-w-[70vw] flex-col gap-4 rounded-md bg-gray-200 p-4 sm:min-w-0',
      )}
      onClick={onClick}
    >
      <h3 className="text-center text-base font-semibold">{title}</h3>
      {children}
    </article>
  )
}
