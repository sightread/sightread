import * as React from 'react'
import { CenteringWrapper, Logo, Sizer } from '../utils'
import { css } from '../flakecss'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'

const DARKER_PURPLE = '#5F18EA' // header.
const PURPLE = '#7029FB'

function LandingPage() {
  return (
    <div>
      <CenteringWrapper backgroundColor={DARKER_PURPLE}>
        <div
          style={{
            height: 60,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Logo />
          <Sizer width={16} />
          <span style={{ fontWeight: 200, fontSize: 24, letterSpacing: 1 }}>SIGHTREAD</span>
        </div>
      </CenteringWrapper>
      <CenteringWrapper backgroundColor={PURPLE}>
        <Sizer height={48} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: 48, color: '#EEEEEE' }}>Learn to play piano.</h1>
            <Sizer height={16} />
            <h2 style={{ fontSize: 36, color: '#EEEEEE' }}>No install necessary</h2>
            <Sizer height={32} />
            <LaunchButton href="/songs" />
            <Sizer height={32} />
          </div>
          <div>
            <div
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 10,
                boxShadow: '0px 6px 13px 8px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Image priority src="/images/hero.png" height={372} width={600} />
            </div>
            <Sizer height={32} />
          </div>
        </div>
      </CenteringWrapper>
      <CenteringWrapper>
        <Sizer height={48} />
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: '100%', marginRight: 15 }}>
            <h2 style={{ fontSize: 32 }}>Features you'll love</h2>
            <Sizer height={16} />
            <p style={{ fontSize: 18 }}>
              Sightread is jam packed with features to help you learn how to play Piano.
            </p>
            <Sizer height={48} />
          </div>
          <div style={{ marginLeft: 8, marginRight: 8, width: 250 }}>
            <div style={{ position: 'relative', height: 250 }}>
              <Image src="/images/sheet.png" width={250} height={217} />
            </div>
            <Sizer height={16} />
            <h3 style={{ fontSize: 24, fontWeight: 300, color: DARKER_PURPLE }}>
              Sheet music display
            </h3>
            <Sizer height={16} />
            <p style={{ fontSize: 18, lineHeight: '21px' }}>
              Sightread can display notes in a simplified sheet music format, to help you learn the
              notes.
            </p>
            <Sizer height={16} />
          </div>
          <div style={{ marginLeft: 8, marginRight: 8, width: 250 }}>
            <div style={{ position: 'relative', width: 250, height: 250 }}>
              <Image src="/images/keyboard.png" layout="fill" />
            </div>
            <Sizer height={16} />
            <h3 style={{ fontSize: 24, fontWeight: 300, color: DARKER_PURPLE }}>
              MIDI Keyboard Support
            </h3>
            <Sizer height={16} />
            <p style={{ fontSize: 18, lineHeight: '21px' }}>
              Bring your own MIDI Piano! Connect it to your device via either USB or Bluetooth.
            </p>
            <Sizer height={16} />
          </div>
          <div style={{ height: 300, marginLeft: 8, marginRight: 8, width: 250 }}>
            <div style={{ position: 'relative', width: 250, height: 250 }}>
              <Image src="/images/uparrow.png" layout="fill" />
            </div>
            <Sizer height={16} />
            <h3 style={{ fontSize: 24, fontWeight: 300, color: DARKER_PURPLE }}>
              Gradual progression
            </h3>
            <Sizer height={16} />
            <p style={{ fontSize: 18, lineHeight: '21px' }}>
              Sightread was specifically designed to have a gradual difficulty progression, so
              you’re always having fun while learning.
            </p>
          </div>
        </div>
        <Sizer height={250} />
      </CenteringWrapper>
    </div>
  )
}

function LaunchButton({ href }: any) {
  css(
    {
      '.launchbutton': {
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
      },
      '.launchbutton:hover': {
        backgroundColor: 'transparent !important',
        borderColor: 'white !important',
        color: 'white',
      },
    },
    'LandingPage.LaunchButton',
  )
  return (
    <Link href={href}>
      <a>
        <button className="launchbutton">Launch</button>
      </a>
    </Link>
  )
}

export default LandingPage
