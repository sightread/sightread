import { Sizer } from '@/components'
import { LucideGithub as GitHub, Logo, Menu } from '@/icons'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'
import { MenuItem, MenuTrigger, Pressable, Menu as RacMenu, Separator } from 'react-aria-components'
import { Link, useLocation, useNavigate } from 'react-router'
import { Popover } from './Popover'

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
      className="relative flex h-[50px] min-h-[50px] flex-col justify-center bg-violet-600 shadow-sm"
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
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700/90 active:bg-violet-800/90"
                to={nav.route}
                key={nav.label}
                label={nav.label}
                activeClassName="bg-violet-700/90 text-white"
              />
            )
          })}
          <NavLink
            to={'https://github.com/sightread/sightread'}
            className="hover:text-purple-hover ml-auto flex items-center gap-2 pr-8 text-white lg:pr-0"
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
  const navigate = useNavigate()
  const currentRoute = useLocation().pathname
  return (
    <MenuTrigger>
      <Pressable>
        <button aria-label="Open menu">
          <Menu height={24} width={24} className="block text-white" />
        </button>
      </Pressable>
      <Popover className="w-[min(90vw,360px)] rounded-2xl border border-white/10 bg-violet-900/95 p-2 shadow-xl backdrop-blur">
        <RacMenu className="outline-none">
          {navItems.map((nav) => {
            return (
              <MenuItem
                key={nav.label}
                onAction={() => navigate(nav.route)}
                className={clsx(
                  'flex w-full items-center rounded-xl px-3 py-2 text-base font-medium text-white/90 transition outline-none',
                  'data-[focused]:bg-white/15 data-[pressed]:bg-white/10',
                )}
              >
                {nav.label}
              </MenuItem>
            )
          })}
          <Separator className="mx-2 my-1 border-t border-white/10" />
          <MenuItem
            href="https://github.com/sightread/sightread"
            target="_blank"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition outline-none data-[focused]:bg-white/15 data-[pressed]:bg-white/10"
          >
            <GitHub size={16} className="t-[2px] relative" />
            GitHub
          </MenuItem>
        </RacMenu>
      </Popover>
    </MenuTrigger>
  )
}

function NavLink(
  props: PropsWithChildren<{
    to: string
    className?: string
    style?: any
    label?: string
    activeClassName?: string
  }>,
) {
  const currentRoute = useLocation().pathname
  return (
    <Link
      {...props}
      className={clsx(
        props.className,
        'transition',
        currentRoute === props.to && (props.activeClassName || 'font-bold'),
        props.label &&
          'after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:text-transparent after:content-[attr(label)]',
      )}
      data-label={props.label}
    >
      {props.label ?? props.children}
    </Link>
  )
}
