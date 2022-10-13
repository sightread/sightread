import { AppBar, Sizer } from '@/components'
import { palette } from '@/styles/common'
import { breakpoints } from '@/utils'
import { css, mediaQuery } from '@sightread/flake'
import Link from 'next/link'
import React from 'react'

const classes = css({
  bannerBigText: {
    [mediaQuery.up(breakpoints.sm)]: {
      fontSize: '4rem',
      fontWeight: 700,
    },
    [mediaQuery.down(breakpoints.sm)]: {
      fontSize: '1.7rem',
    },
  },
  bannerSmallText: {
    [mediaQuery.up(breakpoints.sm)]: {
      fontSize: '1.5rem',
    },
    [mediaQuery.down(breakpoints.sm)]: {
      fontSize: '1rem',
    },
  },
  purpleBtn: {
    backgroundColor: palette.purple.primary,
    color: 'white',
    '&:hover': {
      backgroundColor: palette.purple.dark,
    },
  },
  ghostBtn: {
    backgroundColor: 'white',
    color: palette.purple.primary,
    border: `1px solid ${palette.purple.primary}`,
    '&:hover': {
      backgroundColor: palette.purple.light,
    },
  },
})

export default function LandingPage() {
  return (
    <>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 800,
          color: 'white',
        }}
      >
        <AppBar style={{ backgroundColor: palette.purple.dark }} />
        <div
          style={{
            padding: 32,
            backgroundColor: palette.purple.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // minHeight: 250,
          }}
        >
          <h1 className={classes.bannerBigText}>Your Piano Journey Begins Here</h1>
          <Sizer height={8} />
          <h3 className={classes.bannerSmallText}>
            Learn how to play songs in your browser for free
          </h3>
          <Sizer height={75 + 32} />
        </div>
        <div
          style={{
            height: 400,
            width: '75%',
            maxWidth: 760,
            minWidth: 'min(100%, 400px)',
            // maxWidth: '100%',
            backgroundColor: 'grey',
            alignSelf: 'center',
            marginTop: -75,
            padding: 8,
          }}
        />
        <Sizer height={60} />
        <div
          style={{
            backgroundColor: 'rgba(220, 126, 82, 0.1)',
            marginTop: 'auto',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 24,
            paddingTop: 42,
            gap: 24,
          }}
        >
          <h3 style={{ color: 'black', fontSize: '2rem' }}>Start learning</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href={'/songs'}>
              <a style={{ flex: '1', maxWidth: 200 }}>
                <Button className={classes.purpleBtn}>Learn a song</Button>{' '}
              </a>
            </Link>
            <Link href={'/freeplay'}>
              <a style={{ flex: '1', maxWidth: 200 }}>
                <Button className={classes.ghostBtn}>Freeplay</Button>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function Button({
  children,
  style,
  className,
}: {
  children?: React.ReactChild
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <button
      className={className}
      style={{
        transition: 'background-color 150ms',
        cursor: 'pointer',
        fontSize: '1.5rem',
        padding: '10px 16px',
        borderRadius: 15,
        fontWeight: 700,
        minWidth: 'max-content',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
