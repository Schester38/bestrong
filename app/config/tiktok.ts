// Configuration TikTok API
export const TIKTOK_CONFIG = {
  // Clés d'API
  CLIENT_KEY: 'awa475usd401dv8x',
  CLIENT_SECRET: 'YAvRoNIraJjdeGaoC2rvGJ1XRwkAoymX',
  
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
  
  // Redirect URI (à configurer selon votre domaine)
  REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI || 'https://your-domain.com/api/tiktok/callback',
  
  // Business ID (à configurer)
  BUSINESS_ID: process.env.TIKTOK_BUSINESS_ID || 'your_business_id',
  
  // Webhook Secret (optionnel)
  WEBHOOK_SECRET: process.env.TIKTOK_WEBHOOK_SECRET || 'your_webhook_secret'
};

// URLs d'authentification
export const getAuthUrl = () => {
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
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  if (businessId) {
    headers['X-Business-ID'] = businessId;
  }
  
  return headers;
}; 