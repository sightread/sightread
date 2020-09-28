import React, { useEffect, useRef, useState } from 'react'
import './SelectSong.css'
import { useHistory } from 'react-router-dom'
import { songs, lessons } from './songdata'
import { usePlayer, useWindowSize } from './hooks'
import { parseMidi, parseMusicXML, Song } from './utils'
import { WindowedSongBoard } from './WindowedSongboard'
import { PianoRoll, SongScrubBar } from './PlaySongPage'

let first = true
function SelectSongPage() {
  const { width, height } = useWindowSize()
  const [sortCol, setSortCol] = useState<number>(1)
  const history = useHistory()
  const [search, saveSearch] = useState('')
  const selected = window.location.pathname.includes('lesson') ? 'lessons' : 'songs'
  const songsRef = useRef<HTMLSpanElement>(null)
  const lessonsRef = useRef<HTMLSpanElement>(null)
  const underlineRef = useRef<HTMLDivElement>(null)
  const [selectedSong, setSelectedSong] = useState<any>('')

  let toDisplay: any = []
  if (selected === 'songs') {
    const cols = ['name', 'artist', 'difficulty', 'length']
    const field: string = cols[Math.abs(sortCol) - 1]
    toDisplay = songs
      .filter(
        (song) =>
          search === '' ||
          song.artist.toUpperCase().includes(search.toUpperCase()) ||
          song.name.toUpperCase().includes(search.toUpperCase()),
      )
      .sort((a: any, b: any) => (sortCol < 0 ? -1 : 1) * a[field]?.localeCompare(b[field]))
  } else {
    toDisplay = lessons.filter(
      (lesson) => search === '' || lesson.name.toUpperCase().includes(search.toUpperCase()),
    )
  }

  const selectedStyle = { color: '#AE0101' }
  const unselectedStyle = { cursor: 'pointer' }

  useEffect(() => {
    if (!songsRef.current || !lessonsRef.current || !underlineRef.current) {
      return
    }

    function moveUnderline(fromEl: HTMLElement, toEl: HTMLElement) {
      const to = toEl.getBoundingClientRect()
      const from = fromEl.getBoundingClientRect()
      if (underlineRef.current) {
        underlineRef.current.style.top = to.bottom + 3 + 'px'
        underlineRef.current.style.width = to.width + 'px'
        if (first) {
          first = false
          underlineRef.current.style.left = to.left + 'px'
        } else {
          underlineRef.current.style.left = from.left + 'px'
          underlineRef.current.style.transform = `translateX(${to.left - from.left}px)`
        }
      }
    }

    if (selected === 'songs') {
      moveUnderline(lessonsRef.current, songsRef.current)
    } else {
      moveUnderline(songsRef.current, lessonsRef.current)
    }
  }, [selected, songsRef, lessonsRef, underlineRef])

  return (
    <>
      <ModalShit
        show={!!selectedSong}
        songMeta={selectedSong}
        onClose={() => {
          setSelectedSong(null)
        }}
        width={Math.min(800, width - 200)}
      />
      <div
        style={{
          position: 'absolute',
          minWidth: '100vw',
          backgroundColor: 'black',
          height: 55,
          left: 0,
          zIndex: -1,
        }}
      ></div>
      <div
        style={{
          height: 55,
          width,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 24 }}>SIGHTREAD</span>
        <div
          style={{
            fontSize: 16,
            paddingLeft: 60,
            width: 350,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Home</span>
          <span>Free Play</span>
          <span>Learn</span>
          <span>About</span>
        </div>
        <span style={{ marginLeft: 'auto', marginRight: 50 }}>Log in / Sign up</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F2F2F2',
          height: 'calc(100vh - 55px)',
          width: '100vw',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: 'calc(100% - 60px)',
            width: 'calc(100% - 100px)',
            maxWidth: 1000,
            margin: '0 auto',
          }}
        >
          <h2 style={{ fontSize: 36, margin: '16px 0' }}>Learn</h2>

          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
            }}
          >
            <span
              ref={songsRef}
              onClick={() => history.push('/')}
              style={selected === 'songs' ? selectedStyle : unselectedStyle}
            >
              Songs
            </span>
            <Sizer width={10} />
            <span
              ref={lessonsRef}
              onClick={() => history.push('/learn/lessons')}
              style={selected === 'lessons' ? selectedStyle : unselectedStyle}
            >
              Lessons
            </span>
            <div
              ref={underlineRef}
              style={{
                position: 'fixed',
                color: '#AE0101',
                borderBottom: '#AE0101 solid 1px',
                transition: '0.25s ease-in-out',
              }}
            />
          </div>
          <Sizer height={20} />
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
              {selected === 'songs' && (
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
                      <div style={{ paddingLeft: i === 0 ? 30 : 0, width: '25%' }}>
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
              {selected === 'lessons' && (
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
                  {selected === 'songs' && (
                    <>
                      <span style={{ paddingLeft: 30, width: '25%' }}>{song.name}</span>
                      <span style={{ width: '25%' }}>{song.artist}</span>
                      <span style={{ width: '25%' }}>{song.difficulty}</span>
                      <span style={{ width: '25%' }}>0:00</span>
                    </>
                  )}
                  {selected === 'lessons' && (
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
    </>
  )
}

function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height, minWidth: width, minHeight: height }} />
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

function ModalShit({ show = true, onClose = () => {}, songMeta = undefined, width = 600 } = {}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [song, setSong] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)
  const { player } = usePlayer()
  const history = useHistory()

  useEffect(() => {
    if (!show) {
      return
    }

    function outsideClickHandler(e: MouseEvent) {
      if (!modalRef.current) {
        return
      }

      if (!modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function escHandler(e: KeyboardEvent) {
      if (!modalRef.current) {
        return
      }
      if (e.key === 'Escape') {
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
    getSong(`/${(songMeta as any).file}`).then((song: Song) => {
      setSong(song)
      player.setSong(song)
      // player.play()
    })
    return () => {
      player.stop()
    }
  }, [songMeta])

  if (!show || !song) {
    return null
  }

  const { file, name } = songMeta as any
  const innerWidth = width - 100

  return (
    <>
      <div
        style={{
          position: 'absolute',
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
          top: '60%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
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
          <i className="fas fa-window-close" style={{ color: '#AE0101', fontSize: 24 }} />
        </button>
        {!playing && (
          <i
            className="fas fa-play"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              fontWeight: 900,
              color: '#B0B0B0',
              fontSize: 69,
              zIndex: 5,
              pointerEvents: 'none',
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
            <SongScrubBar song={song} width={innerWidth} borderRadius={true} />
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
            <PianoRoll width={innerWidth} selectedHand={'both'} />
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
            <span style={{ color: 'gray' }}>0:00</span>
            <button
              style={{
                width: 120,
                backgroundColor: '#AE0101',
                color: 'white',
                height: 40,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 5,
                marginLeft: 'auto',
                fontSize: 22,
              }}
              onClick={() => history.push(`/play/${file}`)}
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

export default SelectSongPage

async function getSong(url: string) {
  if (url.includes('.xml')) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer, url.includes('teachmid'))
}
