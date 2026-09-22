import type { ReactNode } from 'react'
import QueryProvider from './_components/QueryProvider'

type ReactQueryExperimentLayoutProps = {
  children: ReactNode
}

export default function ReactQueryExperimentLayout({
  children,
}: ReactQueryExperimentLayoutProps) {
  return <QueryProvider>{children}</QueryProvider>
}
