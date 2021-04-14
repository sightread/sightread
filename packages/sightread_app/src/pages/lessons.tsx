import * as React from 'react'
import { useState } from 'react'
import { CenteringWrapper, Sizer } from '../utils'
import { AppBar, SelectSongModal, SelectSongTable } from '../SelectSongPage'
import songManifest from '../manifest.json'

const lessons = songManifest.filter((s) => s.type === 'lesson')

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
          <Sizer height={64} />
          <h2 style={{ fontSize: 36, fontWeight: 200 }}>Lessons</h2>
          <SelectSongTable
            columns={[
              { label: 'Lesson', id: 'lesson', style: { width: '15%' } },
              { label: 'Title', id: 'name', style: { width: '50%' } },
              {
                label: 'Difficulty',
                id: 'difficulty',
                style: { width: '33%' },
                format: (v) => 'Easy',
              },
            ]}
            rows={lessons}
            filter={['name'] as any}
            onSelectRow={setSelectedSong}
          />
        </div>
      </CenteringWrapper>
    </>
  )
}
