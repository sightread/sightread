import { PropsWithChildren } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sightread: Phrases',
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return children
}
