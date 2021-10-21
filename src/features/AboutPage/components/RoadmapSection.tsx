import { Sizer } from '@/utils'
import { css } from '@sightread/flake'
import RoadMapSVG from './RoadmapSVG'
import { centerAll } from './styles'

const classes = css({
  roadmapList: {
    listStyleType: 'square',
    maxWidth: 720,
    fontSize: 20,
    padding: '0px 25px',
    '& li': {
      marginBottom: 12,
    },
  },
})

export default function RoadmapSection() {
  return (
    <>
      <section>
        <div style={centerAll}>
          <h2 style={{ fontSize: 48 }}> Roadmap</h2>
          <RoadMapSVG height={100} width={150} style={{ margin: '16px 48px' }} />
        </div>
        <Sizer height={24} />
        <div>
          <ul className={classes.roadmapList}>
            <li>
              Difficulty adjustment of songs based on user input. For example: adjust max number of
              notes to play a chord, and minimum time between notes.
            </li>
            <Sizer height={20} />
            <li>Expand free play mode with looping and song sharing</li>
            <Sizer height={20} />
            <li>Expand lessons with more instructional components</li>
            <Sizer height={20} />
            <li>
              Ability to create an account in order to access personal progress tracking and
              leaderboard stats
            </li>
            <Sizer height={20} />
            <li>
              Addition play mode with a small currated list of songs to play in order and must
              achieve a certain accuracy percent before playing next song.
            </li>
            <Sizer height={20} />
          </ul>
        </div>
      </section>
    </>
  )
}
