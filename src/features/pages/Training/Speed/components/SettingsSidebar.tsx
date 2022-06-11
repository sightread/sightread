import React from 'react'
import { Toggle, Sizer } from '@/components'
import { palette as colors } from '@/styles/common'
import { AdjustInstruments } from '@/features/SongInputControls'
import { getKeySignatures, KEY_SIGNATURE } from '@/features/theory'
import { SpeedTrainingConfig } from '..'

type SidebarProps = {
  open: boolean
  onChange: (settings: SpeedTrainingConfig) => void
  config: SpeedTrainingConfig
}
type Generator = 'random' | 'excerpts'

export default function SettingsSidebar(props: SidebarProps) {
  const { clef, displayLetter, generator } = props.config

  const handleGenerator = (generator: Generator) => {
    props.onChange({ ...props.config, generator })
  }
  const handleClef = (clef: 'bass' | 'treble') => {
    props.onChange({ ...props.config, clef })
  }
  function handleDisplayLetter() {
    props.onChange({ ...props.config, displayLetter: !displayLetter })
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
      <Sizer height={32} />
      <h3 style={{ fontSize: 32, color: colors.purple.primary, textAlign: 'center' }}>Settings</h3>
      <Sizer height={36} />
      <div style={{ fontSize: 18, flexDirection: 'column', textAlign: 'center' }}>
        <h3 style={{ textAlign: 'center' }}>Generator</h3>
        <Sizer height={10} />
        <div style={{ fontSize: 14 }}>
          <span> Random </span>
          <input
            type="radio"
            checked={generator === 'random'}
            onChange={() => handleGenerator('random')}
          />
        </div>
        <Sizer height={10} />
        <div style={{ fontSize: 14 }}>
          <span> Sheet</span>
          <input
            type="radio"
            checked={generator === 'excerpts'}
            onChange={() => handleGenerator('excerpts')}
          />
        </div>
        <Sizer height={36} />
        <div style={{ fontSize: 18, flexDirection: 'column', textAlign: 'center' }}>
          <h3 style={{ textAlign: 'center' }}>Clef</h3>
          <Sizer height={10} />
          <div style={{ fontSize: 14 }}>
            <span> Treble </span>
            <input type="radio" checked={clef === 'treble'} onChange={() => handleClef('treble')} />
          </div>
          <Sizer height={10} />
          <div style={{ fontSize: 14 }}>
            <span> Bass</span>
            <input type="radio" checked={clef === 'bass'} onChange={() => handleClef('bass')} />
          </div>
        </div>
        <Sizer height={36} />
        <div
          style={{ display: 'flex', fontSize: 18, flexDirection: 'column', alignItems: 'center' }}
        >
          Display Note Letter
          <Sizer height={8} />
          <Toggle checked={displayLetter} onChange={handleDisplayLetter} />
        </div>
      </div>
    </div>
  )
}
