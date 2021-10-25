import React from 'react'
import { Select } from '@/components'
import { BpmDisplay } from '@/features/SongInputControls'
import { formatInstrumentName } from '@/utils'
import { gmInstruments, InstrumentName } from '@/synth/instruments'
import { ArrowLeftIcon } from '@/icons'
import { useRouter } from 'next/router'
import { css } from '@sightread/flake'

const classes = css({
  topbar: {
    '& i': {
      color: 'white',
      cursor: 'pointer',
      transition: 'color 0.1s',
      fontSize: 24,
      width: 22,
    },
    '& i:hover': {
      color: 'rgba(58, 104, 231, 1)',
    },
    '& i.active': {
      color: 'rgba(58, 104, 231, 1)',
    },
  },
  topbarIcon: {
    fill: 'white',
    cursor: 'pointer',
    transition: '100ms',
    '&:hover': {
      fill: 'rgba(58, 104, 231, 1)',
    },
  },
})

type TopBarProps = {
  isError: boolean
  isLoading: boolean
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
}

export default function TopBar({ isError, isLoading, value, onChange }: TopBarProps) {
  const router = useRouter()

  return (
    <div
      id="topbar"
      className={`${classes.topbar}`}
      style={{
        position: 'fixed',
        height: 55,
        width: '100vw',
        zIndex: 2,
        backgroundColor: '#292929',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        aria-label="left-items"
        style={{ width: '33%', paddingLeft: '20px', boxSizing: 'border-box', cursor: 'pointer' }}
      >
        <ArrowLeftIcon
          className={classes.topbarIcon}
          width={50}
          height={40}
          onClick={() => {
            router.back()
          }}
        />
      </div>
      <div
        aria-label="center-items"
        className="nav-buttons"
        style={{ width: '33%', display: 'flex', justifyContent: 'center' }}
      >
        <BpmDisplay />
      </div>
      <div
        aria-label="right-items"
        style={{
          width: '34%',
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: '20px',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ width: '200px', display: 'inline-block' }}>
          <Select
            loading={isLoading}
            error={isError}
            value={value}
            onChange={onChange}
            options={gmInstruments as any}
            format={formatInstrumentName}
            display={formatInstrumentName}
          />
        </span>
      </div>
    </div>
  )
}
