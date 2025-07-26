import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Ajouter une fonction de normalisation des numéros de téléphone
function normalizePhone(phone: string): string {
  // Enlever tous les espaces et caractères spéciaux
  let normalized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Si le numéro commence par 237, ajouter le +
  if (normalized.startsWith('237') && !normalized.startsWith('+237')) {
    normalized = '+' + normalized;
  }
  
  // Si le numéro commence par 6, 7, 8, 9 (numéro camerounais) sans indicatif, ajouter +237
  if (/^[6789]/.test(normalized) && !normalized.startsWith('+') && !normalized.startsWith('237')) {
    normalized = '+237' + normalized;
  }
  
  // Debug: afficher la normalisation
  console.log(`normalizePhone: "${phone}" -> "${normalized}"`);
  
  return normalized;
}

// GET /api/messages?user=xxx
export async function GET(request: NextRequest) {
  console.log('API messages GET appelée');
  const url = new URL(request.url);
  const user = url.searchParams.get('user');
  console.log('Paramètre user:', user);
  if (!user) return NextResponse.json({ error: 'Paramètre user requis' }, { status: 400 });
  
  const normalizedUser = normalizePhone(user);
  console.log('User normalisé:', normalizedUser);
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`from.eq.${normalizedUser},to.eq.${normalizedUser}`)
    .order('date', { ascending: true });

  if (error) {
    console.error('Erreur récupération messages:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
  }

  console.log('Messages récupérés:', messages?.length || 0);
  return NextResponse.json(messages || []);
}

// POST /api/messages
export async function POST(request: NextRequest) {
  try {
    const { from, to, message } = await request.json();
    if (!from || !to || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const newMsg = {
      id: Date.now().toString(),
      from,
      to,
      message,
      date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(newMsg)
      .select()
      .single();

    if (error) {
      console.error('Erreur création message:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/messages:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
  }
} 