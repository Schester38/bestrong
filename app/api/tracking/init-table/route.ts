import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// POST - Initialiser la table task_tracking
export async function POST(request: NextRequest) {
  try {
    // Vérifier si la table existe en essayant de récupérer un enregistrement
    const { data, error } = await supabase
      .from('task_tracking')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Table task_tracking non trouvée, création nécessaire:', error);
      return NextResponse.json({ 
        error: "Table task_tracking non trouvée. Veuillez la créer manuellement dans Supabase.",
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Table task_tracking existe déjà",
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Erreur vérification table task_tracking:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la vérification de la table",
      details: error
    }, { status: 500 });
  }
}

// GET - Vérifier le statut de la table
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('task_tracking')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        exists: false,
        error: error.message
      });
    }

    return NextResponse.json({ 
      exists: true,
      message: "Table task_tracking opérationnelle"
    });

  } catch (error) {
    return NextResponse.json({ 
      exists: false,
      error: "Erreur lors de la vérification"
    });
  }
} 