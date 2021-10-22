import { Container, Sizer } from '@/utils'
import Link from 'next/link'
import { CheckMarkIcon, BookIcon } from '@/icons'
import { css, mediaQuery } from '@sightread/flake'
import { palette } from '@/styles/common'
import LibrarySVG from './LibrarySVG'
import clsx from 'clsx'

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
  buttonWrapper: {
    [mediaQuery.up(500)]: {
      width: '360px',
    },
    display: 'block',
    textAlign: 'left',
  },
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
export default function LibrarySection() {
  return (
    <Container
      style={{
        textAlign: 'center',
        background:
          'linear-gradient(109.68deg, rgba(112, 41, 251, 0.15) -33.47%, rgba(255, 255, 255, 0.18) 56.36%, rgba(112, 41, 251, 0.15) 154.01%), linear-gradient(106.97deg, #FFFFFF 50.03%, rgba(255, 255, 255, 0) 195.17%), #DACBF9',
      }}
      component="section"
    >
      <Sizer height={72} />
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className={classes.leftSection}>
          <span
            style={{ display: 'flex', alignItems: 'center' }}
            className={classes.leftSectionTitle}
          >
            <BookIcon width={65} height={55} />
            <h2 style={{ marginLeft: '20px', fontSize: '40px' }}>The Library</h2>
          </span>
          <Sizer height={60} />
          <ul className={classes.ul}>
            <li>
              <CheckMarkIcon width={25} height={25} />
              <span>Thousands of songs to choose from</span>
            </li>
            <li>
              <CheckMarkIcon width={25} height={25} />
              <span>Over one hundred instruments</span>
            </li>
            <li>
              <CheckMarkIcon width={25} height={25} />
              <span>Upload your own midi files</span>
            </li>
          </ul>
          <span className={classes.buttonWrapper}>
            <Link href="/songs">
              <a>
                <button
                  className={clsx(classes.buttonBase, classes.orangeButton)}
                  style={{ fontSize: 20, padding: '8px 24px' }}
                >
                  View Library
                </button>
              </a>
            </Link>
          </span>
        </div>
        <div className={classes.rightSection}>{LibrarySVG}</div>
      </div>
    </Container>
  )
}
