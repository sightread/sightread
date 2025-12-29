import { cn } from '@/utils'
import React, { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import Sizer from './Sizer'

function FooterHeader({ children }: any) {
  return (
    <h3 className="fontleading-6 text-gray-500 flex gap-2 text-sm font-medium whitespace-nowrap">
      {children}
    </h3>
  )
}

function FooterCol({ children, className }: any) {
  return <div className={cn('flex h-full shrink-0 flex-col gap-2', className)}>{children}</div>
}

function FooterLink({ href, children }: any) {
  return (
    <Link
      className="text-muted-foreground hover:text-foreground font-light whitespace-nowrap transition hover:underline hover:underline-offset-4"
      to={href}
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
      className="w-full border-t border-gray-200 bg-foreground/[0.02] dark:border-gray-800 dark:bg-foreground/[0.01]"
      aria-labelledby="footer-heading"
    >
      <Sizer height={8} />
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <MaxWidthWrapper className="mx-auto w-full">
        <Sizer height={8} />
        <div className="grid w-full gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-start">
          <div className="order-2 justify-self-center text-center text-muted-foreground text-xs sm:order-none sm:justify-self-start sm:text-left">
            © 2025 Sightread Studio, LLC. All rights reserved.
          </div>
          <div className="order-1 justify-self-center sm:order-none">
            <div className="grid auto-cols-max grid-cols-2 items-center gap-4 sm:gap-10 md:gap-16">
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
          </div>
          <div className="hidden sm:block" />
        </div>
        <Sizer height={8} />
      </MaxWidthWrapper>
    </footer>
  )
}
