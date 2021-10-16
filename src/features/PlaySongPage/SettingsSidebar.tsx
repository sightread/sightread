import React from 'react'
import { Toggle } from 'src/components'
import { SongConfig, VisualizationMode } from 'src/types'
import { Sizer } from 'src/utils'
import { palette as colors } from 'src/styles/common'
import { AdjustInstruments } from './AdjustInstruments'

type SidebarProps = {
  open: boolean
  onChange: (settings: SongConfig) => void
  settings: SongConfig
}

export function SettingsSidebar(props: SidebarProps) {
  const { left, right, visualization, waiting, noteLetter } = props.settings
  const handleHand = (selected: 'left' | 'right') => {
    if (selected === 'left') {
      props.onChange({ ...props.settings, left: !props.settings.left })
    }
    if (selected === 'right') {
      props.onChange({ ...props.settings, right: !props.settings.right })
    }
  }

  const handleVisualization = (visualization: VisualizationMode) => {
    props.onChange({ ...props.settings, visualization })
  }

  const handleWaiting = (waiting: boolean) => {
    props.onChange({ ...props.settings, waiting })
  }
  function handleNotes() {
    props.onChange({ ...props.settings, noteLetter: !noteLetter })
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
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
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
        <div style={{ fontSize: 14 }}>
          <span> Falling notes </span>
          <input
            type="radio"
            checked={visualization === 'falling-notes'}
            onChange={() => handleVisualization('falling-notes')}
          />
        </div>
        <Sizer height={10} />
        <div style={{ fontSize: 14 }}>
          <span> Sheet</span>{' '}
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
          config={props.settings}
          setTracks={(tracks) => {
            props.onChange({ ...props.settings, tracks })
          }}
        />
      </div>
    </div>
  )
}
