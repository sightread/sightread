import { AppBar, Sizer } from '@/components'
import { getSong } from '@/features/api'
import Player from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { useSongSettings } from '@/hooks'
import { palette } from '@/styles/common'
import { Song } from '@/types'
import { css } from '@sightread/flake'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { PauseIcon, PlayIcon } from '@/icons'
import clsx from 'clsx'

const classes = css({
  bannerBigText: {
    fontWeight: 700,
    fontSize: 'clamp(1.7rem, 1rem + 3vw, 4rem)',
  },
  bannerSmallText: {
    fontSize: 'clamp(1rem, 1rem + 1vw, 1.5rem)',
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
    gap: 3,
    fill: 'white',
    cursor: 'pointer',

    '&.disabled': {
      fill: 'gray',
    },

    '&:hover': {
      fill: 'grey',
      color: 'grey',
    },
  },
})

export default function LandingPage() {
  // TODO: don't merge this shit.
  const [isPlaying, setIsPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const songId = 'b3decef157a073fbef49430250bb7015'
  const source = 'builtin'

  console.log({ isPlaying })

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
          }}
        >
          <h1 className={classes.bannerBigText}>Your Piano Journey Begins Here</h1>
          <Sizer height={8} />
          <h3 className={classes.bannerSmallText}>
            Learn how to play songs in your browser for free
          </h3>
          <Sizer height={75 + 32} />
        </div>
        <div
          style={{
            position: 'relative',
            minWidth: 'min(100%, 400px)',
            width: '75%',
            maxWidth: 760,
            height: 400,
            alignSelf: 'center',
            marginTop: -75,
            padding: 8,
          }}
        >
          <SongPreview
            songId={songId}
            source={source}
            onReady={(id) => {
              if (id === songId) {
                setCanPlay(true)
              }
            }}
          />
          <div
            className={clsx(classes.songPreviewOverlay, !canPlay && 'disabled')}
            onClick={() => {
              if (!canPlay) {
                return
              }
              const player = Player.player()
              if (isPlaying) {
                player.pause()
                setIsPlaying(false)
              } else {
                player.play()
                setIsPlaying(true)
              }
            }}
          >
            {isPlaying ? (
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

interface SongPreviewProps {
  songId: string
  source: string
  onReady?: (songId: string) => void
}
function SongPreview({ songId, source, onReady }: SongPreviewProps) {
  const [song, setSong] = useState<Song>()
  const [songConfig, setSongConfig] = useSongSettings('unknown')
  const player = Player.player()

  useEffect(() => {
    getSong(source, songId).then((song) => {
      setSong(song)
      player.setSong(song, songConfig)
      onReady?.(songId)
    })
  }, [songId, source])

  return (
    <SongVisualizer
      song={song}
      config={songConfig}
      getTime={() => Player.player().getTime()}
      hand={'both'}
      handSettings={getHandSettings(songConfig)}
    />
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
