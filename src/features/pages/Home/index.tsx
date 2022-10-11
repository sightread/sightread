import { AppBar, Sizer } from '@/components'
import { palette } from '@/styles/common'
import { css, mediaQuery } from '@sightread/flake'
import Link from 'next/link'
import React from 'react'
import PianoSvg from './components/PianoSvg'
import WhySightreadSection from './components/WhySightreadSection'

const classes = css({
  bigText: {
    [mediaQuery.up(447)]: {
      fontSize: '2rem',
    },
    [mediaQuery.down(446)]: {
      fontSize: '1.3rem !important',
    },
  },
  smallText: {
    [mediaQuery.up(447)]: {
      fontSize: '1.3rem',
    },
    [mediaQuery.down(446)]: {
      fontSize: '1rem !important',
    },
  },
  cta: {
    filter: 'drop-shadow(1px 7px 11px rgba(0, 0, 0, 0.25))',
    borderRadius: '15px',
    color: 'white',
    height: 50,
    width: 320,
    maxWidth: '75%',
    background: 'hsl(18deg 100% 57%)',
    cursor: 'pointer',
    ['&:hover']: {
      background: 'hsl(18deg 100% 67%)',
    },
  },
})

function SqugglySvg({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={{ height: '100%', width: '100%' }}
      viewBox="0 0 1512 522"
      preserveAspectRatio="none"
    >
      <path
        d="M0 -2H1512V213.46C1512 363.223 1370.63 472.693 1225.64 435.212C1171.69 421.268 1115.61 417.594 1060.31 424.381L951.895 437.687C918.404 441.798 885.478 449.646 853.733 461.085L746.98 499.551C675.686 525.24 598.261 528.619 525 509.236L323.5 443.873L109.5 398.703C45.6749 385.232 0 328.91 0 263.678V-2Z"
        fill={palette.purple.primary}
      />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '800px',
        color: 'white',
      }}
    >
      <div style={{ position: 'relative', height: '50%' }}>
        <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
          <SqugglySvg style={{ position: 'absolute' }} />
          <PianoSvg
            style={{
              position: 'absolute',
              bottom: 0,
              width: 345,
              maxWidth: '75%',
              left: '50%',
              transform: 'translateX(-50%) translateY(30%)',
            }}
          />
        </div>
        <div style={{ position: 'relative', padding: 8 }}>
          <Sizer height={64} />
          <div
            style={{
              margin: '0 auto',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h1
              className={classes.bigText}
              style={{
                fontWeight: 700,
                textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              }}
            >
              Your Piano Journey Begins Here
            </h1>
            <Sizer height={8} />
            <h2 className={classes.smallText} style={{ fontWeight: 300 }}>
              A Free Open Source Synthesia-Clone
            </h2>
            <Sizer height={24} />
            <Link href={'/songs'}>
              <button className={`${classes.smallText} ${classes.cta}`}>
                Select a Song + Start Learning
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Sizer height={120} />
      <div style={{ paddingLeft: 60, paddingRight: 60 }}>
        <WhySightreadSection />
      </div>
      <Sizer height={16} />
    </div>
  )
}
