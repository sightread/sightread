import * as React from 'react'
import { useState } from 'react'
import { Container, Sizer } from 'src/utils'
import { SelectSongModal, SelectSongTable } from 'src/features/SelectSongPage'
import { AppBar } from 'src/components'

import songManifest from 'src/manifest.json'

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
      <AppBar />
      <Container style={{ backgroundColor: '#F2F2F2', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
          <Sizer height={24} />
          <h2 style={{ fontSize: 36, fontWeight: 200 }}>Lessons</h2>
          <Sizer height={24} />
          <SelectSongTable
            columns={[
              { label: 'Lesson', id: 'lesson', keep: true },
              { label: 'Title', id: 'name', keep: true },
              {
                label: 'Difficulty',
                id: 'difficulty',
                format: (v: any) => 'Easy',
              },
            ]}
            rows={lessons}
            filter={['name'] as any}
            onSelectRow={setSelectedSong}
          />
          <Sizer height={60} />
        </div>
      </Container>
    </>
  )
}
