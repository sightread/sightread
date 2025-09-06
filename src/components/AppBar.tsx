import { Sizer } from '@/components'
import { GitHub, Logo, Menu } from '@/icons'
import clsx from 'clsx'
import { Link, useLocation } from 'react-router'
import { PropsWithChildren } from 'react'
import { Dropdown } from './Dropdown'

type NavItem = { route: string; label: string }
const navItems: NavItem[] = [
  { route: '/songs', label: 'Learn a song' },
  { route: '/freeplay', label: 'Free play' },
  // TODO: launch phrases.
  // { route: '/training/phrases', label: 'Training' },
  { route: '/about', label: 'About' },
]

export default function AppBar() {
  return (
    <div
      className="bg-purple-dark relative flex h-[50px] min-h-[50px] flex-col justify-center"
      style={{
        // This is a hack that accounts for the sometimes present scrollbar.
        // The 100vw includes scrollbar and the 100% does not, so we padLeft the difference.
        // Credit goes to: https://aykevl.nl/2014/09/fix-jumping-scrollbar
        paddingLeft: 'calc(100vw - 100%)',
      }}
    >
      <div className="mx-auto flex w-full items-center justify-center pl-6 md:max-w-(--breakpoint-lg)">
        <div className="absolute top-1/2 right-5 left-5 z-10 -translate-y-1/2 md:hidden">
          <SmallWindowNav />
        </div>
        <NavLink to={'/'} className="hover:text-purple-hover flex items-baseline text-white">
          <Logo height={24} width={24} className="relative top-[3px]" />
          <Sizer width={8} />
          <span className="text-2xl font-extralight"> SIGHTREAD</span>
        </NavLink>
        <div className="hidden grow justify-evenly gap-6 pl-16 align-baseline whitespace-nowrap md:flex">
          {navItems.map((nav) => {
            return (
              <NavLink
                className="hover:text-purple-hover text-white"
                to={nav.route}
                key={nav.label}
                label={nav.label}
              />
            )
          })}
          <NavLink
            to={'https://github.com/sightread/sightread'}
            className="hover:text-purple-hover lgminus:pr-0 ml-auto flex items-center gap-2 pr-8 text-white"
          >
            <GitHub size={16} className="t-[2px] relative" />
            GitHub
          </NavLink>
        </div>
      </div>
    </div>
  )
}

function SmallWindowNav() {
  return (
    <Dropdown target={<Menu height={24} width={24} className="block text-white" />}>
      <div className="flex flex-col bg-white">
        {navItems.map((nav, i) => {
          return (
            <div className="items-enter flex flex-col gap-4 px-3 py-3" key={i}>
              <NavLink
                to={nav.route}
                className={clsx(
                  'text-purple-dark hover:text-purple-hover inline-block w-fit cursor-pointer px-6 text-2xl transition',
                )}
                label={nav.label}
              />
            </div>
          )
        })}
      </div>
    </Dropdown>
  )
}

function NavLink(
  props: PropsWithChildren<{ to: string; className?: string; style?: any; label?: string }>,
) {
  const currentRoute = useLocation().pathname
  return (
    <Link
      {...props}
      className={clsx(
        props.className,
        'transition',
        currentRoute === props.to && 'font-bold',
        props.label &&
        'after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:text-transparent after:content-[attr(label)]',
      )}
      data-label={props.label}
    >
      {props.label ?? props.children}
    </Link>
  )
}
