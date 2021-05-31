import * as React from 'react'
import { useState } from 'react'
import { CenteringWrapper, Sizer, Container } from '../utils'
import { SelectSongModal, SelectSongTable } from '../SelectSongPage'
import songManifest from '../manifest.json'
import AppBar from '../components/AppBar'
import { css } from '@sightread/flake'

const lessons = songManifest.filter((s) => s.type === 'lesson')
const classes = css({
  appBarContainer: {
    backgroundColor: 'black',
    padding: '15px 30px',
    width: '100%',
  },
})

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
      <Container
        maxWidth="md"
        className={classes.appBarContainer}
        style={{ position: 'fixed', top: 0, zIndex: 12, height: 60, backgroundColor: '#292929' }}
      >
        <AppBar current="/songs" />
      </Container>
      {/* div b/c app bar is fixed, so push everything else down */}
      <div style={{ padding: 30 }}></div>
      <Container maxWidth="sm" style={{ padding: '0 20px', backgroundColor: '#F2F2F2' }}>
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
            smallLayout={{
              primary: 'name',
              secondary: 'difficulty',
            }}
            rows={lessons}
            filter={['name'] as any}
            onSelectRow={setSelectedSong}
          />
        </div>
      </Container>
    </>
  )
}
