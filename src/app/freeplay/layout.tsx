import { PropsWithChildren } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sightread: Free Play',
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return children
}
