import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  try {
  console.log('API messages GET appelée');
  const url = new URL(request.url);
  const user = url.searchParams.get('user');
  console.log('Paramètre user:', user);
  if (!user) return NextResponse.json({ error: 'Paramètre user requis' }, { status: 400 });
  
  const normalizedUser = normalizePhone(user);
  console.log('User normalisé:', normalizedUser);
  
    // Test simple d'abord
    console.log('Test connexion Supabase...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test avec une requête simple
    const { data: testData, error: testError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('Erreur test table messages:', testError);
      return NextResponse.json({ 
        error: 'Erreur table messages', 
        details: testError.message 
      }, { status: 500 });
    }
    
    console.log('Test réussi, données:', testData);
  
    // Utiliser une approche différente pour la requête OR
    const { data: messagesFrom, error: errorFrom } = await supabase
      .from('messages')
      .select('*')
      .eq('from_user', normalizedUser);

    const { data: messagesTo, error: errorTo } = await supabase
      .from('messages')
      .select('*')
      .eq('to_user', normalizedUser);

    if (errorFrom || errorTo) {
      console.error('Erreur récupération messages:', errorFrom || errorTo);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des messages',
        details: errorFrom?.message || errorTo?.message
      }, { status: 500 });
    }

    const messages = [...(messagesFrom || []), ...(messagesTo || [])];
    messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Transformer les données pour correspondre au format attendu par le frontend
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      from: msg.from_user,
      to: msg.to_user,
      message: msg.message,
      date: msg.date,
      lu: msg.lu
    }));
  
    console.log('Messages récupérés:', transformedMessages?.length || 0);
    return NextResponse.json(transformedMessages || []);
  } catch (error) {
    console.error('Erreur générale GET /api/messages:', error);
    return NextResponse.json({ 
      error: 'Erreur générale',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
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
      from_user: from,
      to_user: to,
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