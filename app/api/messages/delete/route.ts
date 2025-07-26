import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { error, count } = await supabase
      .from('messages')
      .delete()
      .or(`and(from.eq.${normalizedUser},to.eq.${normalizedContact}),and(from.eq.${normalizedContact},to.eq.${normalizedUser})`);

    if (error) {
      console.error('Erreur suppression messages:', error);
      return NextResponse.json({ error: 'Erreur lors de la suppression des messages' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, messagesRemoved: count || 0 });
  } catch (error) {
    console.error('Erreur lors de la suppression des messages:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression des messages' }, { status: 500 });
  }
}