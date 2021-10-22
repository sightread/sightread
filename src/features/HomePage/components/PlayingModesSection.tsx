import { Sizer, Container } from '@/utils'
import Image from 'next/image'
import { CheckMarkIcon, MusicListIcon } from '@/icons'
import { css, mediaQuery } from '@sightread/flake'

const classes = css({
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingBottom: '72px',
    [mediaQuery.up(901)]: {
      width: '50%',
    },
    [mediaQuery.down(900)]: {
      width: '100%',
      padding: '0px 15px',
    },
  },
  leftSectionTitle: {
    [mediaQuery.up(900)]: {
      width: '360px',
    },
    [mediaQuery.down(600)]: {
      width: '100%',
      justifyContent: 'center',
    },
  },
  rightSection: {
    [mediaQuery.up(901)]: {
      width: '50%',
    },
    [mediaQuery.down(900)]: {
      width: '100%',
    },
  },
  ul: {
    [mediaQuery.up(400)]: {
      width: 380,
    },
    '& li': {
      listStyleType: 'none',
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'flex-start',
    },
    '& li span': { marginLeft: '10px', fontSize: '22px', marginTop: '2px' },
  },
})

export default function PlayModesSection() {
  return (
    <Container
      style={{
        textAlign: 'center',
      }}
      component="section"
    >
      <Sizer height={60} />
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className={classes.leftSection} style={{ paddingTop: 20 }}>
          <span
            style={{ display: 'flex', alignItems: 'center' }}
            className={classes.leftSectionTitle}
          >
            <MusicListIcon width={65} height={55} />
            <h2 style={{ marginLeft: '20px', fontSize: '40px' }}>Playing Modes</h2>
          </span>
          <Sizer height={60} />
          <ul className={classes.ul}>
            <li>
              <CheckMarkIcon width={40} height={35} />
              <span>Play a song as sheet music or falling notes colored by hand</span>
            </li>
            <li>
              <CheckMarkIcon width={25} height={25} />
              <span>Free play with any instrument</span>
            </li>
          </ul>
        </div>
        <div className={classes.rightSection} style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              width: '100%',
              height: '100%',
              maxWidth: 420,
              maxHeight: 300,
              boxShadow: '0px 0px 15px 0px lightgrey',
            }}
          >
            <Image
              src="/images/falling_notes.PNG"
              width={420}
              height={300}
              alt="Falling notes example."
            />
          </div>
        </div>
      </div>
      <Sizer height={50} />
    </Container>
  )
}
