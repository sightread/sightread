import React, { useState } from 'react'
import './App.css'
import './SelectSong.css'
import { useHistory } from 'react-router-dom'
import { songs, lessons } from './songdata'
import { useWindowSize } from './hooks'

function SelectSongPage() {
  const { width, height } = useWindowSize()
  const history = useHistory()
  const [search, saveSearch] = useState()

  const songContainsWord = (songData: any, searchWord: string) => {
    return Object.values(songData).some((value: any) =>
      value.toLowerCase().includes(searchWord.toLowerCase()),
    )
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
        }}
      ></div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F2F2F2',
          height: 'calc(100vh - 55px)',
          width: '100vw',
        }}
      >
        <div style={{ position: 'relative', left: 50, width: 'calc(100% - 100px)' }}>
          <h2 style={{ fontSize: 36, marginTop: 8, marginBottom: 30 }}>Learn</h2>

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
            <span style={{ color: '#AE0101', textDecoration: 'underline' }}>Songs</span>{' '}
            <span>Lessons</span>
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
              maxHeight: 500,
              overflowY: 'scroll',
              overflowX: 'hidden',
              backgroundColor: '#FFF',
              boxShadow: `0px 0px 5px rgba(0, 0, 0, 0.2)`,
              borderRadius: 5,
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                height: 30,
                fontWeight: 600,
                color: '#AE0101',
                backgroundColor: '#F1F1F1',
                flexShrink: 0,
              }}
            >
              <span style={{ paddingLeft: 30, width: '25%' }}>TITLE</span>
              <span style={{ width: '25%' }}>ARTIST</span>
              <span style={{ width: '25%' }}>DIFFICULTY</span>
              <span style={{ width: '25%' }}>LENGTH</span>
            </div>
            {songs.map((song) => (
              <div
                onDoubleClick={() => history.push(`/play/${song.file}`)}
                style={{
                  height: 35,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                className="SelectSongPage__song"
              >
                <span style={{ paddingLeft: 30, width: '25%' }}>{song.name}</span>
                <span style={{ width: '25%' }}>{song.artist}</span>
                <span style={{ width: '25%' }}>{song.difficulty}</span>
                <span style={{ width: '25%' }}>0:00</span>
              </div>
            ))}
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
        onClick={(e: any) => onSearch(e.target.value)}
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
