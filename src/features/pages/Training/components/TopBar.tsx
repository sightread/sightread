import React from 'react'
import { BpmDisplay } from '@/features/SongInputControls'
import {
  ArrowLeftIcon,
  PreviousIcon,
  HistoryIcon,
  SoundOnIcon,
  SoundOffIcon,
  SettingsCog,
} from '@/icons'
import { css } from '@sightread/flake'
import clsx from 'clsx'
import StatusIcon from './StatusIcon'

const classes = css({
  topbarIcon: {
    cursor: 'pointer',
    fill: 'white',
    '&:hover': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& .active ': {
      fill: 'rgba(58, 104, 231, 1)',
    },
  },
  figmaIcon: {
    '&:hover path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '&:hover path.outline': {
      fill: 'black',
    },
    '& path': {
      cursor: 'pointer',
    },
    cursor: 'pointer',
  },
  fillWhite: {
    '& path': {
      fill: 'white',
    },
    fill: 'white',
  },
  active: {
    '& path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& path.outline': {
      fill: 'black',
    },
  },
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
})

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  isSoundOff: boolean
  onTogglePlaying: () => void
  onClickSettings: () => void
  onClickBack: () => void
  onClickRestart: () => void
  onClickSound: () => void
  onSelectRange: () => void
  classNames: {
    settingsCog?: string | false
    rangeIcon?: string | false
  }
}

export default function TopBar({
  isPlaying,
  isLoading,
  isSoundOff,
  onTogglePlaying,
  onClickSettings,
  onClickBack,
  onClickRestart,
  onClickSound,
  onSelectRange,
  classNames,
}: TopBarProps) {
  return (
    <div
      className={classes.topbar}
      style={{
        position: 'fixed',
        top: 0,
        height: 55,
        width: '100vw',
        zIndex: 2,
        backgroundColor: '#292929',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ width: 250 }}>
        <ArrowLeftIcon
          className={classes.topbarIcon}
          height={40}
          width={50}
          onClick={onClickBack}
        />
      </div>
      <div
        className="nav-buttons"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-around',
          width: 230,
        }}
      >
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <PreviousIcon
          className={classes.topbarIcon}
          height={40}
          width={40}
          onClick={onClickRestart}
        />

        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <BpmDisplay />
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
      </div>
      <div
        style={{
          display: 'flex',
          marginLeft: 'auto',
          alignItems: 'center',
          minWidth: 150,
          marginRight: 20,
        }}
      >
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <SettingsCog
          width={25}
          height={25}
          className={clsx(classes.figmaIcon, classes.fillWhite, classNames?.settingsCog)}
          onClick={onClickSettings}
        />
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <span
          className={classes.figmaIcon}
          style={{ display: 'inline-block' }}
          onClick={onSelectRange}
        >
          <HistoryIcon
            width={25}
            height={25}
            className={clsx(classes.figmaIcon, classes.fillWhite, classNames.rangeIcon)}
          />
        </span>
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <span
          className={classes.figmaIcon}
          style={{ display: 'inline-block' }}
          onClick={onClickSound}
        >
          {isSoundOff ? (
            <SoundOffIcon
              width={25}
              height={25}
              className={clsx(classes.figmaIcon, classes.fillWhite)}
            />
          ) : (
            <SoundOnIcon
              width={25}
              height={25}
              className={clsx(classes.figmaIcon, classes.fillWhite)}
            />
          )}
        </span>
      </div>
    </div>
  )
}
