import { PropsWithChildren } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sightread: Speed Training',
}

export default function Layout({ children }: PropsWithChildren<{}>) {
  return children
}
