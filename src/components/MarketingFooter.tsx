import { cn } from '@/utils'
import Link from 'next/link'
import React, { PropsWithChildren } from 'react'
import Sizer from './Sizer'

function FooterHeader({ children }: any) {
  return (
    <h3 className="fontleading-6 text-foreground flex gap-2 text-base font-medium whitespace-nowrap">
      {children}
    </h3>
  )
}

function FooterCol({ children, className }: any) {
  return <div className={cn('flex h-full shrink-0 flex-col gap-4', className)}>{children}</div>
}

function FooterLink({ href, children }: any) {
  return (
    <Link
      className="text-muted-foreground hover:text-foreground font-light whitespace-nowrap transition hover:underline hover:underline-offset-4"
      href={href}
    >
      {children}
    </Link>
  )
}
function MaxWidthWrapper(props: PropsWithChildren<{ as?: any; className?: string }>) {
  const className = (props.className ?? '') + ' max-w-(--breakpoint-lg) mx-auto px-8'
  const Component = props.as ?? 'div'
  return <Component className={className}>{props.children}</Component>
}

export function MarketingFooter() {
  return (
    <footer
      className="border-border bg-foreground/[0.02] dark:bg-foreground/[0.01] w-full border-t"
      aria-labelledby="footer-heading"
    >
      <Sizer height={24} />
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <MaxWidthWrapper className="mx-auto flex h-full max-w-prose flex-col items-center">
        <Sizer height={16} />
        <div className="grid auto-cols-max grid-cols-2 items-center gap-8 sm:gap-16 md:gap-32">
          <FooterCol>
            <FooterHeader>sightread</FooterHeader>
            <FooterLink href="/songs">learn</FooterLink>
            <FooterLink href="/freeplay">free play</FooterLink>
            <FooterLink href="/about">about</FooterLink>
          </FooterCol>
          <FooterCol>
            <FooterHeader>external links</FooterHeader>
            <FooterLink href="https://www.youtube.com/channel/UCGf2AlCRD3ZCc8ahkqBMtqA">
              youtube
            </FooterLink>
            <FooterLink href="https://github.com/sightread/sightread">github</FooterLink>
          </FooterCol>
        </div>
        <Sizer height={32} />
        <span className="text-muted-foreground text-xs">
          © 2025 Sightread Studio, LLC. All rights reserved.
        </span>

        <Sizer height={24} />
      </MaxWidthWrapper>
    </footer>
  )
}
