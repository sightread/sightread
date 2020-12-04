import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { usePlayer, useWindowSize } from '../hooks'
import { CenteringWrapper, formatTime, getSong, inferHands, Logo, Sizer } from '../utils'
import { WindowedSongBoard } from '../WindowedSongboard'
import { PianoRoll, PlayableSong, SongScrubBar } from './play/[...song_location]'
import songManifest from '../manifest.json'
import { css } from '../flakecss'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'

type displayParams = {
  sortCol: number
  search: string
  page: string
}

type SelectSongPageProps = {
  page: 'songs' | 'lessons'
}

const displayOptions = (songOptions: any, { page, sortCol, search }: displayParams) => {
  const includesSearch = (value: string) => value.toUpperCase().includes(search.toUpperCase())
  const searchIsEmpty = search === ''
  if (page === 'songs') {
    const cols = ['name', 'artist', 'difficulty', 'length']
    const sortBy: string = cols[Math.abs(sortCol) - 1]
    return songOptions
      .filter(
        (song: any) => searchIsEmpty || includesSearch(song.artist) || includesSearch(song.name),
      )
      .sort((a: any, b: any) => sortCol * a[sortBy]?.localeCompare(b[sortBy]))
  }
  return songOptions.filter((lesson: any) => searchIsEmpty || includesSearch(lesson.name))
}

export default function SelectSongPage({ page }: SelectSongPageProps) {
  const [sortCol, setSortCol] = useState<number>(1)
  const [search, saveSearch] = useState('')
  const [selectedSong, setSelectedSong] = useState<any>('')
  const router = useRouter()

  const type = page === 'songs' ? 'song' : 'lesson'
  const songOptions = songManifest.filter((s) => s.type === type)
  const toDisplay = displayOptions(songOptions, { sortCol, search, page })

  return (
    <>
      <ModalShit
        show={!!selectedSong}
        songMeta={selectedSong}
        onClose={() => {
          setSelectedSong(null)
        }}
      />
      <CenteringWrapper backgroundColor={'black'}>
        <div
          style={{
            height: 60,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            maxWidth: 1024,
            margin: '0 auto',
          }}
        >
          <Logo />
          <Sizer width={16} />
          <span style={{ fontWeight: 500, fontSize: 24 }}>SIGHTREAD</span>
          <Sizer width={60} />
          <div
            style={{
              fontSize: 16,
              width: 400,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Free Play</span>
            <Link href="songs">
              <a style={{ color: 'white', textDecoration: 'none' }}>Songs</a>
            </Link>
            <Link href="lessons">
              <a style={{ color: 'white', textDecoration: 'none' }}>Lessons</a>
            </Link>
            <span>About</span>
          </div>
          <span style={{ marginLeft: 'auto', marginRight: 50 }}>Log in / Sign up</span>
        </div>
      </CenteringWrapper>
      <CenteringWrapper backgroundColor={'#F2F2F2'} verticalGutter={60}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 36px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              height: 'calc(100% - 60px)',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Sizer height={24} />
            <h2 style={{ fontSize: 36 }}>{page[0].toUpperCase() + page.slice(1)}</h2>
            <Sizer height={24} />
            <SearchBox onSearch={saveSearch} />
            <Sizer height={20} />
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                flexGrow: 1,
                backgroundColor: '#FFF',
                boxShadow: `0px 0px 5px rgba(0, 0, 0, 0.2)`,
                borderRadius: 5,
              }}
            >
              <div
                className="table_header"
                style={{
                  position: 'sticky',
                  top: 0,
                  display: 'flex',
                  alignItems: 'center',
                  height: 30,
                  boxSizing: 'border-box',
                  fontWeight: 600,
                  color: '#AE0101',
                  backgroundColor: '#F1F1F1',
                  flexShrink: 0,
                  borderBottom: '#d9d5ec solid 1px',
                  zIndex: 1,
                }}
              >
                {page === 'songs' && (
                  <>
                    {['TITLE', 'ARTIST', 'DIFFICULTY', 'LENGTH'].map((colName, i) => {
                      let className = ''
                      if (Math.abs(sortCol) === i + 1) {
                        className = `activeSortHeader`
                        if (sortCol < 0) {
                          className += ' up'
                        }
                      }
                      return (
                        <div style={{ paddingLeft: i === 0 ? 30 : 0, width: '25%' }} key={i}>
                          <span
                            onClick={() => {
                              if (sortCol === i + 1) {
                                setSortCol(-(i + 1))
                              } else {
                                setSortCol(i + 1)
                              }
                            }}
                            className={className}
                          >
                            {colName}
                          </span>
                        </div>
                      )
                    })}
                  </>
                )}
                {page === 'lessons' && (
                  <>
                    <span style={{ paddingLeft: 30, width: '15%' }}>LESSON</span>
                    <span style={{ width: '50%' }}>TITLE</span>
                    <span style={{ width: '33%' }}>DIFFICULTY</span>
                  </>
                )}
              </div>
              <div
                style={{
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  position: 'absolute',
                  top: 30,
                  height: 'calc(100% - 30px)',
                  width: '100%',
                }}
              >
                {toDisplay.map((song: any) => (
                  <div
                    onClick={() => setSelectedSong(song)}
                    style={{
                      position: 'relative',
                      boxSizing: 'border-box',
                      height: 35,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      borderBottom: '#d9d5ec solid 1px',
                    }}
                    className="SelectSongPage__song"
                    key={song.file}
                  >
                    {page === 'songs' && (
                      <>
                        <span style={{ paddingLeft: 30, width: '25%' }}>{song.name}</span>
                        <span style={{ width: '25%' }}>{song.artist}</span>
                        <span style={{ width: '25%' }}>{song.difficulty}</span>
                        <span style={{ width: '25%' }}>{formatTime(song.duration)}</span>
                      </>
                    )}
                    {page === 'lessons' && (
                      <>
                        <span style={{ paddingLeft: 30, width: '15%' }}>{song.lesson}</span>
                        <span style={{ width: '50%' }}>{song.name}</span>
                        <span style={{ width: '33%' }}>{'Easy'}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CenteringWrapper>
    </>
  )
}

// fallback false because which pages to be rendered is not updated
// except for hardcoding
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { page: 'songs' } }, { params: { page: 'lessons' } }],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const page = params?.page
  return {
    props: { page },
  }
}

function SearchBox({ onSearch }: any = { onSearch: () => {} }) {
  return (
    <div style={{ position: 'relative', height: 32, width: 300 }}>
      <input
        type="search"
        onChange={(e: any) => onSearch(e.target.value)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          paddingLeft: 40,
          backgroundColor: '#F9F9F9',
          borderRadius: '5px',
          boxShadow: 'inset 0px 1px 4px rgba(0, 0, 0, 0.25)',
          border: 'none',
        }}
        placeholder="Search Songs by Title or Artist"
      />
      <i
        className="fa fa-search"
        style={{
          fontSize: 16,
          position: 'absolute',
          left: 10,
          width: 16,

          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}

function ModalShit({ show = true, onClose = () => {}, songMeta = undefined } = {}) {
  const { width: windowWidth } = useWindowSize()
  const modalRef = useRef<HTMLDivElement>(null)
  const [song, setSong] = useState<PlayableSong | null>(null)
  const [playing, setPlaying] = useState(false)
  const { player } = usePlayer()
  const router = useRouter()

  useEffect(() => {
    if (!show) {
      return
    }

    function outsideClickHandler(e: MouseEvent) {
      if (!modalRef.current) {
        return
      }

      if (!modalRef.current.contains(e.target as Node)) {
        setSong(null)
        onClose()
      }
    }
    function escHandler(e: KeyboardEvent) {
      if (!modalRef.current) {
        return
      }
      if (e.key === 'Escape') {
        setSong(null)
        onClose()
      }
    }
    window.addEventListener('mousedown', outsideClickHandler)
    window.addEventListener('keydown', escHandler)
    return () => {
      window.removeEventListener('mousedown', outsideClickHandler)
      window.removeEventListener('keydown', escHandler)
    }
  }, [show, onClose])

  useEffect(() => {
    if (!songMeta || !(songMeta as any).file) {
      return
    }
    getSong(`${(songMeta as any).file}`)
      .then(inferHands)
      .then((song: PlayableSong) => {
        setSong(song)
        player.setSong(song)
      })
    return () => {
      player.stop()
      setPlaying(false)
    }
  }, [songMeta, player])

  if (!show || !song) {
    return null
  }

  const { file, name } = songMeta as any
  const width = Math.min(800, windowWidth - 200)
  const innerWidth = width - 100

  css(
    {
      '.close-modal': {
        color: 'rgb(174, 1, 1)',
        fontSize: 24,
        transition: '150ms',
      },
      '.close-modal:hover': {
        color: 'rgb(174, 1, 1, 0.5)',
      },
      '.modal-play-btn': {
        color: 'rgb(176, 176, 176)',
        transition: '150ms',
      },
      '.modal-play-btn:hover': {
        color: 'white',
      },
      '.selectsong__play-now-btn': {
        backgroundColor: 'rgb(174, 1, 1)',
      },
      '.selectsong__play-now-btn:hover': {
        backgroundColor: 'rgba(174, 1, 1, 0.5)',
      },
    },
    'SelectSongPage.ModalShit',
  )
  return (
    <>
      <div
        style={{
          position: 'fixed',
          height: '100vh',
          width: '100vw',
          zIndex: 2,
          backgroundColor: 'rgba(126,126,126, 0.65)',
        }}
      />
      <div
        ref={modalRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          width,
          height: 600,
          backgroundColor: 'white',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          borderRadius: 5,
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
          }}
          onClick={onClose}
        >
          <i className="close-modal fas fa-window-close" />
        </button>
        {!playing && (
          <i
            className="modal-play-btn fas fa-play"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              fontWeight: 900,
              fontSize: 69,
              zIndex: 1,
              cursor: 'pointer',
            }}
            onClick={() => {
              player.play()
              setPlaying(true)
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            width: innerWidth,
            flexDirection: 'column',
            margin: '0 auto',
            height: '100%',
          }}
        >
          <Sizer height={16} />
          <h4 style={{ fontSize: 30, fontWeight: 600 }}>{name}</h4>
          <Sizer height={16} />
          <div
            style={{
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
                zIndex: 5,
                pointerEvents: 'none',
                borderRadius: 5,
              }}
            />
            <SongScrubBar song={song} width={innerWidth} />
          </div>
          <div style={{ backgroundColor: '#2e2e2e', width: innerWidth, margin: '0 auto' }}>
            <div
              onClick={() => {
                if (playing) {
                  player.pause()
                  setPlaying(false)
                } else {
                  player.play()
                  setPlaying(true)
                }
              }}
            >
              <WindowedSongBoard width={innerWidth} height={330} song={song} hand={'both'} />
            </div>
            <PianoRoll width={innerWidth} selectedHand={'both'} song={song} />
          </div>
          <div
            style={{
              height: 40,
              width: innerWidth,
              margin: '0 auto',
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'row',
              fontSize: 22,
              fontWeight: 600,
              lineHeight: '40px', // vertically center hack.
            }}
          >
            <span>Difficulty:</span>
            <Sizer width={8} />
            <span style={{ color: 'green' }}>Easy</span>
            <Sizer width={36} />
            <span>Duration:</span>
            <Sizer width={8} />
            <span style={{ color: 'gray' }}>{formatTime(song.duration)}</span>
            <button
              className="selectsong__play-now-btn"
              style={{
                width: 120,
                color: 'white',
                height: 40,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 5,
                marginLeft: 'auto',
                fontSize: 22,
                transition: '150ms',
              }}
              onClick={() => router.push(`/play/${file}`)}
            >
              Play Now
            </button>
          </div>
          <Sizer height={16} />
        </div>
      </div>
    </>
  )
}
