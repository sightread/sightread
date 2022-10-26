import { useState, useRef, Children, CSSProperties } from 'react'
import { breakpoints } from '@/utils'
import { Sizer } from '@/components'
import { GithubIcon, Logo, MenuIcon } from '@/icons'
import { css, mediaQuery } from '@sightread/flake'
import { palette } from '@/styles/common'
import Link from 'next/link'
import clsx from 'clsx'
import { useWhenClickedOutside } from '@/hooks'

const classes = css({
  appBar: {
    alignItems: 'baseline',
    [mediaQuery.up(breakpoints.sm + 1)]: {
      marginLeft: 0,
      color: 'white',
      display: 'flex',
      gap: 24,
      flexGrow: '1' as any,
      justifyContent: 'space-evenly',
      whiteSpace: 'nowrap',
    },
  },
  appBarLarge: {
    [mediaQuery.down(breakpoints.sm)]: {
      display: 'none',
    },
  },
  appBarSmall: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: 'min(3vw, 20px)',
    [mediaQuery.up(breakpoints.sm + 1)]: {
      display: 'none',
    },
  },
  navItem: {
    color: 'white',
    textDecoration: 'none',
    fontSize: 16,
    transition: '200ms',
    '&:hover': {
      color: palette.purple.hover,
    },
    '& svg path': {
      transition: '200ms',
    },
    '&:hover svg path': {
      fill: palette.purple.hover,
    },
  },
  navItemSmall: {
    color: palette.purple.dark,
    textDecoration: 'none',
    fontSize: 24,
    padding: '0px 24px',
    transition: '200ms',
    '&:hover': {
      color: palette.orange.primary,
    },
    display: 'inline-block',
  },
  menuIcon: {
    display: 'block',
    fill: 'white',
    cursor: 'pointer',
  },
  githubIcon: {
    position: 'relative',
    top: 2,
    color: 'white',
    '& path': {
      fill: 'white',
    },
  },
})

/**
 * route should be in the form of /route
 * label if given will override the infered label
 * the infered label will in the form Route (with the first / removed)
 */
type NavItem = { route: string; label: string }
const navItems: NavItem[] = [
  { route: '/songs', label: 'Learn a song' },
  { route: '/freeplay', label: 'Free Play' },
  { route: '/about', label: 'About' },
]

interface AppBarProps {
  classNames?: string
  style?: CSSProperties
}
export default function AppBar({ style }: AppBarProps) {
  return (
    <div
      style={{
        // This is a hack that accounts for the sometimes present scrollbar.
        // The 100vw includes scrollbar and the 100% does not, so we padLeft the difference.
        // Credit goes to: https://aykevl.nl/2014/09/fix-jumping-scrollbar
        paddingLeft: 'calc(100vw - 100%)',

        zIndex: 3,
        height: 50,
        minHeight: 50,
        backgroundColor: '#292929',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: `min(100% - 50px, ${breakpoints.lg}px)`,
          justifyContent: 'center',
          margin: '0 auto',
        }}
      >
        <div className={clsx(classes.appBarSmall, classes.appBar)}>
          <Dropdown target={<MenuIcon height={24} width={24} className={classes.menuIcon} />}>
            {navItems.map((nav, i) => {
              return (
                <Link href={nav.route} key={i}>
                  <a className={clsx(classes.navItemSmall)}>{nav.label}</a>
                </Link>
              )
            })}
          </Dropdown>
        </div>

        <Link href={'/'}>
          <a className={clsx(classes.navItem)} style={{ display: 'flex', alignItems: 'baseline' }}>
            <Logo height={24} width={24} style={{ position: 'relative', top: 3 }} />
            <Sizer width={8} />
            <span style={{ fontWeight: 200, fontSize: 24 }}> SIGHTREAD</span>
          </a>
        </Link>
        <div className={clsx(classes.appBarLarge, classes.appBar)}>
          <div />
          <div />
          {navItems.map((nav) => {
            return (
              <Link href={nav.route} key={nav.label}>
                <a className={classes.navItem}>{nav.label}</a>
              </Link>
            )
          })}
          <Link href={'https://github.com/sightread/sightread'}>
            <a
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline' }}
              className={classes.navItem}
            >
              <GithubIcon width={16} height={16} className={clsx(classes.githubIcon)} />
              <Sizer width={6} />
              GitHub
            </a>
          </Link>
          <div />
          <div />
        </div>
      </div>
    </div>
  )
}

/* used in the mobile appbar menu */
function Dropdown({
  children,
  target,
  style,
}: React.PropsWithChildren<{ target: React.ReactElement; style?: CSSProperties }>) {
  const [open, setOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleOpen = () => {
    setOpen(!open)
  }

  useWhenClickedOutside(() => setOpen(false), dropdownRef)

  return (
    <div style={style} ref={dropdownRef}>
      <span onClick={toggleOpen}>{target}</span>
      <div style={{ position: 'relative' }}>
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 8,
            left: 0,
            padding: open ? '10px 0px' : 0,
            height: open ? '' : 0,
            width: 'calc(100vw - 30px)',
            backgroundColor: 'white',
            borderRadius: 8,
            overflow: 'hidden',
            transition: '200ms',
            boxShadow: '0px 0px 10px 0px grey',
          }}
        >
          {Children.map(children, (child) => {
            return (
              <button
                style={{
                  padding: '10px 0px',
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                }}
              >
                {child}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
