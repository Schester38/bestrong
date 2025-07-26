// Utilitaire de géolocalisation par IP (client-side)
export async function getUserCountry() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code || null; // Ex: 'CM', 'FR', 'US', etc.
  } catch {
    return null;
  }
}

export function getAbonnementPrixByCountry(countryCode?: string) {
  if (!countryCode) return '1000 FCFA'; // défaut Afrique
  // Afrique francophone
  const afrique = [
    'CM','SN','CI','BF','GA','NE','ML','TD','GN','BJ','CG','CD','CF','TG','MG','RW','BI','DJ','KM','GQ','CG','TD','CF','TD','TD','TD'
  ];
  if (afrique.includes(countryCode)) return '1000 FCFA';
  // Europe
  const europe = [
    'FR','BE','CH','LU','DE','IT','ES','PT','NL','PL','RU','AT','IE','FI','DK','SE','NO','CZ','SK','HU','RO','BG','GR','SI','HR','LT','LV','EE'
  ];
  if (europe.includes(countryCode)) return '5€';
  // Amérique du Nord
  if (['US','CA'].includes(countryCode)) return '$5';
  // Par défaut
  return '1000 FCFA';
  // Note : Pour PayPal, le prix est toujours 5€ ou 5$ quel que soit le pays
} 