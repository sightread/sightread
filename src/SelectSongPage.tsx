import React, { useState } from 'react'
import './SelectSong.css'
import { useHistory } from 'react-router-dom'
import { songs, lessons } from './songdata'
import { useWindowSize } from './hooks'

// TODO: make lessons / songs at diff urls
function SelectSongPage() {
  const { width, height } = useWindowSize()
  const [sortCol, setSortCol] = useState<number>(0)
  const history = useHistory()
  const [search, saveSearch] = useState('')
  const selected = window.location.pathname.includes('lesson') ? 'lessons' : 'songs'

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

  const selectedStyle = {
    color: '#AE0101',
    marginBottom: -3, // -3 -2 + 1 === 0
    paddingBottom: 2,
    borderBottom: '#AE0101 solid 1px',
  }

  const unselectedStyle = {
    cursor: 'pointer',
  }

  return (
    <>
      <div
        id="topbar"
        style={{
          height: 55,
          width,
          zIndex: 2,
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 24, marginLeft: 50 }}>SIGHTREAD</span>
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
            left: 50,
            width: 'calc(100% - 100px)',
          }}
        >
          <h2 style={{ fontSize: 36, margin: '16px 0' }}>Learn</h2>

          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              width: 110,
              display: 'flex',
              flexBasis: 0,
              justifyContent: 'space-between',
            }}
          >
            <span
              onClick={() => history.push('/')}
              style={selected === 'songs' ? selectedStyle : unselectedStyle}
            >
              Songs
            </span>
            <span
              onClick={() => history.push('/learn/lessons')}
              style={selected === 'lessons' ? selectedStyle : unselectedStyle}
            >
              Lessons
            </span>
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
                      <div style={{ paddingLeft: 30, width: '25%' }}>
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
                  onDoubleClick={() => history.push(`/play/${song.file}`)}
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
  return <div style={{ width, height }} />
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

export default SelectSongPage
