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
		unoptimized: true
	},
	// Exclure les API routes de l'export statique
	async rewrites() {
		return [];
	},
  /* config options here */
};

export default nextConfig;
