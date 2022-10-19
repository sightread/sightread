import { AppBar, Sizer } from '@/components'
import { palette } from '@/styles/common'
import { css, mediaQuery } from '@sightread/flake'
import Link from 'next/link'
import React, { useState } from 'react'
import { PauseIcon, PlayIcon } from '@/icons'
import clsx from 'clsx'
import { breakpoints } from '@/utils'
import { SongPreview } from '../../SongPreview/SongPreview'
import { usePlayerState } from '@/hooks'

const classes = css({
  bannerBigText: {
    fontWeight: 700,
    fontSize: 'clamp(1.7rem, 1rem + 3vw, 4rem)',
  },
  bannerSmallText: {
    fontSize: 'clamp(1rem, 1rem + 1vw, 1.2rem)',
  },
  purpleBtn: {
    backgroundColor: palette.purple.primary,
    color: 'white',
    '&:hover': {
      backgroundColor: palette.purple.dark,
    },
  },
  ghostBtn: {
    backgroundColor: 'white',
    color: palette.purple.primary,
    border: `1px solid ${palette.purple.primary}`,
    '&:hover': {
      backgroundColor: palette.purple.light,
    },
  },
  songPreviewOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.83)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectSong: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
  },
  playPause: {
    cursor: 'pointer',
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    fill: 'white',
    '&.disabled': {
      fill: 'gray',
    },

    '&:hover': {
      fill: 'grey',
      color: 'grey',
    },

    [mediaQuery.down(breakpoints.sm)]: {
      position: 'absolute',
      left: 20,
    },
  },
})

const FEATURED_SONGS = {
  fur_elise: { source: 'builtin', id: 'b3decef157a073fbef49430250bb7015' },
  twinkle: { source: 'builtin', id: 'ec6acc14d631630c22ca796d0a5d5b0a' },
  moonlight: { source: 'builtin', id: '33e41ebf6367374ce7a5f033a5baa796' },
}

export default function LandingPage() {
  // TODO: don't merge this shit.
  const [playerState, playerActions] = usePlayerState()
  const [currentSong, setCurrentSong] = useState<keyof typeof FEATURED_SONGS>('twinkle')
  const { id: songId, source } = FEATURED_SONGS[currentSong]

  return (
    <>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 'max(800px, 100vh)',
          color: 'white',
        }}
      >
        <AppBar style={{ backgroundColor: palette.purple.dark }} />
        <div
          style={{
            padding: 32,
            backgroundColor: palette.purple.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1 className={classes.bannerBigText}>Your Piano Journey Begins Here</h1>
          <Sizer height={8} />
          <h3 className={classes.bannerSmallText}>
            Plug in your keyboard and learn, right in your browser
          </h3>
          <Sizer height={75 + 18} />
        </div>
        <div
          style={{
            position: 'relative',
            minWidth: 'min(100vw - 40px, 400px)',
            width: '75%',
            maxWidth: 760,
            height: 400,
            alignSelf: 'center',
            marginTop: -75,
            overflow: 'hidden',
            borderRadius: 8,
          }}
        >
          <SongPreview
            songId={songId}
            source={source}
            onReady={(id) => {
              if (id === songId) {
                playerActions.ready()
              }
            }}
          />
          <div className={classes.songPreviewOverlay}>
            <div
              className={clsx(classes.playPause, !playerState.canPlay && 'disabled')}
              onClick={playerActions.toggle}
            >
              {playerState.playing ? (
                <>
                  <PauseIcon height={24} width={24} />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon height={24} width={24} />
                  Play
                </>
              )}
            </div>
            <div className={classes.selectSong}>
              <select
                style={{
                  padding: 6,
                  backgroundColor: '#2e2e2e',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                }}
                onChange={(e) => {
                  // playerActions.reset()
                  setCurrentSong(e.target.value as any)
                }}
              >
                <option value="twinkle">Twinkle twinkle</option>
                <option value="fur_elise">Fur Elise</option>
                <option value="moonlight">Moonlight Sonata</option>
              </select>
            </div>
          </div>
        </div>
        <Sizer height={60} />
        <div
          style={{
            backgroundColor: 'rgba(220, 126, 82, 0.1)',
            marginTop: 'auto',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 24,
            paddingTop: 42,
            gap: 24,
          }}
        >
          <h3 style={{ color: 'black', fontSize: 'clamp(1rem, 1rem + 1vw, 2rem)' }}>
            Start learning
          </h3>
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min-content, 150px))',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Link href={'/songs'}>
              <a>
                <Button className={classes.purpleBtn}>Learn a song</Button>
              </a>
            </Link>
            <Link href={'/freeplay'}>
              <a>
                <Button className={classes.ghostBtn}>Freeplay</Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function Button({
  children,
  style,
  className,
}: {
  children?: React.ReactChild
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <button
      className={className}
      style={{
        transition: 'background-color 150ms',
        cursor: 'pointer',
        fontSize: 'clamp(0.875rem, 0.875rem + 0.5vw, 1.2rem)',
        padding: '10px 16px',
        borderRadius: 15,
        fontWeight: 700,
        minWidth: 'max-content',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
