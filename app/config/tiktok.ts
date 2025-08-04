// Configuration TikTok API - SÉCURISÉ
export const TIKTOK_CONFIG = {
  // Clés d'API - Variables d'environnement OBLIGATOIRES
  CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY || '',
  CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET || '',
  
  // URLs TikTok
  AUTH_URL: 'https://www.tiktok.com/auth/authorize/',
  TOKEN_URL: 'https://open.tiktokapis.com/v2/oauth/token/',
  API_BASE_URL: 'https://open.tiktokapis.com/v2/',
  
  // Scopes requis
  SCOPES: [
    'video.publish',
    'photo.publish', 
    'comment.manage',
    'biz.spark.auth',
    'video.list',
    'business.get'
  ].join(','),
  
  // Redirect URI (configuré avec votre domaine Netlify)
  REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI || 'https://mybestrong.netlify.app/api/tiktok/callback',
  
  // Business ID (à configurer)
  BUSINESS_ID: process.env.TIKTOK_BUSINESS_ID || '',
  
  // Webhook Secret (optionnel)
  WEBHOOK_SECRET: process.env.TIKTOK_WEBHOOK_SECRET || ''
};

// Vérification de la configuration
export const validateConfig = () => {
  if (!TIKTOK_CONFIG.CLIENT_KEY) {
    throw new Error('TIKTOK_CLIENT_KEY manquant dans les variables d\'environnement');
  }
  if (!TIKTOK_CONFIG.CLIENT_SECRET) {
    throw new Error('TIKTOK_CLIENT_SECRET manquant dans les variables d\'environnement');
  }
  return true;
};

// URLs d'authentification
export const getAuthUrl = () => {
  validateConfig();
  
  const params = new URLSearchParams({
    client_key: TIKTOK_CONFIG.CLIENT_KEY,
    scope: TIKTOK_CONFIG.SCOPES,
    response_type: 'code',
    redirect_uri: TIKTOK_CONFIG.REDIRECT_URI,
    state: Math.random().toString(36).substring(7)
  });
  
  return `${TIKTOK_CONFIG.AUTH_URL}?${params.toString()}`;
};

// Configuration des headers API
export const getApiHeaders = (accessToken: string, businessId?: string) => {
  validateConfig();
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  if (businessId) {
    headers['X-Business-ID'] = businessId;
  }
  
  return headers;
}; 