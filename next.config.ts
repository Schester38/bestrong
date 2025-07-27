import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	devIndicators: false,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	trailingSlash: true,
	images: {
		unoptimized: true,
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
	},
	// Optimisations de performance
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	// Headers de sécurité
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
				],
			},
			{
				source: '/api/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate',
					},
				],
			},
		];
	},
	// Exclure les API routes de l'export statique
	async rewrites() {
		return [];
	},
	// Ignorer les fichiers statiques lors du build
	pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
	// Configuration pour éviter les erreurs de build
	onDemandEntries: {
		maxInactiveAge: 25 * 1000,
		pagesBufferLength: 2,
	},
};

export default nextConfig;
