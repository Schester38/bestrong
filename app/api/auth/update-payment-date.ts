import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    
    const { error } = await supabase
      .from('users')
      .update({ 
        date_dernier_paiement: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Erreur mise à jour date paiement:', error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST /api/auth/update-payment-date:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 