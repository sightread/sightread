import { useState, useRef, Children, CSSProperties } from 'react'
import { Container, Sizer } from '../utils'
import { Logo, MenuIcon } from '../icons'
import { css, mediaQuery } from '@sightread/flake'
import { palette } from '../styles/common'
import Link from 'next/link'
import clsx from 'clsx'

const classes = css({
  appBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    color: 'white',
  },
  appBarLarge: {
    [mediaQuery.down(910)]: {
      display: 'none',
    },
  },
  appBarSmall: {
    [mediaQuery.up(911)]: {
      display: 'none',
    },
  },
  navItem: {
    color: 'white',
    textDecoration: 'none',
    fontSize: 24,
    padding: '0px 24px',
    transition: '200ms',
    '&:hover': {
      color: palette.purple.hover,
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
    boxSizing: 'border-box',
  },
  menuIcon: {
    fill: 'white',
    cursor: 'pointer',
  },
})

function inferLabel(navItem: NavItem) {
  if (navItem.label) {
    return navItem.label
  }
  const href = navItem.route
  return href.charAt(1).toUpperCase() + href.slice(2)
}

type Classes = {
  appBar?: {
    sm?: string
    lg?: string
  }
  navItem?: {
    sm?: string
    lg?: string
  }
}

/**
 * route should be in the form of /route
 * label if given will override the infered label
 * the infered label will in the form Route (with the first / removed)
 */
type NavItem = {
  route: string
  label?: string
}

const navItems: NavItem[] = [
  { route: '/songs' },
  { route: '/lessons' },
  { route: '/freeplay', label: 'Free Play' },
  { route: '/about' },
]
const homeItem: NavItem = { route: '/', label: 'SIGHTREAD' }
/** 
 * Appbar is two appbars, 
   one for mobile optimization, 
   they are switched by setting display: none at the media BP 

   navItem: addto the common NavItems
 * */
interface AppBarProps {
  classNames?: Classes
  style?: CSSProperties
}
export default function AppBar({ classNames, style }: AppBarProps) {
  return (
    <Container
      style={{
        // This is a hack that accounts for the sometimes present scrollbar.
        // The 100vw includes scrollbar and the 100% does not, so we padLeft the difference.
        // Credit goes to: https://aykevl.nl/2014/09/fix-jumping-scrollbar
        paddingLeft: 'calc((100vw - 100%))',

        height: 60,
        backgroundColor: '#292929',
        display: 'flex',
        ...style,
      }}
    >
      <div className={clsx(classes.appBarLarge, classes.appBar, classNames?.appBar?.lg)}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Link href={homeItem.route}>
            <a
              className={clsx(classes.navItem, classNames?.navItem?.lg)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Logo />
              <Sizer width={16} />
              <span style={{ fontWeight: 200, fontSize: 30, letterSpacing: 1 }}>
                {homeItem.label}
              </span>
            </a>
          </Link>
          <Sizer width={50} />
          {navItems.map((nav, i) => {
            const label = inferLabel(nav)
            return (
              <Link href={nav.route} key={i}>
                <a className={clsx(classes.navItem, classNames?.navItem?.lg)}>{label}</a>
              </Link>
            )
          })}
        </span>
      </div>
      <div className={clsx(classes.appBarSmall, classes.appBar)}>
        <Link href="/">
          <a
            className={clsx(classes.navItemSmall, classNames?.navItem?.sm)}
            style={{ color: 'white', display: 'flex', alignItems: 'center' }}
          >
            <Logo />
            <Sizer width={16} />
            <span style={{ fontWeight: 200, fontSize: 24, letterSpacing: 1 }}>SIGHTREAD</span>
          </a>
        </Link>
        <Dropdown
          target={
            <MenuIcon
              height={35}
              width={35}
              className={classes.menuIcon}
              style={{ paddingRight: 24 }}
            />
          }
        >
          {navItems.map((nav, i) => {
            const label = inferLabel(nav)
            return (
              <Link href={nav.route} key={i}>
                <a className={clsx(classes.navItemSmall, classNames?.navItem?.sm)}>{label}</a>
              </Link>
            )
          })}
        </Dropdown>
      </div>
    </Container>
  )
}

/* used in the mobile appbar menu */
function Dropdown({
  children,
  target,
  style,
}: React.PropsWithChildren<{ target: React.ReactElement; style?: CSSProperties }>) {
  const [open, setOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const toggleOpen = () => {
    setOpen(!open)
  }

  return (
    <div style={style}>
      <span onClick={toggleOpen}>{target}</span>
      <div style={{ position: 'relative' }}>
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: open ? '10px 0px' : 0,
            height: open ? '' : 0,
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
