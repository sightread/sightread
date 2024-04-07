import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Sightread: Playing',
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return children
}
