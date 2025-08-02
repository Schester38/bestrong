import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans route.ts:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// Fonction de normalisation des numéros de téléphone
function normalizePhone(phone: string): string {
  if (!phone) return '';
  
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
  
  return normalized;
}

// POST /api/messages/delete
export async function POST(request: NextRequest) {
  try {
    const { user, contact } = await request.json();
    
    if (!user || !contact) {
      return NextResponse.json({ error: 'Utilisateur et contact requis' }, { status: 400 });
    }
    
    const normalizedUser = normalizePhone(user);
    const normalizedContact = normalizePhone(contact);
    
    // Supprimer les messages entre ces deux utilisateurs
    const { error: error1 } = await supabase
      .from('messages')
      .delete()
      .eq('from_user', normalizedUser)
      .eq('to_user', normalizedContact);

    const { error: error2 } = await supabase
      .from('messages')
      .delete()
      .eq('from_user', normalizedContact)
      .eq('to_user', normalizedUser);

    const error = error1 || error2;

    if (error) {
      console.error('Erreur suppression messages:', error);
      return NextResponse.json({ error: 'Erreur lors de la suppression des messages' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, messagesRemoved: 0 });
  } catch (error) {
    console.error('Erreur lors de la suppression des messages:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression des messages' }, { status: 500 });
  }
}