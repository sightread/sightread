import * as React from 'react'
import { CenteringWrapper, Sizer } from '../utils'
import { css } from '../flakecss'
import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '../icons'

const DARKER_PURPLE = '#5F18EA' // header.
const PURPLE = '#7029FB'
const classes = css({
  appBar: {
    height: 60,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  heroContent: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  heroTextWrapper: {
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  heroImageWrapper: {
    width: 600,
    minHeight: 370,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: 500,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0px 6px 13px 8px rgba(0, 0, 0, 0.25)',
  },
  launchButton: {
    color: PURPLE,
    backgroundColor: 'white',
    borderRadius: 15,
    height: 50,
    width: 120,
    filter: 'drop-shadow(1px 7px 11px rgba(0, 0, 0, 0.25))',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: 20,
    border: '2px solid transparent',
    transition: '150ms',
    '&:hover': {
      backgroundColor: 'transparent !important',
      borderColor: 'white !important',
      color: 'white',
    },
  },
  featureImageWrapper: {
    minHeight: 217,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

function LandingPage() {
  return (
    <div>
      <CenteringWrapper backgroundColor={DARKER_PURPLE}>
        <div className={classes.appBar}>
          <Logo />
          <Sizer width={16} />
          <span style={{ fontWeight: 200, fontSize: 24, letterSpacing: 1 }}>SIGHTREAD</span>
        </div>
      </CenteringWrapper>
      <CenteringWrapper backgroundColor={PURPLE}>
        <Sizer height={48} />
        <div className={classes.heroContent}>
          <div className={classes.heroTextWrapper}>
            <h1 style={{ fontSize: 48, color: '#EEEEEE' }}>Learn to play piano.</h1>
            <Sizer height={16} />
            <h2 style={{ fontSize: 36, color: '#EEEEEE' }}>No install necessary</h2>
            <Sizer height={32} />
            <Link href="/songs">
              <a>
                <button className={classes.launchButton}>Launch</button>
              </a>
            </Link>
            <Sizer height={32} />
          </div>
          <div className={classes.heroImageWrapper}>
            <div className={classes.heroImage}>
              <Image priority src="/images/hero.png" height={310} width={500} />
            </div>
            <Sizer height={32} />
          </div>
        </div>
      </CenteringWrapper>
      <CenteringWrapper>
        <Sizer height={48} />

        <div
          style={{
            textAlign: 'center',
            maxWidth: 383,
            margin: 'auto',
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 500 }}>Features you'll love</h2>
          <Sizer height={16} />
          <p style={{ fontSize: 18 }}>
            Sightread is jam packed with features to help you learn how to play Piano.
          </p>
          <Sizer height={48} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ marginLeft: 8, marginRight: 8, width: 300 }}>
            <span className={classes.featureImageWrapper}>
              <Image src="/images/sheet.png" width={217} height={154} alt="sheet music" />
            </span>
            <Sizer height={16} />
            <div style={{ width: 230, margin: 'auto' }}>
              <h3 style={{ fontSize: 24, fontWeight: 500, color: DARKER_PURPLE }}>
                Sheet music display
              </h3>
              <Sizer height={16} />
              <p style={{ fontSize: 18, lineHeight: '21px' }}>
                Sightread can display notes in a simplified sheet music format, to help you learn
                the notes.
              </p>
            </div>
            <Sizer height={16} />
          </div>
          <div style={{ marginLeft: 8, marginRight: 8, width: 300 }}>
            <span className={classes.featureImageWrapper}>
              <Image src="/images/keyboard.png" width={217} height={217} alt="key board" />
            </span>
            <Sizer height={16} />
            <div style={{ width: 260, margin: 'auto' }}>
              <h3 style={{ fontSize: 24, fontWeight: 500, color: DARKER_PURPLE }}>
                MIDI Keyboard Support
              </h3>
              <Sizer height={16} />
              <p style={{ fontSize: 18, lineHeight: '21px' }}>
                Bring your own MIDI Piano! Connect it to your device via either USB or Bluetooth.
              </p>
            </div>
            <Sizer height={16} />
          </div>
          <div style={{ height: 300, marginLeft: 8, marginRight: 8, width: 300 }}>
            <span className={classes.featureImageWrapper}>
              <Image
                src="/images/uparrow.png"
                width={217}
                height={217}
                alt="gradual progress arrow"
              />
            </span>
            <Sizer height={16} />

            <div style={{ width: 231, margin: 'auto' }}>
              <h3 style={{ fontSize: 24, fontWeight: 500, color: DARKER_PURPLE }}>
                Gradual progression
              </h3>
              <Sizer height={16} />
              <p style={{ fontSize: 18, lineHeight: '21px' }}>
                Sightread was specifically designed to have a gradual difficulty progression, so
                you’re always having fun while learning.
              </p>
            </div>
          </div>
        </div>
        <Sizer height={180} />
      </CenteringWrapper>
    </div>
  )
}

export default LandingPage
