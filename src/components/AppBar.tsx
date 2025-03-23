'use client'

import { Sizer } from '@/components'
import { GitHub, Logo, Menu } from '@/icons'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
      className="relative flex h-[50px] min-h-[50px] flex-col justify-center bg-purple-dark"
      style={{
        // This is a hack that accounts for the sometimes present scrollbar.
        // The 100vw includes scrollbar and the 100% does not, so we padLeft the difference.
        // Credit goes to: https://aykevl.nl/2014/09/fix-jumping-scrollbar
        paddingLeft: 'calc(100vw - 100%)',
      }}
    >
      <div className="mx-auto flex w-full items-center justify-center pl-6 md:max-w-(--breakpoint-lg)">
        <div
          className="absolute left-5 right-5 top-1/2 z-10 -translate-y-1/2 md:hidden"
          style={{ transform: 'translateY(-50%)' }}
        >
          <SmallWindowNav />
        </div>
        <NavLink href={'/'} className="flex items-baseline text-white hover:text-purple-hover">
          <Logo height={24} width={24} className="relative top-[3px]" />
          <Sizer width={8} />
          <span className="text-2xl font-extralight"> SIGHTREAD</span>
        </NavLink>
        <div className="hidden grow justify-evenly gap-6 whitespace-nowrap pl-16 align-baseline md:flex">
          {navItems.map((nav) => {
            return (
              <NavLink
                className="text-white hover:text-purple-hover"
                href={nav.route}
                key={nav.label}
                label={nav.label}
              />
            )
          })}
          <NavLink
            href={'https://github.com/sightread/sightread'}
            className="ml-auto flex items-center gap-2 pr-8 text-white hover:text-purple-hover lgminus:pr-0"
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
                href={nav.route}
                className={clsx(
                  'inline-block w-fit cursor-pointer px-6 text-2xl text-purple-dark transition hover:text-purple-hover',
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
  props: PropsWithChildren<{ href: string; className?: string; style?: any; label?: string }>,
) {
  const currentRoute = usePathname()
  return (
    <Link
      {...props}
      className={clsx(
        props.className,
        'transition',
        currentRoute === props.href && 'font-bold',
        props.label &&
          'after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:text-transparent after:content-[attr(label)]',
      )}
      data-label={props.label}
    >
      {props.label ?? props.children}
    </Link>
  )
}
