import { Toggle } from '@/components'
import { AdjustInstruments } from '@/features/controls'
import { getKeySignatures, KEY_SIGNATURE, NOTE_LABELS } from '@/features/theory'
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
  const { left, right, visualization, waiting, noteLabels, coloredNotes, keySignature } =
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
  function handleNoteLabels(noteLabels: NOTE_LABELS) {
    props.onChange({ ...props.config, noteLabels })
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
      <h3 className="text-purple-primary text-center text-2xl">Settings</h3>
      <div className="mx-20 flex grow flex-col flex-wrap items-stretch gap-4 whitespace-nowrap sm:mx-0 sm:flex-row">
        <Section title="Speed" className="flex grow">
          <BpmDisplay />
        </Section>
        <Section title="Hands" className="flex grow flex-col">
          <div className="flex justify-center gap-2">
            <span className="w-10">Left</span>
            <Toggle className="self-center" checked={left} onChange={() => handleHand('left')} />
          </div>
          <div className="flex justify-center gap-2">
            <span className="w-10">Right</span>
            <Toggle checked={right} onChange={() => handleHand('right')} />
          </div>
        </Section>
        <Section title="Visualization" className="grow">
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
        <div className="flex grow flex-col gap-4 sm:flex-row">
          <Section title="Additional settings" className="grow justify-center">
            <div className="flex justify-center">
              <span className="min-w-[18ch]">Wait mode</span>
              <div className="flex w-[120px]">
                <Toggle checked={waiting} onChange={handleWaiting} />
              </div>
            </div>
            <div className="flex justify-center">
              <span className="min-w-[18ch]">Colored notes</span>
              <div className="flex w-[120px]">
                <Toggle checked={coloredNotes} onChange={handleColoredNotes} />
              </div>
            </div>
            <div className="flex justify-center">
              <span className="min-w-[18ch]">Note Labels</span>
              <select
                name="noteLabels"
                className="w-[120px] border bg-white"
                value={noteLabels}
                onChange={(e) => handleNoteLabels(e.target.value as NOTE_LABELS)}
              >
                <option key={`id-none`} value="none">
                  None
                </option>
                <option key={`id-alphabetical`} value={'alphabetical'}>
                  Alphabetical
                </option>
                <option key={`id-fixed-do`} value={'fixed-do'}>
                  Fixed-Do
                </option>
              </select>
            </div>
            <div className="flex justify-center">
              <span className="min-w-[18ch]">Key signature</span>
              <div className="flex w-[120px]">
                <select
                  name="keySignature"
                  className="w-[50px] border bg-white"
                  value={keySignature ?? props.song?.keySignature}
                  onChange={(e) => handleKeySignature(e.target.value as KEY_SIGNATURE)}
                >
                  {getKeySignatures().map((keySig) => {
                    return (
                      <option key={`id-${keySig}`} value={keySig}>
                        {keySig}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </Section>
          <div className="flex grow flex-col justify-between gap-4">
            <Section title="Practice loop">
              <div className="flex justify-center">
                <Toggle checked={isLooping} onChange={onLoopToggled} />
              </div>
            </Section>
            <Section
              title="Track configuration"
              onClick={() => setShowTrackConfig((b) => !b)}
              className="hover:bg-purple-light cursor-pointer"
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
      className={clsx(className, 'flex flex-col gap-4 rounded-md bg-gray-200 px-8 py-4 sm:min-w-0')}
      onClick={onClick}
    >
      <h3 className="text-center text-base font-semibold">{title}</h3>
      {children}
    </article>
  )
}
