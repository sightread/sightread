import { Container, Sizer } from '@/components'
import { palette } from '@/styles/common'
import { css, mediaQuery } from '@sightread/flake'
import clsx from 'clsx'
import Link from 'next/link'

const classes = css({
  buttonBase: {
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
    filter: 'drop-shadow(1px 7px 11px rgba(0, 0, 0, 0.25))',
  },
  orangeButton: {
    color: 'white',
    backgroundColor: palette.orange.primary,
    transition: '150ms',
    border: 'none',
    '&:hover': {
      backgroundColor: palette.orange.dark,
    },
  },
  toolsCard: {
    borderRadius: 8,
    width: 350,
    height: 170,
    padding: 24,
    textAlign: 'left',
    border: '2px solid lightgrey',
    boxSizing: 'border-box',
    transition: '300ms',
    [mediaQuery.up(401)]: {
      margin: '24px 0px 24px 24px',
    },
    [mediaQuery.down(400)]: {
      margin: '24px 0px',
    },
    '& h3': {
      fontSize: 24,
    },
    '& p': {
      fontSize: 18,
      color: 'lightgrey',
      transition: '300ms',
    },
    '&:hover': {
      backgroundColor: 'white',
      boxShadow: '1px 3px 8px 1px lightgrey',
    },
    '&:hover p': {
      color: 'black',
    },
  },
})
const toolsForLearning = [
  {
    title: 'Repeat Section',
    text: 'While playing a song select a range to repeat so you can focus on small pieces at a time.',
  },
  {
    title: 'Wait',
    text: 'While playing a song on wait mode. This forces the song to wait for you to play the correct chords before continuing.',
  },
  {
    title: 'Adjust BPM',
    text: "Choose a lower BPM if you're a beginner, or faster if you're looking for a challenge.",
  },
]

export default function ToolsForLearningSection() {
  return (
    <Container
      style={{
        textAlign: 'center',
        background:
          'linear-gradient(252.43deg, #FF6825 -35.81%, rgba(255, 255, 255, 0.18) 44.97%, rgba(112, 41, 251, 0.15) 132.77%), linear-gradient(106.97deg, #FFFFFF 50.03%, rgba(255, 255, 255, 0) 195.17%), #DACBF9',
      }}
      component="section"
    >
      <Sizer height={60} />
      <h2 style={{ fontSize: 40 }}>Tools for Learning</h2>
      <Sizer height={8} />
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {toolsForLearning.map((section, i) => {
          return (
            <div className={classes.toolsCard} key={i}>
              <h3>{section.title}</h3>
              <Sizer height={20} />
              <p>{section.text}</p>
            </div>
          )
        })}
      </div>
      <Sizer height={20} />
      <Link href="/songs">
        <a>
          <button
            className={clsx(classes.buttonBase, classes.orangeButton)}
            style={{ fontSize: 20, padding: '8px 24px' }}
          >
            Launch
          </button>
        </a>
      </Link>
      <Sizer height={40} />
    </Container>
  )
}
