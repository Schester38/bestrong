import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return NextResponse.json({
    message: 'Test des variables d\'environnement',
    variables: {
      supabaseUrl: supabaseUrl ? '✅ Définie' : '❌ Manquante',
      supabaseAnonKey: supabaseAnonKey ? '✅ Définie' : '❌ Manquante',
      vapidPublicKey: vapidPublicKey ? '✅ Définie' : '❌ Manquante',
      siteUrl: siteUrl ? '✅ Définie' : '❌ Manquante'
    },
    values: {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : null,
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : null,
      vapidPublicKey: vapidPublicKey ? `${vapidPublicKey.substring(0, 20)}...` : null,
      siteUrl
    }
  });
} 