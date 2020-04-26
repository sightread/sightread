import React, { useState } from 'react'
import './App.css'
import './SelectSong.css'
import { parseMusicXML, Song, parseMidi } from './utils'
import { useHistory } from 'react-router-dom'

const headers = [
  { label: 'Title', id: 'title', align: 'left' },
  // { label: "Artist", id: "artist" },
  // { label: "difficulty", id: "difficulty" },
]

const exampleData = [
  {
    title: 'Fur Elise',
    location: '/music/3.1.a.Fur_Elise.xml',
  },
  {
    title: 'Canon rock',
    location: '/music/Canon_Rock.xml',
  },
  {
    title: 'Game of Thrones theme',
    location: '/music/GoT.xml',
  },
  {
    title: 'Lose Yourself',
    location: '/music/lose-yourself.xml',
  },
  {
    title: 'One Final Effort - MIDI',
    location: '/music/Halo-One-Final-Effort-altered.mid',
  },
]

function SelectSong({ handleSelect }: any) {
  const [search, setSearch] = useState('')
  const history = useHistory()

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value)
  }
  const songContainsWord = (songData: any, searchWord: string) => {
    return Object.values(songData).some((value: any) =>
      value.toLowerCase().includes(searchWord.toLowerCase()),
    )
  }

  const cellStyle: React.CSSProperties = {
    textAlign: 'left',
    color: 'white',
    width: `${100 / headers.length + 1}%`,
  }
  return (
    <div
      className="SelectSong"
      style={{ padding: '5vh 5vw', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex' }}>
        <span className="tableHeader" style={{ ...cellStyle }}>
          Title
        </span>
        <input
          className="searchInput"
          placeholder="Search"
          value={search}
          onChange={handleInput}
          type="text"
        />
      </div>
      <div className="tableContent">
        {exampleData
          .filter((song: any) => {
            return search === '' || songContainsWord(song, search)
          })
          .map((song: any) => {
            return (
              <div
                key={song.location}
                className="tableRow"
                onClick={() => {
                  getSong(song.location).then((song: Song) => {
                    handleSelect(song)
                    history.push('/play')
                  })
                }}
              >
                {headers.map((header, i) => {
                  return (
                    <div key={i} style={{ ...cellStyle }}>
                      {song[header.id]}
                    </div>
                  )
                })}
                <div style={{ ...cellStyle }}></div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

async function getSong(url: string) {
  if (url.includes('.xml')) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer)
}
export default SelectSong
