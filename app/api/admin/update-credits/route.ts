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

interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  created_at: string;
  updated_at: string;
  links?: { label: string; url: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId, credits } = await request.json();

    // Validation des données
    if (!userId || credits === undefined || credits < 0) {
      return NextResponse.json(
        { error: 'ID utilisateur et crédits valides requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const oldCredits = currentUser.credits;
    const creditsDifference = credits - oldCredits;

    // Mettre à jour les crédits
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: credits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour crédits:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des crédits' },
        { status: 500 }
      );
    }

    // --- Notification top 50 ---
    try {
      // Charger tous les utilisateurs triés par crédits décroissants
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('credits', { ascending: false })
        .limit(50);

      if (!usersError && allUsers) {
        // Récupérer les 50 premiers
        const top50 = allUsers;
        // Vérifier si l'utilisateur modifié est dans le top 50
        const isInTop50 = top50.some(u => u.id === userId);
        // Vérifier s'il n'a pas de liens personnalisés ou liens vides
        const user = updatedUser;
        const hasNoLinks = !user.links || user.links.length === 0 || user.links.every((l: { label?: string; url?: string }) => !l.label && !l.url);
        if (isInTop50 && hasNoLinks) {
          // Import dynamique pour éviter problème d'import côté API
          const { addNotification } = await import('../../../utils/notifications');
          addNotification(userId, 'invite-links', "Complète tes liens personnalisés pour profiter de plus de visibilité dans le classement !");
        }
      }
    } catch (err) {
      console.error('Erreur notification top 50:', err);
    }
    // --- Fin notification top 50 ---

    // Enregistrer l'activité
    try {
      await fetch(`${request.nextUrl.origin}/api/admin/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: updatedUser.id,
          userPhone: updatedUser.phone,
          userPseudo: updatedUser.pseudo,
          type: creditsDifference > 0 ? 'credits_earned' : 'credits_spent',
          description: creditsDifference > 0 
            ? `Crédits ajoutés par l'administrateur (+${creditsDifference})`
            : `Crédits retirés par l'administrateur (${creditsDifference})`,
          credits: Math.abs(creditsDifference),
          details: {
            oldCredits,
            newCredits: credits,
            difference: creditsDifference,
            action: 'admin_update'
          }
        }),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    }

    return NextResponse.json({
      message: 'Crédits mis à jour avec succès',
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        credits: updatedUser.credits,
        pseudo: updatedUser.pseudo,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des crédits:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 