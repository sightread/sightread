import { Sizer } from '@/components'
import { LucideGithub as GitHub, Logo, Menu, Youtube } from '@/icons'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'
import { Button, MenuItem, MenuTrigger, Menu as RacMenu, Separator } from 'react-aria-components'
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
        <Link to={'/'} className="hover:text-purple-hover flex items-baseline text-white">
          <Logo height={24} width={24} className="relative top-[3px]" />
          <Sizer width={8} />
          <span className="text-2xl font-extralight"> SIGHTREAD</span>
        </Link>
        <div className="hidden grow justify-evenly gap-6 pl-16 align-baseline whitespace-nowrap md:flex">
          {navItems.map((nav) => {
            return (
              <NavItem
                to={nav.route}
                key={nav.label}
                label={nav.label}
                activeClassName="bg-violet-700/90 text-white"
              />
            )
          })}
          <div className="ml-auto flex items-center gap-3 pr-8 lg:pr-0">
            <NavIconButton
              to={'https://www.youtube.com/channel/UCGf2AlCRD3ZCc8ahkqBMtqA'}
              label="YouTube"
              title="YouTube"
            >
              <Youtube size={20} />
            </NavIconButton>
            <NavIconButton
              to={'https://github.com/sightread/sightread'}
              label="GitHub"
              title="GitHub"
            >
              <GitHub size={20} />
            </NavIconButton>
          </div>
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
      <Button aria-label="Open menu" className="inline-flex">
        <Menu height={24} width={24} className="block text-white" />
      </Button>
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
            aria-label="GitHub"
          >
            <GitHub size={18} className="t-[2px] relative" />
            <span className="sr-only">GitHub</span>
          </MenuItem>
          <MenuItem
            href="https://www.youtube.com/channel/UCGf2AlCRD3ZCc8ahkqBMtqA"
            target="_blank"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition outline-none data-[focused]:bg-white/15 data-[pressed]:bg-white/10"
            aria-label="YouTube"
          >
            <Youtube size={18} />
            <span className="sr-only">YouTube</span>
          </MenuItem>
        </RacMenu>
      </Popover>
    </MenuTrigger>
  )
}

function NavItem(
  props: PropsWithChildren<{
    to: string
    className?: string
    label: string
    activeClassName?: string
  }>,
) {
  const currentRoute = useLocation().pathname
  return (
    <Link
      to={props.to}
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700/90 active:bg-violet-800/90',
        props.className,
        currentRoute === props.to && (props.activeClassName || 'font-bold'),
      )}
    >
      {props.label}
    </Link>
  )
}

function NavIconButton(
  props: PropsWithChildren<{ to: string; label: string; title?: string; className?: string }>,
) {
  return (
    <Link
      to={props.to}
      aria-label={props.label}
      title={props.title ?? props.label}
      className={clsx(
        'hover:text-purple-hover flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-violet-700/90 active:bg-violet-800/90',
        props.className,
      )}
    >
      {props.children}
      <span className="sr-only">{props.label}</span>
    </Link>
  )
}
