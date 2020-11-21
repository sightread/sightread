import React from 'react'
import { Logo, Sizer } from './utils'
import { useHistory } from 'react-router-dom'

const PURPLE = '#5A4EDF'
function LandingPage() {
  const history = useHistory()
  return (
    <div>
      <CenteringWrapper backgroundColor={'#4C41CC'}>
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
            <LaunchButton onClick={() => history.push('/learn')} />
            <Sizer height={32} />
          </div>
          <div>
            <img
              src="/images/hero.png"
              height={372}
              style={{
                width: 600,
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 10,
                boxShadow: '0px 6px 13px 8px rgba(0, 0, 0, 0.25)',
              }}
            />
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
            <div style={{ height: 217 }}>
              <img src="/images/sheet.png" style={{ maxWidth: 250, height: 177 }} />
            </div>
            <Sizer height={16} />
            <h3 style={{ fontSize: 24, fontWeight: 300, color: PURPLE }}>Sheet music display</h3>
            <Sizer height={16} />
            <p style={{ fontSize: 18, lineHeight: '21px' }}>
              Sightread can display notes in a simplified sheet music format, to help you learn the
              notes.
            </p>
            <Sizer height={16} />
          </div>
          <div style={{ marginLeft: 8, marginRight: 8, width: 250 }}>
            <img
              src="/images/keyboard.png"
              style={{ maxWidth: 250, marginTop: -35, height: 250 }}
            />
            <Sizer height={16} />
            <h3 style={{ fontSize: 24, fontWeight: 300, color: PURPLE }}>MIDI Keyboard Support</h3>
            <Sizer height={16} />
            <p style={{ fontSize: 18, lineHeight: '21px' }}>
              Bring your own MIDI Piano! Connect it to your device via either USB or Bluetooth.
            </p>
            <Sizer height={16} />
          </div>
          <div style={{ height: 300, marginLeft: 8, marginRight: 8, width: 250 }}>
            <img src="/images/uparrow.png" style={{ maxWidth: 250, marginTop: -35, height: 250 }} />
            <Sizer height={16} />
            <h3 style={{ fontSize: 24, fontWeight: 300, color: PURPLE }}>Gradual progression</h3>
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

function LaunchButton({ onClick }: any) {
  return (
    <div
      style={{
        color: PURPLE,
        backgroundColor: 'white',
        borderRadius: 15,
        height: 40,
        lineHeight: '40px',
        width: 100,
        filter: 'drop-shadow(1px 7px 11px rgba(0, 0, 0, 0.25))',
        textAlign: 'center',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      Launch
    </div>
  )
}

function CenteringWrapper({ children, backgroundColor = 'white', gutterWidth = 50 }: any) {
  return (
    <>
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor,
            zIndex: -1,
          }}
        />
        <div
          style={{
            width: `calc(100vw - ${gutterWidth * 2}px)`,
            alignItems: 'center',
            maxWidth: 1024,
            margin: '0 auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}

export default LandingPage
