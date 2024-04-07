import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Sightread: Speed Training',
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return children
}
