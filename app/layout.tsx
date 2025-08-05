import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import NavigationArrows from './components/NavigationArrows'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import PWAInstallInstructions from './components/PWAInstallInstructions'
import PWAStatus from './components/PWAStatus'
import { GlobalAnimations } from './components/GlobalAnimations'
import ScrollToTop from './components/ScrollToTop'

export const metadata: Metadata = {
  title: 'BE STRONG - Plateforme de motivation et fitness | Développez votre compte TikTok',
  description: 'Rejoignez la communauté BE STRONG pour atteindre vos objectifs fitness et motivation. Échangez des tâches TikTok, analysez vos performances et développez votre audience organiquement. Plus de 1000+ utilisateurs actifs.',
  keywords: 'TikTok, fitness, motivation, échange de tâches, croissance organique, communauté, développement personnel, réseaux sociaux, engagement, followers',
  authors: [{ name: 'BE STRONG Team' }],
  creator: 'BE STRONG',
  publisher: 'BE STRONG',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mybestrong.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BE STRONG - Développez votre compte TikTok organiquement',
    description: 'Plateforme éthique pour augmenter votre visibilité TikTok avec des échanges organiques, analytics et conseils d\'optimisation',
    url: 'https://mybestrong.netlify.app',
    siteName: 'BE STRONG',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BE STRONG - Plateforme TikTok',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BE STRONG - Développez votre compte TikTok organiquement',
    description: 'Plateforme éthique pour augmenter votre visibilité TikTok avec des échanges organiques',
    images: ['/og-image.png'],
    creator: '@bestrong_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BE STRONG',
    startupImage: [
      {
        url: '/icon-512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon-512.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon-512.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-maskable.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon-512.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BE STRONG',
    'application-name': 'BE STRONG',
    'msapplication-TileColor': '#ec4899',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ec4899',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
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
        <meta name="splash-screen" content="disabled" />
        <meta name="startup-image" content="disabled" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="mask-icon" href="/icon-maskable.png" color="#ec4899" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <GlobalAnimations>
            {/* Fond constellation global */}
            <div className="fixed inset-0 constellation-bg pointer-events-none z-0"></div>
            {children}
            <NavigationArrows />
            <PWAInstallPrompt />
            <PWAInstallInstructions />
            <PWAStatus />
            <ScrollToTop />
          </GlobalAnimations>
        </Providers>
      </body>
    </html>
  )
}
