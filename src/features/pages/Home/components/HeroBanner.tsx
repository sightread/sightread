import Image from 'next/image'
import { css } from '@sightread/flake'
import clsx from 'clsx'
import { palette } from '@/styles/common'
import { Sizer } from '@/components'
import Link from 'next/link'

const classes = css({
  heroOverlay: {
    zIndex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: palette.purple.primary + 'aa ',
  },
  heroContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    zIndex: 2,
    position: 'absolute',
  },
  heroButton: {
    fontSize: 32,
    padding: '8px 34px',
  },
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
})

export default function HeroBanner() {
  return (
    <div style={{ minHeight: '600px', position: 'relative' }}>
      <div className={classes.heroOverlay}></div>
      <Image priority src="/images/piano_keys_close.jpg" layout="fill" alt="A Piano" />
      <div className={classes.heroContent}>
        <h1 style={{ fontSize: 48, textAlign: 'center' }}>Learn to play piano</h1>
        <Sizer height={42} />
        <p style={{ fontSize: 24, width: 280, textAlign: 'center' }}>
          You bring the keyboard, and we bring everything else.
        </p>
        <Sizer height={50} />
        <Link href="/songs">
          <a>
            <button className={clsx(classes.orangeButton, classes.buttonBase, classes.heroButton)}>
              Launch
            </button>
          </a>
        </Link>
      </div>
    </div>
  )
}
