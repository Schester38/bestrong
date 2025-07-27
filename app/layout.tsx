import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import NavigationArrows from './components/NavigationArrows'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BE STRONG - Plateforme de motivation et fitness',
  description: 'Rejoignez la communauté BE STRONG pour atteindre vos objectifs fitness et motivation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <NavigationArrows />
        </Providers>
      </body>
    </html>
  )
}
