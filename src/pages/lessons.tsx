import * as React from 'react'
import { useState } from 'react'
import { Container, Sizer } from '../utils'
import { SelectSongModal, SelectSongTable } from '../SelectSongPage'
import AppBar from 'src/components/AppBar'

import songManifest from '../manifest.json'

const lessons = songManifest.filter((s) => s.type === 'lesson')
const APP_MAX_WIDTH = 'md'

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
      <AppBar />
      <Container style={{ backgroundColor: '#F2F2F2', padding: '0 24px' }}>
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
      </Container>
    </>
  )
}
