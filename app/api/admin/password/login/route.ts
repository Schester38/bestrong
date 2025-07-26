import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
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
  } catch (error) {
    console.error('Erreur POST /api/admin/password/login:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 