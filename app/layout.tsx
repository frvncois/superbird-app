// Update app/layout.tsx to include the modal provider
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ModalProvider } from '@/components/modals/modal-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Superbird - Website Management Platform',
  description: 'Professional website management platform for developers, designers and agencies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ModalProvider />
        </AuthProvider>
      </body>
    </html>
  )
}