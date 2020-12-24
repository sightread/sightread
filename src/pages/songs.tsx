import * as React from 'react'
import { useState } from 'react'
import { CenteringWrapper, formatTime, Sizer } from '../utils'
import { AppBar, SelectSongModal, SelectSongTable } from '../SelectSongPage'
import songManifest from '../manifest.json'

const songs = songManifest.filter((s) => s.type === 'song')

export default function SelectLessonPage() {
  const [selectedSong, setSelectedSong] = useState<any>('')

  return (
    <>
      <SelectSongModal
        show={!!selectedSong}
        songMeta={selectedSong}
        onClose={() => {
          setSelectedSong(null)
        }}
      />
      <CenteringWrapper backgroundColor={'#292929'}>
        <AppBar height={60} />
      </CenteringWrapper>
      <CenteringWrapper backgroundColor={'#F2F2F2'} verticalGutter={60}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
          <Sizer height={24} />
          <h2 style={{ fontSize: 36, fontWeight: 200 }}>Songs</h2>
          <SelectSongTable
            columns={[
              { label: 'Title', id: 'name' },
              { label: 'Artist', id: 'artist' },
              { label: 'Difficult', id: 'difficulty', format: (v) => 'Easy' },
              { label: 'Length', id: 'duration', format: formatTime },
            ]}
            rows={songs}
            filter={['name', 'artist'] as any}
            onSelectRow={setSelectedSong}
          />
        </div>
      </CenteringWrapper>
    </>
  )
}
