import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const url = request.nextUrl.pathname;
    const body = await request.json();

    if (url.endsWith('/login')) {
      // Vérification du mot de passe
      const { password } = body;
      if (!password) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
      
      const { data: admin, error } = await supabase
        .from('admin')
        .select('password_hash')
        .single();

      if (error || !admin) {
        console.error('Erreur récupération admin:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      const valid = await bcrypt.compare(password, admin.password_hash);
      if (valid) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
      }
    } else if (url.endsWith('/change')) {
      // Changement de mot de passe
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
      }

      // Récupérer le mot de passe actuel
      const { data: admin, error: fetchError } = await supabase
        .from('admin')
        .select('password_hash')
        .single();

      if (fetchError || !admin) {
        console.error('Erreur récupération admin:', fetchError);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      // Vérifier l'ancien mot de passe
      const valid = await bcrypt.compare(oldPassword, admin.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Ancien mot de passe incorrect' }, { status: 401 });
      }

      // Hacher le nouveau mot de passe
      const newHash = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase
        .from('admin')
        .update({ password_hash: newHash });

      if (updateError) {
        console.error('Erreur mise à jour mot de passe admin:', updateError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Route non supportée' }, { status: 404 });
  } catch (error) {
    console.error('Erreur POST /api/admin/password:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 