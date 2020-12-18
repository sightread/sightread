import * as React from 'react'
import { Sizer, Logo } from '../utils'
import Link from 'next/link'

function AppBar({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        maxWidth: 1024,
        margin: '0 auto',
      }}
    >
      <Logo />
      <Sizer width={16} />
      <span style={{ fontWeight: 500, fontSize: 24 }}>SIGHTREAD</span>
      <Sizer width={60} />
      <div
        style={{
          fontSize: 16,
          width: 400,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/freeplay">
          <a style={{ color: 'white', textDecoration: 'none' }}>Free Play</a>
        </Link>
        <Link href="/songs">
          <a style={{ color: 'white', textDecoration: 'none' }}>Songs</a>
        </Link>
        <Link href="/lessons">
          <a style={{ color: 'white', textDecoration: 'none' }}>Lessons</a>
        </Link>
        <span>About</span>
      </div>
      <span style={{ marginLeft: 'auto', marginRight: 50 }}>Log in / Sign up</span>
    </div>
  )
}

export default AppBar
