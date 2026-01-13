import { cn } from '@/utils'
import React, { PropsWithChildren } from 'react'
import Sizer from './Sizer'

function MaxWidthWrapper(props: PropsWithChildren<{ as?: any; className?: string }>) {
  const className = (props.className ?? '') + ' max-w-(--breakpoint-lg) mx-auto px-8'
  const Component = props.as ?? 'div'
  return <Component className={className}>{props.children}</Component>
}

export function MarketingFooter() {
  return (
    <footer
      className="bg-foreground/[0.02] dark:bg-foreground/[0.01] w-full border-t border-gray-200 dark:border-gray-800"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <MaxWidthWrapper className="mx-auto w-full py-4">
        <div className="text-muted-foreground text-center text-xs sm:text-left">
          © 2025 Sightread Studio, LLC. All rights reserved.
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}
