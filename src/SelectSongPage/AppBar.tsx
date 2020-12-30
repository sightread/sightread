import * as React from 'react'
import { Sizer } from '../utils'
import Link from 'next/link'
import { css } from '../flakecss'
import { Logo } from '../icons'

const styles = css({
  navLink: {
    color: 'white',
    textDecoration: 'none',
    '&:hover': {
      color: 'rgba(255,255,255,0.7)',
    },
  },
})
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
      <Link href="/">
        <a
          style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        >
          <Logo />
          <Sizer width={16} />
          <span style={{ fontWeight: 500, fontSize: 24 }}>SIGHTREAD</span>
          <Sizer width={60} />
        </a>
      </Link>
      <div
        style={{
          fontSize: 16,
          width: 400,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <NavLink href="/freeplay">Free Play</NavLink>
        <NavLink href="/songs">Songs</NavLink>
        <NavLink href="/lessons">Lessons</NavLink>
        <NavLink href="/about">About</NavLink>
      </div>
    </div>
  )
}

function NavLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href}>
      <a className={styles.navLink}>{children}</a>
    </Link>
  )
}

export default AppBar
