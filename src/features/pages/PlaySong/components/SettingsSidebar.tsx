import React, { useCallback, useRef } from 'react'
import { Toggle, Sizer } from '@/components'
import { Song, SongConfig, VisualizationMode } from '@/types'
import { palette as colors } from '@/styles/common'
import { AdjustInstruments } from '@/features/SongInputControls'
import { getKeySignatures, KEY_SIGNATURE } from '@/features/theory'
import { useWhenClickedOutside } from '@/hooks'

type SidebarProps = {
  open: boolean
  onChange: (settings: SongConfig) => void
  config: SongConfig
  song?: Song
  onClose?: () => void
}

export default function SettingsSidebar(props: SidebarProps) {
  const { left, right, visualization, waiting, noteLetter, keySignature } = props.config
  const { open, onClose } = props

  const sidebarRef = useRef<HTMLDivElement>(null)

  const clickedOutsideHandler = useCallback(() => open && onClose?.(), [open, onClose])
  useWhenClickedOutside(clickedOutsideHandler, sidebarRef)

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
  function handleKeySignature(keySignature: KEY_SIGNATURE) {
    props.onChange({ ...props.config, keySignature })
  }

  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        flexDirection: 'column',
        borderLeft: '1px solid black',
        overflowY: 'auto',
      }}
      ref={sidebarRef}
    >
      <Sizer height={10} />
      <h3 style={{ fontSize: 24, color: colors.purple.primary, textAlign: 'center' }}>Settings</h3>
      <Sizer height={36} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          fontSize: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          Left hand
          <Sizer height={8} />
          <Toggle checked={left} onChange={() => handleHand('left')} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          Right hand
          <Sizer height={8} />
          <Toggle checked={right} onChange={() => handleHand('right')} />
        </div>
      </div>
      <Sizer height={36} />
      <div style={{ fontSize: 16, flexDirection: 'column', textAlign: 'center' }}>
        <h3 style={{ textAlign: 'center' }}>Visualization</h3>
        <Sizer height={10} />
        <div style={{ fontSize: 14, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'block', width: 120, textAlign: 'left' }}> Falling notes </span>
          <input
            type="radio"
            checked={visualization === 'falling-notes'}
            onChange={() => handleVisualization('falling-notes')}
          />
        </div>
        <Sizer height={10} />
        <div style={{ fontSize: 14, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'block', width: 120, textAlign: 'left' }}>Sheet hero (beta)</span>
          <input
            type="radio"
            checked={visualization === 'sheet'}
            onChange={() => handleVisualization('sheet')}
          />
        </div>
      </div>
      <Sizer height={36} />
      <div style={{ display: 'flex', fontSize: 16, flexDirection: 'column', alignItems: 'center' }}>
        Wait Mode
        <Sizer height={8} />
        <Toggle checked={waiting} onChange={handleWaiting} />
      </div>
      <Sizer height={36} />
      <div style={{ display: 'flex', fontSize: 16, flexDirection: 'column', alignItems: 'center' }}>
        Display note letter
        <Sizer height={8} />
        <Toggle checked={noteLetter} onChange={handleNotes} />
      </div>
      <Sizer height={36} />
      <div style={{ display: 'flex', fontSize: 16, flexDirection: 'column', alignItems: 'center' }}>
        Key signature
        <Sizer height={8} />
        <select
          name="keySignature"
          value={keySignature ?? props.song?.keySignature}
          onChange={(e) => handleKeySignature(e.target.value as KEY_SIGNATURE)}
        >
          {getKeySignatures().map((keySig) => {
            return <option key={`id-${keySig}`}>{keySig}</option>
          })}
        </select>
      </div>
      <Sizer height={36} />
      <div
        style={{
          display: 'flex',
          fontSize: 16,
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h3 style={{ textAlign: 'center' }}>Difficulty scaling</h3>
        <Sizer height={10} />
        <span>nps</span> <input type="range"></input>
        <Sizer height={10} />
        <span>notes</span> <input type="range"></input>
        <Sizer height={36} />
        <h2 style={{ textAlign: 'center', fontSize: 18 }}>Tracks Configuration</h2>
        <AdjustInstruments
          config={props.config}
          setTracks={(tracks) => {
            props.onChange({ ...props.config, tracks })
          }}
          song={props.song}
        />
      </div>
    </div>
  )
}
