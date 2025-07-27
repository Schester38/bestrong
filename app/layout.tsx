import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "BE STRONG - Augmentez votre visibilité TikTok",
  description: "Plateforme éthique pour augmenter votre visibilité TikTok avec des échanges organiques, analytics et conseils d'optimisation",
  keywords: "TikTok, followers, likes, vues, engagement, croissance, visibilité",
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  // Optimisations de performance
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "BE STRONG - Augmentez votre visibilité TikTok",
    description: "Plateforme éthique pour augmenter votre visibilité TikTok",
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BE STRONG" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        
        {/* Preload des ressources critiques */}
        <link rel="preload" href="/icon-512.png" as="image" type="image/png" />
        <link rel="preload" href="/globals.css" as="style" />
        
        {/* DNS prefetch pour les domaines externes */}
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="dns-prefetch" href="//netlify.app" />
        
        {/* Preconnect pour les connexions importantes */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="preconnect" href="https://netlify.app" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Providers>
          {children}
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Optimisation du service worker avec cache intelligent
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                  })
                  .then(function(registration) {
                    console.log('SW registered successfully:', registration.scope);
                    
                    // Vérifier les mises à jour
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nouvelle version disponible
                            console.log('Nouvelle version disponible');
                          }
                        });
                      }
                    });
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed:', registrationError);
                  });
                });
              }
              
              // Optimisations de performance
              if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                  // Charger les ressources non critiques en arrière-plan
                  const preloadLinks = [
                    '/icon-512-maskable.png',
                    '/icon-512-any.png'
                  ];
                  
                  preloadLinks.forEach(href => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = href;
                    document.head.appendChild(link);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
