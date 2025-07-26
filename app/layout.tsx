import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "BE STRONG - Augmentez votre visibilité TikTok",
  description: "Plateforme éthique pour augmenter votre visibilité TikTok avec des échanges organiques, analytics et conseils d'optimisation",
  keywords: "TikTok, followers, likes, vues, engagement, croissance, visibilité",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
