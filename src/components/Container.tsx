import React, { CSSProperties, PropsWithChildren } from 'react'
import { breakpoints } from '@/utils'

type ContainerProps = {
  style?: CSSProperties
  className?: string
  component?: string | React.ElementType
}

export function Container({
  children,
  style,
  className = '',
  component: Component = 'div',
}: PropsWithChildren<ContainerProps>) {
  const containerStyle = { position: 'relative', ...style }
  const innerStyle = { margin: 'auto', maxWidth: breakpoints.md, width: '100%' }

  return (
    <Component className={className} style={containerStyle}>
      <div style={innerStyle}>{children}</div>
    </Component>
  )
}
