import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Sightread: Free Play',
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return children
}
