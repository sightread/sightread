import React from 'react'
import { MouseEvent } from 'react'
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
import { palette } from '@/styles/common'

const classes = css({
  topbarIcon: {
    cursor: 'pointer',
    fill: 'white',
    '&:hover': {
      fill: palette.purple.primary,
    },
    '& .active ': {
      fill: palette.purple.primary,
    },
  },
  figmaIcon: {
    '&:hover path': {
      fill: palette.purple.primary,
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
      fill: palette.purple.primary,
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
      color: palette.purple.primary,
    },
    '& i.active': {
      color: palette.purple.primary,
    },
  },
})

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  isSoundOff: boolean
  onTogglePlaying: () => void
  onClickSettings: (e: MouseEvent<any>) => void
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
        <span data-tooltip="Back" data-tooltip-position="bottom">
          <ArrowLeftIcon
            className={classes.topbarIcon}
            height={40}
            width={50}
            onClick={onClickBack}
          />
        </span>
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
        <span data-tooltip="Restart" data-tooltip-position="bottom">
          <PreviousIcon
            className={classes.topbarIcon}
            height={40}
            width={40}
            onClick={onClickRestart}
          />
        </span>

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
        <span data-tooltip="Settings" data-tooltip-position="bottom">
          <SettingsCog
            width={25}
            height={25}
            className={clsx(classes.figmaIcon, classes.fillWhite, classNames?.settingsCog)}
            onClick={onClickSettings}
          />
        </span>
        <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        <span
          className={classes.figmaIcon}
          style={{ display: 'inline-block' }}
          onClick={onSelectRange}
          data-tooltip="Loop"
          data-tooltip-position="bottom"
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
          data-tooltip="Toggle volume"
          data-tooltip-position="bottom"
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
