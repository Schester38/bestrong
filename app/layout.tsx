import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import NavigationArrows from './components/NavigationArrows'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import PWAInstallInstructions from './components/PWAInstallInstructions'
import PWAStatus from './components/PWAStatus'

export const metadata: Metadata = {
  title: 'BE STRONG - Plateforme de motivation et fitness',
  description: 'Rejoignez la communauté BE STRONG pour atteindre vos objectifs fitness et motivation',
  manifest: '/manifest.json',
  themeColor: '#ec4899',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BE STRONG',
    startupImage: [
      {
        url: '/icon-512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/icon-512.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/icon-512.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  icons: {
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-maskable.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/icon-512.png'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BE STRONG',
    'application-name': 'BE STRONG',
    'msapplication-TileColor': '#ec4899',
    'msapplication-config': '/browserconfig.xml'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BE STRONG" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="BE STRONG" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="light" />
        <meta name="background-color" content="#ec4899" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="mask-icon" href="/icon-maskable.png" color="#ec4899" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <NavigationArrows />
          <PWAInstallPrompt />
          <PWAInstallInstructions />
          <PWAStatus />
        </Providers>
      </body>
    </html>
  )
}
